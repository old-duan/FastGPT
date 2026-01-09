# FastGPT 局域网访问配置脚本
# 用途: 配置防火墙规则,允许局域网其他电脑访问FastGPT
# 作者: FastGPT部署助手
# 日期: 2025-12-17

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FastGPT 局域网访问配置" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ 此脚本需要管理员权限运行!" -ForegroundColor Red
    Write-Host "`n请右键点击PowerShell,选择'以管理员身份运行',然后执行:" -ForegroundColor Yellow
    Write-Host "cd D:\FastGPT\scripts" -ForegroundColor White
    Write-Host ".\enable-lan-access.ps1`n" -ForegroundColor White
    pause
    exit 1
}

Write-Host "✅ 管理员权限检查通过`n" -ForegroundColor Green

# 获取本机IP地址
Write-Host "正在获取本机IP地址..." -ForegroundColor Yellow
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | 
    Select-Object -First 1).IPAddress

if (-not $localIP) {
    Write-Host "❌ 无法获取本机IP地址!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✅ 本机IP地址: $localIP`n" -ForegroundColor Green

# 检查Docker容器状态
Write-Host "检查Docker容器状态..." -ForegroundColor Yellow
$fastgptRunning = docker ps --filter "name=fastgpt" --format "{{.Names}}" 2>$null
$minioRunning = docker ps --filter "name=fastgpt-minio" --format "{{.Names}}" 2>$null

if (-not $fastgptRunning) {
    Write-Host "❌ FastGPT容器未运行!" -ForegroundColor Red
    Write-Host "请先启动FastGPT: cd D:\FastGPT\deploy\docker\cn; docker-compose -f docker-compose.pg.yml up -d`n" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ FastGPT容器运行正常" -ForegroundColor Green
Write-Host "✅ MinIO容器运行正常`n" -ForegroundColor Green

# 配置防火墙规则
Write-Host "配置防火墙规则..." -ForegroundColor Yellow

# 删除旧规则(如果存在)
Remove-NetFirewallRule -DisplayName "FastGPT-HTTP" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "FastGPT-MinIO-API" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "FastGPT-MinIO-Console" -ErrorAction SilentlyContinue

# 创建新规则
try {
    # FastGPT主服务端口(3000)
    New-NetFirewallRule -DisplayName "FastGPT-HTTP" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 3000 `
        -Action Allow `
        -Profile Private,Domain `
        -Description "允许局域网访问FastGPT服务(端口3000)" | Out-Null
    
    # MinIO API端口(9000)
    New-NetFirewallRule -DisplayName "FastGPT-MinIO-API" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 9000 `
        -Action Allow `
        -Profile Private,Domain `
        -Description "允许局域网访问MinIO对象存储API(端口9000)" | Out-Null
    
    # MinIO控制台端口(9001)
    New-NetFirewallRule -DisplayName "FastGPT-MinIO-Console" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 9001 `
        -Action Allow `
        -Profile Private,Domain `
        -Description "允许局域网访问MinIO管理控制台(端口9001)" | Out-Null
    
    Write-Host "✅ 防火墙规则配置成功`n" -ForegroundColor Green
} catch {
    Write-Host "❌ 防火墙规则配置失败: $_" -ForegroundColor Red
    pause
    exit 1
}

# 测试端口监听
Write-Host "验证端口监听状态..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
$port9000 = Get-NetTCPConnection -LocalPort 9000 -State Listen -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "✅ 端口 3000 (FastGPT) 正在监听" -ForegroundColor Green
} else {
    Write-Host "⚠️  端口 3000 未监听" -ForegroundColor Yellow
}

if ($port9000) {
    Write-Host "✅ 端口 9000 (MinIO) 正在监听`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  端口 9000 未监听`n" -ForegroundColor Yellow
}

# 生成访问信息
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  配置完成! 访问信息" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📱 本机访问:" -ForegroundColor Yellow
Write-Host "   FastGPT:       http://localhost:3000" -ForegroundColor White
Write-Host "   MinIO控制台:   http://localhost:9001`n" -ForegroundColor White

Write-Host "🌐 局域网访问:" -ForegroundColor Yellow
Write-Host "   FastGPT:       http://$localIP:3000" -ForegroundColor Green
Write-Host "   MinIO控制台:   http://$localIP:9001`n" -ForegroundColor Green

Write-Host "🔑 登录信息:" -ForegroundColor Yellow
Write-Host "   FastGPT用户名:  root" -ForegroundColor White
Write-Host "   FastGPT密码:    1234`n" -ForegroundColor White

Write-Host "📝 局域网其他电脑访问步骤:" -ForegroundColor Yellow
Write-Host "   1. 确保电脑在同一局域网内" -ForegroundColor White
Write-Host "   2. 在浏览器中打开: http://$localIP:3000" -ForegroundColor White
Write-Host "   3. 使用 root/1234 登录`n" -ForegroundColor White

# 创建快捷访问HTML文件
$htmlPath = "D:\FastGPT\scripts\FastGPT-局域网访问.html"
$htmlContent = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FastGPT 局域网访问</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }
        h1 {
            color: #667eea;
            margin-bottom: 30px;
            text-align: center;
            font-size: 32px;
        }
        .info-box {
            background: #f7f9fc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .info-box h2 {
            color: #333;
            font-size: 18px;
            margin-bottom: 15px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-item:last-child { border-bottom: none; }
        .label {
            color: #666;
            font-weight: 500;
        }
        .value {
            color: #333;
            font-weight: 600;
            font-family: 'Courier New', monospace;
        }
        .btn {
            display: inline-block;
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            text-decoration: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            margin: 10px 0;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            background: #4caf50;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 FastGPT 局域网访问</h1>
        
        <div class="info-box">
            <h2>📡 服务器信息</h2>
            <div class="info-item">
                <span class="label">服务器IP:</span>
                <span class="value">$localIP</span>
            </div>
            <div class="info-item">
                <span class="label">服务状态:</span>
                <span class="status">运行中</span>
            </div>
        </div>

        <a href="http://$localIP:3000" class="btn" target="_blank">
            🌟 打开 FastGPT
        </a>

        <a href="http://$localIP:9001" class="btn btn-secondary" target="_blank">
            📦 MinIO 控制台
        </a>

        <div class="info-box">
            <h2>🔑 登录信息</h2>
            <div class="info-item">
                <span class="label">FastGPT 用户名:</span>
                <span class="value">root</span>
            </div>
            <div class="info-item">
                <span class="label">FastGPT 密码:</span>
                <span class="value">1234</span>
            </div>
            <div class="info-item">
                <span class="label">MinIO 用户名:</span>
                <span class="value">minioadmin</span>
            </div>
            <div class="info-item">
                <span class="label">MinIO 密码:</span>
                <span class="value">minioadmin</span>
            </div>
        </div>

        <div class="footer">
            <p>💡 提示: 请确保设备在同一局域网内</p>
            <p>生成时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")</p>
        </div>
    </div>
</body>
</html>
"@

try {
    $htmlContent | Out-File -FilePath $htmlPath -Encoding UTF8
    Write-Host "✅ 已生成快捷访问页面: $htmlPath`n" -ForegroundColor Green
    Write-Host "💡 提示: 可以将此HTML文件发送给局域网内其他用户使用`n" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  HTML文件生成失败: $_`n" -ForegroundColor Yellow
}

# 询问是否打开浏览器测试
Write-Host "是否在浏览器中测试访问? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "`n正在打开浏览器..." -ForegroundColor Yellow
    Start-Process "http://$localIP:3000"
    Start-Sleep -Seconds 2
    Start-Process $htmlPath
}

Write-Host "`n配置完成! 按任意键退出..." -ForegroundColor Green
pause
