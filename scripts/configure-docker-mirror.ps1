# Docker 镜像加速器配置脚本
# 用于解决 Docker Hub 连接问题

$ErrorActionPreference = "Stop"

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         Docker 镜像加速器配置工具                           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Docker Desktop 配置文件路径
$dockerConfigPath = "$env:USERPROFILE\.docker\daemon.json"

# 推荐的国内镜像源
$mirrors = @(
    "https://docker.m.daocloud.io",           # DaoCloud
    "https://docker.1panel.live",             # 1Panel
    "https://hub.rat.dev",                    # Rat.dev
    "https://docker.anyhub.us.kg",            # AnyHub
    "https://dockerhub.icu"                   # DockerHub ICU
)

Write-Host "推荐的 Docker 镜像加速器:" -ForegroundColor Green
for ($i = 0; $i -lt $mirrors.Length; $i++) {
    Write-Host "  $($i+1). $($mirrors[$i])" -ForegroundColor White
}

Write-Host "`n📝 配置步骤:`n" -ForegroundColor Cyan

Write-Host "方式1: 自动配置 (推荐)" -ForegroundColor Green
Write-Host "--------------------------------------" -ForegroundColor Gray

if (Test-Path $dockerConfigPath) {
    Write-Host "检测到现有配置: $dockerConfigPath" -ForegroundColor Yellow
    $existingConfig = Get-Content $dockerConfigPath -Raw | ConvertFrom-Json
    Write-Host "当前配置:" -ForegroundColor Cyan
    $existingConfig | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
    Write-Host ""
}

$autoConfig = Read-Host "是否自动添加镜像加速器? (y/N)"

if ($autoConfig -eq "y" -or $autoConfig -eq "Y") {
    # 创建或更新配置
    $config = @{}
    
    if (Test-Path $dockerConfigPath) {
        $config = Get-Content $dockerConfigPath -Raw | ConvertFrom-Json -AsHashtable
    }
    
    $config["registry-mirrors"] = $mirrors
    
    # 备份原配置
    if (Test-Path $dockerConfigPath) {
        $backupPath = "$dockerConfigPath.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
        Copy-Item $dockerConfigPath $backupPath
        Write-Host "✓ 已备份原配置到: $backupPath" -ForegroundColor Green
    }
    
    # 写入新配置
    $config | ConvertTo-Json -Depth 10 | Out-File $dockerConfigPath -Encoding UTF8
    Write-Host "✓ 配置已更新: $dockerConfigPath" -ForegroundColor Green
    Write-Host "`n新配置内容:" -ForegroundColor Cyan
    Get-Content $dockerConfigPath | Write-Host -ForegroundColor Gray
    
    Write-Host "`n⚠️  需要重启 Docker Desktop 使配置生效" -ForegroundColor Yellow
    $restart = Read-Host "是否立即重启 Docker Desktop? (y/N)"
    
    if ($restart -eq "y" -or $restart -eq "Y") {
        Write-Host "正在重启 Docker Desktop..." -ForegroundColor Cyan
        
        # 停止 Docker Desktop
        Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        
        # 启动 Docker Desktop
        $dockerPath = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
        if (Test-Path $dockerPath) {
            Start-Process $dockerPath
            Write-Host "✓ Docker Desktop 已启动，请等待其完全启动后继续..." -ForegroundColor Green
            Write-Host "  (通常需要 30-60 秒)" -ForegroundColor Gray
        } else {
            Write-Host "✗ 未找到 Docker Desktop，请手动重启" -ForegroundColor Red
        }
    }
} else {
    Write-Host "`n方式2: 手动配置" -ForegroundColor Green
    Write-Host "--------------------------------------" -ForegroundColor Gray
    Write-Host "1. 打开 Docker Desktop" -ForegroundColor White
    Write-Host "2. 点击右上角 ⚙️  (设置)" -ForegroundColor White
    Write-Host "3. 选择 'Docker Engine'" -ForegroundColor White
    Write-Host "4. 在 JSON 配置中添加:" -ForegroundColor White
    Write-Host ""
    $manualConfig = @{
        "registry-mirrors" = $mirrors
    }
    $manualConfig | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Yellow
    Write-Host ""
    Write-Host "5. 点击 'Apply & Restart'" -ForegroundColor White
}

Write-Host "`n📋 验证配置:`n" -ForegroundColor Cyan
Write-Host "等待 Docker 重启完成后，运行以下命令验证:" -ForegroundColor White
Write-Host "  docker info | Select-String 'Registry Mirrors'" -ForegroundColor Gray

Write-Host "`n🔄 完成配置后，重新构建 FastGPT:" -ForegroundColor Cyan
Write-Host "  cd D:\FastGPT" -ForegroundColor White
Write-Host "  .\scripts\build-advanced-fastgpt.ps1`n" -ForegroundColor White

Write-Host "💡 提示: 如果仍然无法拉取镜像，可能需要:" -ForegroundColor Yellow
Write-Host "  1. 检查网络代理设置" -ForegroundColor Gray
Write-Host "  2. 尝试使用 VPN" -ForegroundColor Gray
Write-Host "  3. 使用国内云服务器进行构建`n" -ForegroundColor Gray
