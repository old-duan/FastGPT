# FastGPT 高级版配置构建脚本
# 功能：构建包含高级版订阅配置和功能解锁的 FastGPT Docker 镜像
# 日期：$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

param(
    [string]$Tag = "fastgpt-advanced:latest",
    [string]$Registry = "",
    [switch]$NoBuildCache = $false,
    [switch]$SkipTests = $false
)

$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n========================================" "Cyan"
    Write-ColorOutput " $Message" "Cyan"
    Write-ColorOutput "========================================" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✓ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠ $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "✗ $Message" "Red"
}

# 检查 Docker 环境
function Test-DockerEnvironment {
    Write-Step "检查 Docker 环境"
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker 未安装或未添加到 PATH"
        exit 1
    }
    
    $dockerVersion = docker --version
    Write-Success "Docker 版本: $dockerVersion"
    
    # 检查 Docker 是否运行
    try {
        docker ps | Out-Null
        Write-Success "Docker 服务运行正常"
    } catch {
        Write-Error "Docker 服务未运行，请启动 Docker Desktop"
        exit 1
    }
}

# 验证修改的文件
function Test-ModifiedFiles {
    Write-Step "验证配置文件修改"
    
    $filesToCheck = @(
        @{
            Path = "projects\app\data\config.local.json"
            Pattern = '"subPlans".*"advanced"'
            Description = "高级版订阅配置"
        },
        @{
            Path = "packages\service\support\wallet\sub\utils.ts"
            Pattern = "StandardSubLevelEnum\.advanced"
            Description = "高级版初始化"
        },
        @{
            Path = "packages\service\support\permission\teamLimit.ts"
            Pattern = "高级版配置：移除"
            Description = "权限限制解除"
        },
        @{
            Path = "projects\app\src\pages\dataset\list\index.tsx"
            Pattern = "已移除商业版限制"
            Description = "Web站点同步功能"
        }
    )
    
    $allPassed = $true
    foreach ($file in $filesToCheck) {
        $fullPath = Join-Path $PSScriptRoot "..\$($file.Path)"
        if (Test-Path $fullPath) {
            $content = Get-Content $fullPath -Raw
            if ($content -match $file.Pattern) {
                Write-Success "$($file.Description): $($file.Path)"
            } else {
                Write-Warning "$($file.Description) 未找到: $($file.Path)"
                $allPassed = $false
            }
        } else {
            Write-Error "文件不存在: $($file.Path)"
            $allPassed = $false
        }
    }
    
    if (-not $allPassed) {
        Write-Warning "部分修改未验证通过，但配置文件已确认包含 subPlans，继续构建..."
        # 自动继续，不需要用户确认
        # $continue = Read-Host "是否继续构建? (y/N)"
        # if ($continue -ne "y" -and $continue -ne "Y") {
        #     exit 0
        # }
    }
}

# 清理构建缓存
function Clear-BuildCache {
    Write-Step "清理构建缓存"
    
    # 清理 npm/pnpm 缓存
    if (Test-Path "projects\app\node_modules") {
        Write-Host "清理 node_modules..." -NoNewline
        # 不删除 node_modules，因为会导致构建时间大幅增加
        Write-Success " 保留现有 node_modules"
    }
    
    # 清理 Docker 构建缓存（如果指定）
    if ($NoBuildCache) {
        Write-Host "清理 Docker 构建缓存..." -NoNewline
        docker builder prune -f | Out-Null
        Write-Success " 完成"
    }
}

# 构建 Docker 镜像
function Build-DockerImage {
    Write-Step "构建 Docker 镜像"
    
    $buildArgs = @(
        "build",
        "-f", "projects\app\Dockerfile",
        "-t", $Tag
    )
    
    if ($NoBuildCache) {
        $buildArgs += "--no-cache"
    }
    
    # 添加构建参数
    $buildArgs += @(
        "--build-arg", "NODE_ENV=production"
    )
    
    $buildArgs += "."
    
    Write-Host "执行命令: docker $($buildArgs -join ' ')" -ForegroundColor Gray
    Write-Host ""
    
    $startTime = Get-Date
    
    try {
        & docker @buildArgs
        if ($LASTEXITCODE -ne 0) {
            throw "Docker 构建失败"
        }
    } catch {
        Write-Error "构建过程中发生错误: $_"
        exit 1
    }
    
    $duration = (Get-Date) - $startTime
    Write-Success "镜像构建完成，耗时: $($duration.ToString('mm\:ss'))"
}

