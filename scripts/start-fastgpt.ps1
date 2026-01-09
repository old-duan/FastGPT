# FastGPT 快速启动脚本
# 使用方法: .\start-fastgpt.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    FastGPT 本地开发环境启动工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Docker服务
Write-Host "[1/3] 检查Docker服务..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    $null = docker ps 2>&1
    $dockerRunning = $?
} catch {
    $dockerRunning = $false
}

if (-not $dockerRunning) {
    Write-Host "❌ Docker服务未运行,请先启动Docker Desktop" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker服务运行正常" -ForegroundColor Green

# 检查并启动数据库容器
Write-Host ""
Write-Host "[2/3] 检查数据库服务..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}" 2>$null

$requiredContainers = @("mongo", "pg", "redis", "minio")
$missingContainers = @()

foreach ($container in $requiredContainers) {
    if ($containers -notcontains $container) {
        $missingContainers += $container
    }
}

if ($missingContainers.Count -gt 0) {
    Write-Host "⚠️  以下容器未运行: $($missingContainers -join ', ')" -ForegroundColor Yellow
    Write-Host "正在启动数据库服务..." -ForegroundColor Yellow
    
    Push-Location
    Set-Location "d:\FastGPT\deploy\dev"
    docker-compose up -d
    Pop-Location
    
    Write-Host "等待数据库服务启动..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "✅ 数据库服务已启动" -ForegroundColor Green
} else {
    Write-Host "✅ 所有数据库服务运行正常" -ForegroundColor Green
}

# 显示容器状态
Write-Host ""
Write-Host "📊 容器状态:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Where-Object { $_ -match "mongo|pg|redis|minio|NAMES" }

# 启动FastGPT应用
Write-Host ""
Write-Host "[3/3] 启动FastGPT应用..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 正在启动开发服务器..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 提示:" -ForegroundColor White
Write-Host "   - 服务地址: http://localhost:3000" -ForegroundColor White
Write-Host "   - 用户名: root" -ForegroundColor White
Write-Host "   - 密码: 123456" -ForegroundColor White
Write-Host "   - 按 Ctrl+C 停止服务" -ForegroundColor White
Write-Host "   - 首次访问需要编译,请耐心等待" -ForegroundColor White
Write-Host ""

Set-Location "d:\FastGPT\projects\app"
pnpm exec next dev -H 0.0.0.0 -p 3000
