# FastGPT Web站点同步功能解锁 - 自动构建脚本
# 使用方法: .\build-unlock-fastgpt.ps1

param(
    [switch]$SkipBackup = $false,
    [switch]$AutoRestart = $true
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   FastGPT Web站点同步功能 - 自动构建脚本          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# 检查是否在正确的目录
if (!(Test-Path ".\projects\app\Dockerfile")) {
    Write-Host "❌ 错误: 请在 FastGPT 项目根目录运行此脚本" -ForegroundColor Red
    Write-Host "当前目录: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "正确用法: cd D:\FastGPT; .\scripts\build-unlock-fastgpt.ps1" -ForegroundColor Yellow
    exit 1
}

# 检查 Docker 是否运行
try {
    docker ps | Out-Null
    Write-Host "✅ Docker 正在运行" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker 未运行,请先启动 Docker Desktop" -ForegroundColor Red
    exit 1
}

# 备份数据 (可选)
if (!$SkipBackup) {
    Write-Host "`n📦 备份数据..." -ForegroundColor Cyan
    $backupDir = "D:\FastGPT_Backup\unlock_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # 备份配置文件
    Copy-Item ".\deploy\docker\cn\docker-compose.pg.yml" "$backupDir\docker-compose.pg.yml.backup"
    Write-Host "  ✅ 配置文件已备份到: $backupDir" -ForegroundColor Green
}

# 构建镜像
Write-Host "`n🔨 开始构建 FastGPT 镜像 (这可能需要 15-30 分钟)..." -ForegroundColor Cyan
Write-Host "提示: 首次构建会下载依赖包,请保持网络连接" -ForegroundColor Yellow

$imageName = "fastgpt-local"
$imageTag = "v4.14.4-unlock"
$fullImageName = "${imageName}:${imageTag}"

try {
    $buildStart = Get-Date
    docker build -t $fullImageName -f projects\app\Dockerfile . 2>&1 | ForEach-Object {
        if ($_ -match "Step \d+/\d+|Successfully") {
            Write-Host $_ -ForegroundColor Cyan
        }
    }
    $buildEnd = Get-Date
    $buildDuration = ($buildEnd - $buildStart).TotalMinutes
    
    Write-Host "`n✅ 镜像构建成功! 耗时: $([math]::Round($buildDuration, 2)) 分钟" -ForegroundColor Green
    Write-Host "镜像名称: $fullImageName" -ForegroundColor White
} catch {
    Write-Host "`n❌ 构建失败: $_" -ForegroundColor Red
    Write-Host "请检查网络连接和 Docker 配置" -ForegroundColor Yellow
    exit 1
}

# 检查是否需要修改 docker-compose.pg.yml
$composeFile = ".\deploy\docker\cn\docker-compose.pg.yml"
$composeContent = Get-Content $composeFile -Raw

if ($composeContent -match "image:\s+registry\.cn-hangzhou\.aliyuncs\.com/fastgpt/fastgpt:v4\.14\.4") {
    Write-Host "`n📝 更新 docker-compose.pg.yml..." -ForegroundColor Cyan
    
    # 备份原文件
    Copy-Item $composeFile "${composeFile}.before_unlock"
    
    # 替换镜像名
    $composeContent = $composeContent -replace `
        "image:\s+registry\.cn-hangzhou\.aliyuncs\.com/fastgpt/fastgpt:v4\.14\.4", `
        "image: $fullImageName  # 已修改为本地解锁版本"
    
    Set-Content -Path $composeFile -Value $composeContent
    Write-Host "  ✅ docker-compose.pg.yml 已更新" -ForegroundColor Green
    Write-Host "  原文件已备份为: docker-compose.pg.yml.before_unlock" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  docker-compose.pg.yml 可能已经修改过" -ForegroundColor Yellow
    Write-Host "请手动检查镜像配置" -ForegroundColor Yellow
}

# 重启服务
if ($AutoRestart) {
    Write-Host "`n🔄 重启 FastGPT 服务..." -ForegroundColor Cyan
    
    Set-Location ".\deploy\docker\cn"
    
    # 停止服务
    Write-Host "  停止旧服务..." -ForegroundColor Yellow
    docker-compose -f docker-compose.pg.yml stop fastgpt 2>&1 | Out-Null
    
    # 启动新服务
    Write-Host "  启动新服务..." -ForegroundColor Yellow
    docker-compose -f docker-compose.pg.yml up -d fastgpt 2>&1 | Out-Null
    
    Start-Sleep -Seconds 5
    
    # 验证服务
    $containerStatus = docker ps --filter "name=fastgpt" --format "{{.Status}}"
    if ($containerStatus -match "Up") {
        Write-Host "  ✅ 服务启动成功!" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  服务可能未正常启动,请检查日志" -ForegroundColor Yellow
    }
    
    Set-Location "..\..\.."
} else {
    Write-Host "`n⏸️  跳过自动重启,请手动重启服务:" -ForegroundColor Yellow
    Write-Host "  cd deploy\docker\cn" -ForegroundColor White
    Write-Host "  docker-compose -f docker-compose.pg.yml stop fastgpt" -ForegroundColor White
    Write-Host "  docker-compose -f docker-compose.pg.yml up -d fastgpt" -ForegroundColor White
}

# 显示总结
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║             构建完成！                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 修改摘要:" -ForegroundColor Cyan
Write-Host "  ✅ 前端创建限制已移除" -ForegroundColor White
Write-Host "  ✅ 同步频率限制已移除" -ForegroundColor White
Write-Host "  ✅ 权限检查已绕过" -ForegroundColor White
Write-Host "  ✅ 本地镜像已构建: $fullImageName" -ForegroundColor White

Write-Host "`n🌐 访问地址:" -ForegroundColor Cyan
Write-Host "  本机: http://localhost:3000" -ForegroundColor Yellow
Write-Host "  局域网: http://192.168.110.18:3000" -ForegroundColor Yellow

Write-Host "`n🧪 测试功能:" -ForegroundColor Cyan
Write-Host "  1. 访问 Web 界面" -ForegroundColor White
Write-Host "  2. 进入知识库页面" -ForegroundColor White
Write-Host "  3. 点击创建知识库" -ForegroundColor White
Write-Host "  4. 选择 'Web 站点同步' (应该不再提示商业版)" -ForegroundColor White
Write-Host "  5. 输入网站 URL 开始同步" -ForegroundColor White

Write-Host "`n📖 详细文档: docs\WEB_SYNC_UNLOCK.md`n" -ForegroundColor Cyan

Write-Host "🎉 完成！请刷新浏览器测试功能。" -ForegroundColor Green