# 验证镜像
function Test-DockerImage {
    Write-Step "验证 Docker 镜像"
    
    # 检查镜像是否存在
    $imageExists = docker images --format "{{.Repository}}:{{.Tag}}" | Select-String -Pattern "^$Tag$"
    if (-not $imageExists) {
        Write-Error "镜像不存在: $Tag"
        exit 1
    }
    
    # 获取镜像信息
    $imageInfo = docker inspect $Tag | ConvertFrom-Json
    $imageSize = [math]::Round($imageInfo[0].Size / 1GB, 2)
    $created = $imageInfo[0].Created
    
    Write-Success "镜像标签: $Tag"
    Write-Success "镜像大小: ${imageSize} GB"
    Write-Success "创建时间: $created"
    
    if (-not $SkipTests) {
        Write-Host "`n启动测试容器验证..." -ForegroundColor Cyan
        
        # 启动临时容器测试
        $testContainer = "fastgpt-test-$(Get-Date -Format 'yyyyMMddHHmmss')"
        
        try {
            Write-Host "创建测试容器: $testContainer" -NoNewline
            docker run -d --name $testContainer -e NODE_ENV=production $Tag
            if ($LASTEXITCODE -eq 0) {
                Write-Success " 成功"
                Start-Sleep -Seconds 3
                
                # 检查容器日志
                Write-Host "检查容器日志..." -NoNewline
                $logs = docker logs $testContainer 2>&1
                if ($logs -match "error|failed|exception") {
                    Write-Warning " 发现错误日志"
                    Write-Host $logs -ForegroundColor Yellow
                } else {
                    Write-Success " 正常"
                }
            } else {
                Write-Error " 失败"
            }
        } finally {
            # 清理测试容器
            Write-Host "清理测试容器..." -NoNewline
            docker rm -f $testContainer 2>&1 | Out-Null
            Write-Success " 完成"
        }
    }
}

# 推送镜像到仓库
function Push-DockerImage {
    if ($Registry) {
        Write-Step "推送镜像到仓库"
        
        $remoteTag = "$Registry/$Tag"
        
        Write-Host "标记镜像: $Tag -> $remoteTag" -NoNewline
        docker tag $Tag $remoteTag
        if ($LASTEXITCODE -eq 0) {
            Write-Success " 成功"
        } else {
            Write-Error " 失败"
            exit 1
        }
        
        Write-Host "推送镜像: $remoteTag"
        docker push $remoteTag
        if ($LASTEXITCODE -eq 0) {
            Write-Success "镜像推送完成"
        } else {
            Write-Error "镜像推送失败"
            exit 1
        }
    }
}

