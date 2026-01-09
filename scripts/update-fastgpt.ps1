# FastGPT 更新脚本
# 用途: 自动化更新FastGPT到指定版本
# 作者: FastGPT部署助手
# 使用: .\update-fastgpt.ps1 -Version "v4.14.4"

param(
    [Parameter(Mandatory=$true)]
    [string]$Version = "v4.14.4",
    
    [switch]$SkipBackup = $false,
    
    [switch]$AutoConfirm = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FastGPT 更新工具" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "🎯 目标版本: $Version`n" -ForegroundColor Green

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  建议以管理员身份运行,但非必需`n" -ForegroundColor Yellow
}

# 获取当前版本
Write-Host "📌 检查当前版本..." -ForegroundColor Yellow
$currentImage = docker inspect fastgpt --format='{{.Config.Image}}' 2>$null

if ($currentImage) {
    Write-Host "   当前版本: $currentImage" -ForegroundColor White
    
    if ($currentImage -match $Version) {
        Write-Host "   ✅ 已经是最新版本,无需更新!`n" -ForegroundColor Green
        exit 0
    }
} else {
    Write-Host "   ⚠️  FastGPT容器未运行`n" -ForegroundColor Yellow
}

# 确认更新
if (-not $AutoConfirm) {
    Write-Host "❓ 确认要更新到 $Version 吗? (Y/N): " -ForegroundColor Yellow -NoNewline
    $confirm = Read-Host
    
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host "`n❌ 更新已取消`n" -ForegroundColor Red
        exit 1
    }
}

# 创建备份目录
$backupDate = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "D:\FastGPT_Backup\$backupDate"

