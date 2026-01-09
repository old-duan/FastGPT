# FastGPT 开发服务启动脚本
# 此脚本确保服务持续运行

param(
    [switch]$Stop
)

$ErrorActionPreference = "Continue"

# 停止现有进程
function Stop-FastGPT {
    Write-Host "`n=== 停止 FastGPT 服务 ===" -ForegroundColor Yellow
    Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.MainWindowTitle -like "*FastGPT*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process | Where-Object { $_.ProcessName -eq "node" } | ForEach-Object {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        if ($cmdLine -like "*FastGPT*" -or $cmdLine -like "*next*") {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "已停止进程 $($_.Id)" -ForegroundColor Green
        }
    }
    Start-Sleep -Seconds 2
}

if ($Stop) {
    Stop-FastGPT
    Write-Host "FastGPT 服务已停止" -ForegroundColor Green
    exit 0
}

# 停止现有进程
Stop-FastGPT

# 切换到项目目录
Set-Location "D:\FastGPT\projects\app"
Write-Host "`n=== 当前目录 ===" -ForegroundColor Cyan
Write-Host "$(Get-Location)" -ForegroundColor Green

# 检查端口
Write-Host "`n=== 检查端口 3000 ===" -ForegroundColor Cyan
$port = netstat -ano | findstr ":3000.*LISTENING"
if ($port) {
    Write-Host "端口 3000 已被占用，尝试释放..." -ForegroundColor Yellow
    $portInfo = $port[0] -split '\s+' | Where-Object { $_ }
    $pid = $portInfo[-1]
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# 检查数据库服务
Write-Host "`n=== 检查数据库服务 ===" -ForegroundColor Cyan
$mongo = docker ps --filter "name=mongo" --format "{{.Names}}"
$redis = docker ps --filter "name=redis" --format "{{.Names}}"
$pg = docker ps --filter "name=pg" --format "{{.Names}}"
$plugin = docker ps --filter "name=fastgpt-plugin" --format "{{.Names}}"

if (-not $mongo) { Write-Host "⚠ MongoDB 未运行" -ForegroundColor Red }
if (-not $redis) { Write-Host "⚠ Redis 未运行" -ForegroundColor Red }
if (-not $pg) { Write-Host "⚠ PostgreSQL 未运行" -ForegroundColor Red }
if (-not $plugin) { Write-Host "⚠ Plugin 未运行" -ForegroundColor Red }

if ($mongo -and $redis -and $pg) {
    Write-Host "✓ 所有数据库服务正常运行" -ForegroundColor Green
} else {
    Write-Host "`n启动数据库服务..." -ForegroundColor Yellow
    Set-Location "D:\FastGPT\deploy\dev"
    docker-compose up -d mongo redis pg
    Set-Location "D:\FastGPT\projects\app"
    Start-Sleep -Seconds 5
}

# 启动服务
Write-Host "`n=== 启动 FastGPT 开发服务 ===" -ForegroundColor Cyan
Write-Host "服务地址: http://192.168.110.18:3000" -ForegroundColor Green
Write-Host "本地地址: http://localhost:3000" -ForegroundColor Green
Write-Host "账号: root" -ForegroundColor Yellow
Write-Host "密码: 1234" -ForegroundColor Yellow
Write-Host "`n按 Ctrl+C 停止服务" -ForegroundColor Yellow
Write-Host "`n正在启动..." -ForegroundColor Cyan

# 使用 Start-Process 在新窗口启动(可选)
# Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\FastGPT\projects\app; pnpm dev"

# 直接在当前窗口启动(推荐,可以看到日志)
pnpm dev