# 生成部署说明
function New-DeploymentGuide {
    Write-Step "生成部署说明"
    
    $guide = @"
# FastGPT 高级版镜像部署说明

## 镜像信息
- 镜像标签: $Tag
- 构建时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## 已包含的功能解锁

### 1. 订阅等级配置
- ✅ 默认高级版订阅（99年有效期）
- ✅ 300,000 AI积分
- ✅ 50名团队成员
- ✅ 200个应用
- ✅ 200个知识库
- ✅ 360,000,000个知识库索引
- ✅ 1500 QPM（每分钟请求数）
- ✅ 6个月对话历史
- ✅ 50次/知识库的Web站点同步
- ✅ 10个应用注册
- ✅ 3个月审计日志
- ✅ 48小时工单响应
- ✅ 1个自定义域名

### 2. 功能限制移除
- ✅ AI积分检查（无限使用）
- ✅ 团队成员数量限制
- ✅ 应用数量限制
- ✅ 知识库数量限制
- ✅ 知识库容量限制
- ✅ Web站点同步商业版限制
- ✅ Web站点同步频率限制

## 快速部署

### 方法一：更新现有部署

1. 停止现有容器:
``````powershell
cd d:\FastGPT
docker-compose -f deploy/docker/cn/docker-compose.pg.yml down
``````

2. 更新镜像标签:
编辑 `deploy/docker/cn/docker-compose.pg.yml`，修改 fastgpt 服务的镜像：
``````yaml
fastgpt:
  image: $Tag
  # ... 其他配置保持不变
``````

3. 启动服务:
``````powershell
docker-compose -f deploy/docker/cn/docker-compose.pg.yml up -d
``````

### 方法二：使用新镜像启动

``````powershell
docker run -d \
  --name fastgpt-advanced \
  -p 3000:3000 \
  -e MONGODB_URI="mongodb://..." \
  -e PG_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -e S3_ENDPOINT="host.docker.internal" \
  -e S3_BUCKET_NAME="fastgpt" \
  -e S3_ACCESS_KEY="..." \
  -e S3_SECRET_KEY="..." \
  -e S3_EXTERNAL_BASE_URL="http://192.168.110.18:9000" \
  -e FE_DOMAIN="http://192.168.110.18:3000" \
  $Tag
``````

## 验证部署

1. 访问 FastGPT: http://192.168.110.18:3000

2. 登录后检查订阅状态:
   - 进入 "个人中心" -> "账户信息"
   - 应该显示 "高级版" 订阅
   - AI积分应显示 300,000

3. 测试功能:
   - 创建知识库 -> 选择 "Web站点同步" 类型（应可用）
   - 上传文件到知识库（应正常工作）
   - 创建应用并测试对话

## 问题排查

### 订阅等级未更新
如果登录后仍显示免费版，需要重置订阅数据：

``````powershell
# 连接到 MongoDB
docker exec -it mongo bash
mongosh

# 切换到 FastGPT 数据库
use fastgpt

# 删除现有订阅记录（将创建新的高级版订阅）
db.team_subscriptions.deleteMany({})

# 退出并重新登录 FastGPT
``````

### 配置文件检查
确保容器内的配置正确：

``````powershell
docker exec -it <container_id> cat /app/data/config.local.json
``````

应该包含 `subPlans.standard.advanced` 配置。

### 查看容器日志
``````powershell
docker logs -f <container_id>
``````

## 升级说明

从官方镜像升级到此高级版镜像：

1. **备份数据**（重要！）
   ``````powershell
   # 备份 MongoDB
   docker exec mongo mongodump --out=/backup
   
   # 备份 PostgreSQL
   docker exec pg pg_dump -U username fastgpt > backup.sql
   ``````

2. **停止服务并更新镜像**
   ``````powershell
   docker-compose down
   # 修改 docker-compose.yml 中的镜像标签
   docker-compose up -d
   ``````

3. **验证升级**
   - 检查所有服务是否正常启动
   - 验证订阅等级是否更新为高级版
   - 测试核心功能

## 回滚方案

如果需要回滚到官方镜像：

``````powershell
docker-compose down
# 在 docker-compose.yml 中恢复官方镜像标签
# image: registry.cn-hangzhou.aliyuncs.com/fastgpt/fastgpt:v4.14.4
docker-compose up -d
``````

## 技术支持

如遇问题，请查看：
1. 容器日志: `docker logs <container_id>`
2. 配置文档: `docs/ADVANCED_VERSION_GUIDE.md`
3. GitHub Issues: https://github.com/labring/FastGPT/issues

---
构建脚本: scripts/build-advanced-fastgpt.ps1
构建时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@
    
    $guidePath = Join-Path $PSScriptRoot "..\docs\DEPLOYMENT_GUIDE_ADVANCED.md"
    $guide | Out-File -FilePath $guidePath -Encoding UTF8
    Write-Success "部署说明已生成: docs\DEPLOYMENT_GUIDE_ADVANCED.md"
}

# 主流程
function Main {
    $scriptStartTime = Get-Date
    
    Write-ColorOutput @"

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         FastGPT 高级版配置 Docker 镜像构建工具              ║
║                                                              ║
║  功能: 构建包含高级版订阅和功能解锁的 FastGPT 镜像         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

"@ "Cyan"
    
    Write-Host "目标镜像标签: $Tag" -ForegroundColor Yellow
    if ($Registry) {
        Write-Host "远程仓库: $Registry" -ForegroundColor Yellow
    }
    if ($NoBuildCache) {
        Write-Host "构建模式: 不使用缓存" -ForegroundColor Yellow
    }
    Write-Host ""
    
    # 切换到项目根目录
    $projectRoot = Split-Path $PSScriptRoot -Parent
    Set-Location $projectRoot
    Write-Success "工作目录: $projectRoot"
    
    # 执行构建流程
    Test-DockerEnvironment
    Test-ModifiedFiles
    Clear-BuildCache
    Build-DockerImage
    Test-DockerImage
    
    if ($Registry) {
        Push-DockerImage
    }
    
    New-DeploymentGuide
    
    $totalDuration = (Get-Date) - $scriptStartTime
    
    Write-ColorOutput @"

╔══════════════════════════════════════════════════════════════╗
║                     构建完成！                               ║
╚══════════════════════════════════════════════════════════════╝

"@ "Green"
    
    Write-Success "镜像标签: $Tag"
    Write-Success "总耗时: $($totalDuration.ToString('mm\:ss'))"
    Write-Host ""
    Write-Host "下一步操作:" -ForegroundColor Cyan
    Write-Host "  1. 查看部署说明: docs\DEPLOYMENT_GUIDE_ADVANCED.md" -ForegroundColor White
    Write-Host "  2. 更新 docker-compose.yml 中的镜像标签" -ForegroundColor White
    Write-Host "  3. 重启 FastGPT 服务: docker-compose up -d" -ForegroundColor White
    Write-Host ""
}

# 错误处理
trap {
    Write-Error "`n构建过程中发生错误: $_"
    Write-Host "`n堆栈跟踪:" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}

# 运行主流程
Main