if (-not $SkipBackup) {
    Write-Host "`n📦 创建备份..." -ForegroundColor Yellow
    
    if (-not (Test-Path "D:\FastGPT_Backup")) {
        New-Item -ItemType Directory -Path "D:\FastGPT_Backup" | Out-Null
    }
    
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    
    # 备份配置文件
    Write-Host "   备份配置文件..." -ForegroundColor White
    Copy-Item "D:\FastGPT\deploy\docker\cn\docker-compose.pg.yml" "$backupDir\docker-compose.pg.yml.backup"
    
    # 备份MongoDB
    Write-Host "   备份MongoDB数据库 (可能需要几分钟)..." -ForegroundColor White
    
    try {
        docker exec mongo mongodump `
            --uri="mongodb://myusername:mypassword@localhost:27017/fastgpt?authSource=admin" `
            --out="/backup/$backupDate" 2>&1 | Out-Null
        
        docker cp "mongo:/backup/$backupDate" "$backupDir\mongodb_backup" 2>&1 | Out-Null
        
        Write-Host "   ✅ 备份完成: $backupDir`n" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  MongoDB备份失败,但继续更新: $_`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⚠️  跳过备份 (使用了 -SkipBackup 参数)`n" -ForegroundColor Yellow
}

# 更新配置文件
Write-Host "📝 更新配置文件..." -ForegroundColor Yellow

$composeFile = "D:\FastGPT\deploy\docker\cn\docker-compose.pg.yml"
$composeContent = Get-Content $composeFile -Raw

# 替换镜像版本
$composeContent = $composeContent -replace 'fastgpt/fastgpt:v[\d\.]+', "fastgpt/fastgpt:$Version"
$composeContent = $composeContent -replace 'fastgpt-sandbox:v[\d\.]+', "fastgpt-sandbox:$Version"
$composeContent = $composeContent -replace 'fastgpt-mcp_server:v[\d\.]+', "fastgpt-mcp_server:$Version"

# 保存
$composeContent | Set-Content $composeFile -Encoding UTF8

Write-Host "   ✅ 配置文件已更新`n" -ForegroundColor Green

# 拉取新镜像
Write-Host "🐳 拉取新镜像 (可能需要几分钟)..." -ForegroundColor Yellow

cd D:\FastGPT\deploy\docker\cn

$images = @(
    "fastgpt",
    "sandbox", 
    "fastgpt-mcp-server",
    "fastgpt-plugin"
)

foreach ($img in $images) {
    Write-Host "   拉取 $img..." -ForegroundColor White
    docker-compose -f docker-compose.pg.yml pull $img 2>&1 | Out-Null
}

Write-Host "   ✅ 镜像拉取完成`n" -ForegroundColor Green

# 停止服务
Write-Host "🛑 停止旧版本服务..." -ForegroundColor Yellow

docker stop fastgpt sandbox fastgpt-mcp-server fastgpt-plugin 2>&1 | Out-Null

Write-Host "   ✅ 服务已停止`n" -ForegroundColor Green

# 启动新版本
Write-Host "🚀 启动新版本..." -ForegroundColor Yellow

docker-compose -f docker-compose.pg.yml up -d

Start-Sleep -Seconds 5

# 检查服务状态
$fastgptStatus = docker ps --filter "name=fastgpt" --format "{{.Status}}"

if ($fastgptStatus -match "Up") {
    Write-Host "   ✅ 服务启动成功`n" -ForegroundColor Green
} else {
    Write-Host "   ❌ 服务启动失败!`n" -ForegroundColor Red
    Write-Host "查看日志: docker logs fastgpt`n" -ForegroundColor Yellow
    exit 1
}

# 执行数据迁移
Write-Host "🔄 执行数据迁移..." -ForegroundColor Yellow

# 提取rootkey
$rootkey = ""
if ($composeContent -match 'ROOT_KEY:\s*([^\s]+)') {
    $rootkey = $matches[1]
}

if ([string]::IsNullOrEmpty($rootkey)) {
    Write-Host "   ⚠️  未找到ROOT_KEY,请手动执行迁移脚本:" -ForegroundColor Yellow
    Write-Host "   curl --location --request POST 'http://localhost:3000/api/admin/init$($Version.Replace('.',''))' \"
    Write-Host "     --header 'rootkey: YOUR_ROOT_KEY' \"
    Write-Host "     --header 'Content-Type: application/json'`n" -ForegroundColor White
} else {
    Write-Host "   执行迁移脚本..." -ForegroundColor White
    
    $migrateUrl = "http://localhost:3000/api/admin/init$($Version.Replace('.','').Replace('v',''))"
    
    try {
        $response = Invoke-WebRequest -Uri $migrateUrl `
            -Method POST `
            -Headers @{
                "rootkey" = $rootkey
                "Content-Type" = "application/json"
            } `
            -TimeoutSec 300 `
            -ErrorAction Stop
        
        Write-Host "   ✅ 迁移脚本执行成功`n" -ForegroundColor Green
        Write-Host "   响应: $($response.Content)`n" -ForegroundColor Gray
    } catch {
        Write-Host "   ⚠️  迁移脚本执行失败: $_`n" -ForegroundColor Yellow
        Write-Host "   请查看日志: docker logs -f fastgpt | Select-String 'Migration'`n" -ForegroundColor White
    }
}

# 验证功能
Write-Host "🔍 验证更新..." -ForegroundColor Yellow

# 检查版本
$newImage = docker inspect fastgpt --format='{{.Config.Image}}'
Write-Host "   新版本: $newImage" -ForegroundColor White

# 测试Web访问
Start-Sleep -Seconds 5

try {
    $webResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ Web界面可访问 (HTTP $($webResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Web界面访问异常: $_" -ForegroundColor Yellow
}

# 检查错误日志
Write-Host "`n📋 最近日志 (如有ERROR请注意):" -ForegroundColor Yellow
docker logs fastgpt --tail 20 | Select-String "error|ERROR|Migration" | ForEach-Object {
    if ($_ -match "error|ERROR") {
        Write-Host "   🔴 $_" -ForegroundColor Red
    } else {
        Write-Host "   ℹ️  $_" -ForegroundColor Cyan
    }
}

# 完成
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  更新完成!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ FastGPT 已更新到 $Version`n" -ForegroundColor Green

Write-Host "📝 后续操作:" -ForegroundColor Yellow
Write-Host "   1. 访问 http://localhost:3000 测试功能" -ForegroundColor White
Write-Host "   2. 测试文件上传功能" -ForegroundColor White
Write-Host "   3. 测试模型调用功能" -ForegroundColor White
Write-Host "   4. 查看完整日志: docker logs -f fastgpt" -ForegroundColor White
Write-Host "   5. 如有问题,查看备份目录: $backupDir`n" -ForegroundColor White

Write-Host "🔄 回滚命令 (如需要):" -ForegroundColor Yellow
Write-Host "   .\rollback-fastgpt.ps1 -BackupDir '$backupDir'`n" -ForegroundColor White

Write-Host "按任意键退出..." -ForegroundColor Green
pause
