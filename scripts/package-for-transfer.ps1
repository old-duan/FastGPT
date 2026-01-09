# FastGPT 项目完整打包脚本
# 用途: 打包项目代码、依赖包、环境配置，方便迁移到其他电脑

param(
    [string]$OutputDir = "D:\FastGPT-Package",
    [bool]$IncludeNodeModules = $true,
    [switch]$IncludeDatabase
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FastGPT 项目完整打包工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = "D:\FastGPT"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$PackageName = "FastGPT_Full_$Timestamp"
$PackagePath = Join-Path $OutputDir $PackageName

# 创建输出目录
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Host "📦 开始打包项目..." -ForegroundColor Green
Write-Host "   源目录: $ProjectRoot" -ForegroundColor Gray
Write-Host "   输出目录: $PackagePath" -ForegroundColor Gray
Write-Host ""

# 创建打包目录结构
New-Item -ItemType Directory -Path $PackagePath -Force | Out-Null
New-Item -ItemType Directory -Path "$PackagePath\FastGPT" -Force | Out-Null
New-Item -ItemType Directory -Path "$PackagePath\Docker" -Force | Out-Null
New-Item -ItemType Directory -Path "$PackagePath\Docs" -Force | Out-Null

# 1. 复制项目文件（排除不需要的文件）
Write-Host "📁 [1/7] 复制项目文件..." -ForegroundColor Yellow

$ExcludeDirs = @(
    ".git",
    ".next",
    ".turbo",
    "dist",
    "build",
    ".specstory"
)

if (-not $IncludeNodeModules) {
    $ExcludeDirs += "node_modules"
}

$ExcludeFiles = @(
    "*.log",
    ".DS_Store",
    "Thumbs.db",
    "*.tmp"
)

# 使用 robocopy 复制文件（更快速和可靠）
$robocopyArgs = @(
    "`"$ProjectRoot`"",
    "`"$PackagePath\FastGPT`"",
    "/E",           # 复制所有子目录，包括空目录
    "/NFL",         # 不列出文件名
    "/NDL",         # 不列出目录名
    "/NJH",         # 不显示作业标题
    "/NJS",         # 不显示作业摘要
    "/nc",          # 不显示文件类
    "/ns",          # 不显示文件大小
    "/np"           # 不显示进度百分比
)

# 添加排除目录
foreach ($dir in $ExcludeDirs) {
    $robocopyArgs += "/XD"
    $robocopyArgs += $dir
}

# 添加排除文件
foreach ($file in $ExcludeFiles) {
    $robocopyArgs += "/XF"
    $robocopyArgs += $file
}

$robocopyCommand = "robocopy $($robocopyArgs -join ' ')"
Write-Host "   执行: $robocopyCommand" -ForegroundColor Gray

$result = Start-Process -FilePath "robocopy" -ArgumentList $robocopyArgs -Wait -PassThru -NoNewWindow

# Robocopy 返回码说明: 0-7 表示成功，8+ 表示失败
if ($result.ExitCode -le 7) {
    Write-Host "   ✓ 项目文件复制完成" -ForegroundColor Green
} else {
    Write-Host "   ✗ 项目文件复制失败 (错误码: $($result.ExitCode))" -ForegroundColor Red
    exit 1
}

# 2. 如果选择包含 node_modules，显示大小
if ($IncludeNodeModules) {
    Write-Host ""
    Write-Host "📦 [2/7] node_modules 已包含在打包中" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "⚠️  [2/7] node_modules 未包含，需在新电脑上执行 pnpm install" -ForegroundColor Yellow
}

# 3. 复制 Docker 相关文件
Write-Host ""
Write-Host "🐳 [3/7] 打包 Docker 配置..." -ForegroundColor Yellow

$DockerFiles = @(
    "deploy\docker-compose.cn.yml",
    "deploy\docker-compose.yml",
    "Dockerfile.advanced"
)

foreach ($file in $DockerFiles) {
    $sourcePath = Join-Path $ProjectRoot $file
    if (Test-Path $sourcePath) {
        $destPath = Join-Path "$PackagePath\Docker" (Split-Path $file -Leaf)
        Copy-Item -Path $sourcePath -Destination $destPath -Force
    }
}

Write-Host "   ✓ Docker 配置文件已复制" -ForegroundColor Green

# 4. 导出环境变量（从当前系统）
Write-Host ""
Write-Host "⚙️  [4/7] 导出环境配置..." -ForegroundColor Yellow

$EnvConfig = @"
# FastGPT 环境配置文件
# 生成时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# ============ 数据库配置 ============
MONGODB_URI=mongodb://localhost:27017/fastgpt
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=fastgpt

# ============ Redis 配置 ============
REDIS_URL=redis://localhost:6379

# ============ 应用配置 ============
PORT=3000
FE_DOMAIN=http://localhost:3000

# ============ AI 模型配置 ============
# Ollama 本地模型
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_PROXY_URL=http://localhost:11434/v1

# 智谱 AI (如果使用)
ZHIPU_API_KEY=your_zhipu_api_key
ZHIPU_BASE_URL=https://open.bigmodel.cn/api/paas/v4

# ============ 飞书机器人配置 ============
FEISHU_APP_ID=cli_a9c0961da6785cb6
FEISHU_APP_SECRET=JBU23Y6EnxCYyYYWaCP4uhPTm0ei5HNQ
FEISHU_API_URL=https://open.feishu.cn

# ============ 其他配置 ============
# 文件上传配置
UPLOAD_MAX_SIZE=50mb

# 日志级别
LOG_LEVEL=info

# ============ 注意事项 ============
# 1. 请根据实际情况修改上述配置
# 2. 数据库密码等敏感信息请妥善保管
# 3. 如果使用 Docker，某些配置可能需要调整为容器内地址
"@

$EnvConfig | Out-File -FilePath "$PackagePath\FastGPT\.env.template" -Encoding UTF8
Write-Host "   ✓ 环境配置模板已生成: .env.template" -ForegroundColor Green

# 5. 创建快速启动脚本
Write-Host ""
Write-Host "🚀 [5/7] 创建快速启动脚本..." -ForegroundColor Yellow

$StartScript = @"
# FastGPT 快速启动脚本
# 使用方法: .\start-fastgpt.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FastGPT 快速启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

`$ProjectRoot = `$PSScriptRoot

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
try {
    `$nodeVersion = node --version
    Write-Host "   ✓ Node.js 版本: `$nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ 未检测到 Node.js，请先安装 Node.js 18+" -ForegroundColor Red
    Write-Host "     下载地址: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 检查 pnpm
Write-Host "检查 pnpm..." -ForegroundColor Yellow
try {
    `$pnpmVersion = pnpm --version
    Write-Host "   ✓ pnpm 版本: `$pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ 未检测到 pnpm，正在安装..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "   ✓ pnpm 安装完成" -ForegroundColor Green
}

# 检查 .env 文件
if (-not (Test-Path "`$ProjectRoot\.env")) {
    if (Test-Path "`$ProjectRoot\.env.template") {
        Write-Host ""
        Write-Host "⚠️  未找到 .env 文件" -ForegroundColor Yellow
        Write-Host "   正在从 .env.template 创建..." -ForegroundColor Yellow
        Copy-Item "`$ProjectRoot\.env.template" "`$ProjectRoot\.env"
        Write-Host "   ✓ .env 文件已创建，请编辑配置后重新运行" -ForegroundColor Green
        Write-Host ""
        Write-Host "按任意键退出..."
        `$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        exit 0
    } else {
        Write-Host "   ✗ 未找到 .env 或 .env.template 文件" -ForegroundColor Red
        exit 1
    }
}

# 检查依赖
if (-not (Test-Path "`$ProjectRoot\node_modules")) {
    Write-Host ""
    Write-Host "📦 安装依赖..." -ForegroundColor Yellow
    Set-Location "`$ProjectRoot"
    pnpm install
    if (`$LASTEXITCODE -ne 0) {
        Write-Host "   ✗ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✓ 依赖安装完成" -ForegroundColor Green
}

# 启动服务
Write-Host ""
Write-Host "🚀 启动 FastGPT..." -ForegroundColor Green
Write-Host ""
Set-Location "`$ProjectRoot\projects\app"
pnpm dev
"@

$StartScript | Out-File -FilePath "$PackagePath\FastGPT\start-fastgpt.ps1" -Encoding UTF8
Write-Host "   ✓ 启动脚本已创建: start-fastgpt.ps1" -ForegroundColor Green

# 6. 创建 Docker 快速启动脚本
$DockerStartScript = @"
# FastGPT Docker 快速启动脚本
# 使用方法: .\start-docker.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FastGPT Docker 快速启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

`$DockerDir = "`$PSScriptRoot\..\Docker"

# 检查 Docker
Write-Host "检查 Docker..." -ForegroundColor Yellow
try {
    `$dockerVersion = docker --version
    Write-Host "   ✓ Docker 版本: `$dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ 未检测到 Docker，请先安装 Docker Desktop" -ForegroundColor Red
    Write-Host "     下载地址: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# 检查 Docker Compose
Write-Host "检查 Docker Compose..." -ForegroundColor Yellow
try {
    `$composeVersion = docker-compose --version
    Write-Host "   ✓ Docker Compose 版本: `$composeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ 未检测到 Docker Compose" -ForegroundColor Red
    exit 1
}

# 启动 Docker 服务
Write-Host ""
Write-Host "🐳 启动 Docker 服务..." -ForegroundColor Green
Write-Host ""

Set-Location `$DockerDir

# 选择配置文件
if (Test-Path "docker-compose.cn.yml") {
    docker-compose -f docker-compose.cn.yml up -d
} elseif (Test-Path "docker-compose.yml") {
    docker-compose -f docker-compose.yml up -d
} else {
    Write-Host "   ✗ 未找到 docker-compose 配置文件" -ForegroundColor Red
    exit 1
}

if (`$LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Docker 服务启动成功" -ForegroundColor Green
    Write-Host ""
    Write-Host "服务访问地址:" -ForegroundColor Cyan
    Write-Host "   MongoDB: mongodb://localhost:27017" -ForegroundColor Gray
    Write-Host "   PostgreSQL: postgresql://localhost:5432" -ForegroundColor Gray
    Write-Host "   Redis: redis://localhost:6379" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "✗ Docker 服务启动失败" -ForegroundColor Red
}
"@

$DockerStartScript | Out-File -FilePath "$PackagePath\FastGPT\start-docker.ps1" -Encoding UTF8

# 7. 创建安装指南
Write-Host ""
Write-Host "📖 [6/7] 创建安装指南..." -ForegroundColor Yellow

$InstallGuide = @"
# FastGPT 完整项目安装指南

## 📦 打包信息
- 打包时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- 打包版本: FastGPT Full Package
- 包含 node_modules: $(if ($IncludeNodeModules) { "是" } else { "否" })

## 🎯 快速开始（推荐新手）

### 方案1: 使用快速启动脚本

1. **解压项目**
   - 将 FastGPT 文件夹解压到任意位置（建议路径不包含中文）
   - 例如: D:\FastGPT

2. **配置环境变量**
   - 打开 FastGPT 文件夹
   - 找到 .env.template 文件
   - 复制并重命名为 .env
   - 根据实际情况修改配置（数据库地址、API密钥等）

3. **启动项目**
   - 右键点击 start-fastgpt.ps1
   - 选择 "使用 PowerShell 运行"
   - 等待启动完成

4. **访问应用**
   - 浏览器打开: http://localhost:3000

### 方案2: 使用 Docker（推荐有经验用户）

1. **安装 Docker Desktop**
   - 下载地址: https://www.docker.com/products/docker-desktop
   - 安装完成后启动 Docker

2. **启动数据库服务**
   - 右键点击 start-docker.ps1
   - 选择 "使用 PowerShell 运行"
   - 等待 Docker 容器启动完成

3. **启动 FastGPT 应用**
   - 右键点击 start-fastgpt.ps1
   - 选择 "使用 PowerShell 运行"

## 🔧 手动安装步骤

### 1. 环境准备

#### 必需软件:
- **Node.js** 18+ (推荐 18.x 或 20.x)
  - 下载: https://nodejs.org/
  - 验证: ``node --version``

- **pnpm** (包管理器)
  - 安装: ``npm install -g pnpm``
  - 验证: ``pnpm --version``

#### 数据库 (三选一):

**选项1: 使用 Docker (推荐)**
```powershell
cd Docker
docker-compose -f docker-compose.cn.yml up -d
```

**选项2: 本地安装**
- MongoDB 4.4+
- PostgreSQL 14+ (带 pgvector 扩展)
- Redis 6+

**选项3: 使用云数据库**
- 阿里云、腾讯云等提供的托管数据库服务

### 2. 安装依赖

$(if (-not $IncludeNodeModules) {
@"
```powershell
cd FastGPT
pnpm install
```

**注意**: 首次安装可能需要 10-30 分钟，取决于网络速度
"@
} else {
@"
node_modules 已包含在打包中，跳过此步骤
"@
})

### 3. 配置环境变量

创建 `.env` 文件:
```powershell
cd FastGPT
Copy-Item .env.template .env
notepad .env
```

**必需配置项**:
```env
# 数据库
MONGODB_URI=mongodb://localhost:27017/fastgpt
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
REDIS_URL=redis://localhost:6379

# 应用
PORT=3000
FE_DOMAIN=http://localhost:3000

# AI 模型 (选择一个)
OLLAMA_BASE_URL=http://localhost:11434  # 使用本地 Ollama
# 或
ZHIPU_API_KEY=your_key  # 使用智谱 AI
```

### 4. 启动应用

```powershell
cd FastGPT\projects\app
pnpm dev
```

等待编译完成后，访问 http://localhost:3000

## 🎨 飞书机器人配置

如果需要使用飞书机器人功能:

1. **在 .env 中配置飞书信息**:
```env
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
```

2. **在 FastGPT 中创建外链**:
   - 登录 FastGPT
   - 创建应用
   - 发布应用并获取 shareId

3. **配置飞书 Webhook**:
   - 飞书开放平台 → 应用管理
   - 事件订阅 → 配置请求地址
   - 格式: ``https://your-domain/api/feishu/{shareId}``

## ⚠️ 常见问题

### Q1: pnpm install 失败？
**解决方案**:
```powershell
# 清理缓存
pnpm store prune

# 切换镜像源
pnpm config set registry https://registry.npmmirror.com

# 重新安装
pnpm install
```

### Q2: Docker 启动失败？
**检查项**:
- Docker Desktop 是否正在运行
- 端口是否被占用 (27017, 5432, 6379)
- 磁盘空间是否充足

### Q3: 页面无法访问？
**检查项**:
- 防火墙是否拦截 3000 端口
- Node.js 进程是否正常运行
- .env 配置是否正确

### Q4: AI 模型无响应？
**检查项**:
- Ollama 是否正在运行 (如果使用本地模型)
- API 密钥是否正确 (如果使用云服务)
- 网络连接是否正常

## 📚 目录结构

```
FastGPT/
├── projects/app/          # 主应用
├── packages/             # 共享包
│   ├── global/          # 全局类型和工具
│   ├── service/         # 后端服务
│   └── web/             # Web 组件
├── deploy/              # 部署配置
├── docs/                # 文档
├── scripts/             # 脚本工具
├── .env                 # 环境配置（需创建）
├── package.json         # 项目配置
└── pnpm-workspace.yaml  # pnpm 工作区配置
```

## 🔗 有用的链接

- 官方文档: https://doc.fastgpt.io/
- GitHub: https://github.com/labring/FastGPT
- 问题反馈: https://github.com/labring/FastGPT/issues

## 📝 备注

- 建议使用 VSCode 作为开发工具
- 推荐安装 ESLint、Prettier 等插件
- 生产环境建议使用 PM2 或 Docker 部署
- 定期备份数据库数据

---
生成时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$InstallGuide | Out-File -FilePath "$PackagePath\Docs\安装指南.md" -Encoding UTF8
Write-Host "   ✓ 安装指南已创建" -ForegroundColor Green

# 创建 README
$ReadMe = @"
# FastGPT 完整项目包

## 🚀 快速开始

1. **解压项目** 到任意位置（路径不要包含中文）

2. **阅读安装指南**
   - 打开 ``Docs\安装指南.md``
   - 根据你的情况选择安装方案

3. **使用快速启动脚本**（推荐新手）
   - 双击 ``FastGPT\start-fastgpt.ps1``
   - 首次运行会自动配置环境

4. **访问应用**
   - 浏览器打开 http://localhost:3000

## 📁 目录说明

- **FastGPT/** - 完整项目代码
- **Docker/** - Docker 配置文件
- **Docs/** - 详细安装和配置文档

## ⚙️ 系统要求

- Windows 10/11
- Node.js 18+
- 8GB+ RAM（推荐 16GB）
- 20GB+ 可用磁盘空间

## 📖 详细文档

请查看 ``Docs\安装指南.md`` 获取完整的安装和配置说明。

---
打包时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$ReadMe | Out-File -FilePath "$PackagePath\README.txt" -Encoding UTF8

# 8. 创建压缩包
Write-Host ""
Write-Host "📦 [7/7] 创建压缩包..." -ForegroundColor Yellow

$ZipPath = "$OutputDir\$PackageName.zip"

try {
    # 使用 .NET 压缩（比 Compress-Archive 更可靠）
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($PackagePath, $ZipPath, 'Optimal', $false)
    
    Write-Host "   ✓ 压缩包创建成功" -ForegroundColor Green
    
    # 计算大小
    $ZipSize = (Get-Item $ZipPath).Length / 1MB
    Write-Host "   文件大小: $([Math]::Round($ZipSize, 2)) MB" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  无法创建压缩包，保留解压目录" -ForegroundColor Yellow
    Write-Host "   错误: $_" -ForegroundColor Red
}

# 完成
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ 打包完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📦 打包位置:" -ForegroundColor Cyan
Write-Host "   解压目录: $PackagePath" -ForegroundColor Gray
if (Test-Path $ZipPath) {
    Write-Host "   压缩包: $ZipPath" -ForegroundColor Gray
}
Write-Host ""
Write-Host "📋 下一步操作:" -ForegroundColor Cyan
Write-Host "   1. 复制压缩包或解压目录到新电脑" -ForegroundColor Gray
Write-Host "   2. 解压后阅读 README.txt" -ForegroundColor Gray
Write-Host "   3. 按照安装指南配置环境" -ForegroundColor Gray
Write-Host "   4. 运行 start-fastgpt.ps1 启动项目" -ForegroundColor Gray
Write-Host ""
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
