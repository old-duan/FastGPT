# FastGPT 服务器启动脚本
# 作者: FastGPT 部署助手
# 日期: 2025-12-16

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FastGPT 服务器启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Docker服务
Write-Host "1. 检查 Docker 服务..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Docker 未运行,请先启动 Docker Desktop" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Docker 服务正常" -ForegroundColor Green

# 检查必要的容器
Write-Host "`n2. 检查必要的容器..." -ForegroundColor Yellow
$containers = @("mongo", "pg", "redis", "fastgpt-minio")
foreach ($container in $containers) {
    $status = docker ps --filter "name=$container" --format "{{.Status}}" 2>&1
    if ($status -match "Up") {
        Write-Host "   ✅ $container 运行中" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $container 未运行,正在启动..." -ForegroundColor Yellow
        Set-Location "d:\FastGPT\deploy\dev"
        docker-compose up -d
        break
    }
}

# 检查端口占用
Write-Host "`n3. 检查端口 3000..." -ForegroundColor Yellow
$port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "   ⚠️  端口 3000 已被占用" -ForegroundColor Yellow
    $process = Get-Process -Id $port[0].OwningProcess -ErrorAction SilentlyContinue
    if ($process -and $process.ProcessName -eq "node") {
        Write-Host "   ℹ️  FastGPT 服务器已在运行 (PID: $($process.Id))" -ForegroundColor Cyan
        Write-Host "`n✅ 服务器已就绪!" -ForegroundColor Green
        Write-Host "`n访问地址: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "用户名: root" -ForegroundColor Cyan
        Write-Host "密码: 123456" -ForegroundColor Cyan
        Write-Host ""
        Start-Process "http://localhost:3000"
        exit 0
    } else {
        Write-Host "   ❌ 端口被其他进程占用,请手动释放" -ForegroundColor Red
        exit 1
    }
}

# 启动服务器
Write-Host "`n4. 启动 FastGPT 服务器..." -ForegroundColor Yellow
Set-Location "d:\FastGPT\projects\app\.next\standalone\projects\app"

# 后台启动
$job = Start-Job -ScriptBlock {
    Set-Location "d:\FastGPT\projects\app\.next\standalone\projects\app"
    node server.js
}

# 等待服务器启动
Write-Host "   等待服务器初始化..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# 验证服务器
$maxRetries = 5
$retryCount = 0
$serverReady = $false

while ($retryCount -lt $maxRetries -and -not $serverReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "   等待中... ($retryCount/$maxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    }
}

if ($serverReady) {
    Write-Host "`n✅ FastGPT 服务器启动成功!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  访问信息" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "访问地址: http://localhost:3000" -ForegroundColor White
    Write-Host "用户名: root" -ForegroundColor White
    Write-Host "密码: 123456" -ForegroundColor White
    Write-Host ""
    Write-Host "AI 模型: 智谱 GLM-4" -ForegroundColor White
    Write-Host ""
    Write-Host "正在打开浏览器..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:3000"
    
    Write-Host "`n服务器日志查看命令:" -ForegroundColor Cyan
    Write-Host "  Get-Job | Receive-Job" -ForegroundColor Gray
    Write-Host "`n停止服务器命令:" -ForegroundColor Cyan
    Write-Host "  Get-Process | Where-Object ProcessName -eq 'node' | Stop-Process" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "`n❌ 服务器启动失败" -ForegroundColor Red
    Write-Host "请检查日志: Get-Job | Receive-Job" -ForegroundColor Yellow
    exit 1
}
