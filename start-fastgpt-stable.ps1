# FastGPT 开发服务启动脚本 (稳定版)
# 解决服务自动关闭问题 - 使用独立进程运行
# 使用方法: .\start-fastgpt-stable.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   FastGPT 开发服务 - 稳定启动模式   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# 步骤 1: 停止现有服务
Write-Host "[1/5] 停止现有 Node 进程..." -ForegroundColor Yellow
$existingProc = Get-Process | Where-Object { $_.ProcessName -eq "node" }
if ($existingProc) {
    Write-Host "  发现 $($existingProc.Count) 个 Node 进程,正在停止..." -ForegroundColor Yellow
    $existingProc | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "  ✓ 已停止" -ForegroundColor Green
} else {
    Write-Host "  ✓ 无需停止" -ForegroundColor Green
}

# 步骤 2: 检查端口
Write-Host "`n[2/5] 检查端口 3000..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
$port = netstat -ano | findstr ":3000.*LISTENING"
if ($port) {
    Write-Host "  ✗ 端口仍被占用" -ForegroundColor Red
    $port
    Write-Host "  等待 5 秒后继续..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
} else {
    Write-Host "  ✓ 端口可用" -ForegroundColor Green
}

# 步骤 3: 检查数据库服务
Write-Host "`n[3/5] 检查数据库服务..." -ForegroundColor Yellow
try {
    $dockerServices = docker ps --format "{{.Names}}" 2>$null
    $mongo = $dockerServices | Select-String "mongo"
    $redis = $dockerServices | Select-String "redis"
    $pg = $dockerServices | Select-String "pg"
    
    if ($mongo -and $redis -and $pg) {
        Write-Host "  ✓ MongoDB: 运行中" -ForegroundColor Green
        Write-Host "  ✓ Redis: 运行中" -ForegroundColor Green
        Write-Host "  ✓ PostgreSQL: 运行中" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 数据库服务未完全启动!" -ForegroundColor Red
        Write-Host "  请运行: cd D:\FastGPT\deploy\dev; docker-compose up -d" -ForegroundColor Yellow
        Read-Host "`n按 Enter 退出"
        exit 1
    }
} catch {
    Write-Host "  ✗ Docker 未运行或无法访问" -ForegroundColor Red
    Read-Host "`n按 Enter 退出"
    exit 1
}

# 步骤 4: 验证项目目录
Write-Host "`n[4/5] 验证项目目录..." -ForegroundColor Yellow
$projectPath = "D:\FastGPT\projects\app"
if (Test-Path $projectPath) {
    Write-Host "  ✓ 项目路径: $projectPath" -ForegroundColor Green
    if (Test-Path "$projectPath\package.json") {
        Write-Host "  ✓ package.json 存在" -ForegroundColor Green
    } else {
        Write-Host "  ✗ package.json 不存在" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✗ 项目目录不存在" -ForegroundColor Red
    exit 1
}

# 步骤 5: 启动服务
Write-Host "`n[5/5] 启动 FastGPT 开发服务..." -ForegroundColor Yellow
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "  服务地址: http://192.168.110.18:3000" -ForegroundColor Green
Write-Host "  本地地址: http://localhost:3000" -ForegroundColor Green  
Write-Host "  登录账号: root" -ForegroundColor Yellow
Write-Host "  登录密码: 1234" -ForegroundColor Yellow
Write-Host "="*50 + "`n" -ForegroundColor Cyan

Write-Host "正在启动服务(将在新窗口打开)..." -ForegroundColor Yellow

# 使用 Start-Process 在独立窗口运行,确保进程不会被意外终止
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$projectPath'; Write-Host '=== FastGPT 开发服务 ===' -ForegroundColor Green; Write-Host '地址: http://192.168.110.18:3000' -ForegroundColor Cyan; Write-Host '账号: root / 1234' -ForegroundColor Yellow; Write-Host ''; pnpm dev"
)

Write-Host "✓ 已启动服务窗口" -ForegroundColor Green
Write-Host "`n等待 15 秒让服务初始化..." -ForegroundColor Yellow

# 显示进度条
for ($i = 1; $i -le 15; $i++) {
    Write-Progress -Activity "等待服务启动" -Status "$i/15 秒" -PercentComplete (($i / 15) * 100)
    Start-Sleep -Seconds 1
}
Write-Progress -Activity "等待服务启动" -Completed

# 验证服务状态
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         服务状态验证               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

$port = netstat -ano | findstr ":3000.*LISTENING"
$proc = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($port) {
    Write-Host "✓ 端口 3000 正在监听" -ForegroundColor Green
} else {
    Write-Host "✗ 端口 3000 未监听 (可能还在启动中)" -ForegroundColor Yellow
}

if ($proc) {
    Write-Host "✓ Node 进程运行中" -ForegroundColor Green
    Write-Host "`n进程详情:" -ForegroundColor Cyan
    $proc | Select-Object Id, @{Name="内存(MB)";Expression={[math]::Round($_.WorkingSet/1MB,2)}}, StartTime | Format-Table -AutoSize
} else {
    Write-Host "✗ Node 进程未找到 (可能还在启动中)" -ForegroundColor Yellow
}

Write-Host "`n提示:" -ForegroundColor Cyan
Write-Host "  • 服务在独立窗口运行,关闭本窗口不影响服务" -ForegroundColor White
Write-Host "  • 如需停止服务,关闭服务窗口或运行以下命令:" -ForegroundColor White
Write-Host "    Get-Process -Name 'node' | Stop-Process -Force" -ForegroundColor Gray
Write-Host "  • 首次启动可能需要 30-60 秒完成初始化" -ForegroundColor White
Write-Host "  • 如果服务未启动,请检查服务窗口的错误信息" -ForegroundColor White

Write-Host "`n现在可以尝试访问: http://192.168.110.18:3000" -ForegroundColor Green
Write-Host ""
