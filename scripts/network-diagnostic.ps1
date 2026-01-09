# FastGPT 网络诊断脚本
# 用途: 诊断局域网访问问题
# 作者: FastGPT部署助手

param(
    [string]$ServerIP = ""
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FastGPT 网络诊断工具" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 获取本机IP
if ([string]::IsNullOrEmpty($ServerIP)) {
    $ServerIP = (Get-NetIPAddress -AddressFamily IPv4 | 
        Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | 
        Select-Object -First 1).IPAddress
}

Write-Host "🖥️  服务器IP: $ServerIP`n" -ForegroundColor Green

# 1. 检查Docker容器状态
Write-Host "1️⃣  检查Docker容器状态..." -ForegroundColor Yellow
$fastgptContainer = docker ps --filter "name=fastgpt" --format "{{.Names}},{{.Status}}" 2>$null
$minioContainer = docker ps --filter "name=fastgpt-minio" --format "{{.Names}},{{.Status}}" 2>$null

if ($fastgptContainer) {
    Write-Host "   ✅ FastGPT容器: $fastgptContainer" -ForegroundColor Green
} else {
    Write-Host "   ❌ FastGPT容器未运行!" -ForegroundColor Red
}

if ($minioContainer) {
    Write-Host "   ✅ MinIO容器: $minioContainer`n" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  MinIO容器未运行`n" -ForegroundColor Yellow
}

# 2. 检查端口监听
Write-Host "2️⃣  检查端口监听状态..." -ForegroundColor Yellow
$ports = @(3000, 9000, 9001)
foreach ($port in $ports) {
    $listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listening) {
        $address = $listening[0].LocalAddress
        Write-Host "   ✅ 端口 $port 正在监听 ($address)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ 端口 $port 未监听" -ForegroundColor Red
    }
}
Write-Host ""

# 3. 检查端口映射
Write-Host "3️⃣  检查Docker端口映射..." -ForegroundColor Yellow
try {
    $fastgptPorts = docker port fastgpt 2>$null
    $minioPorts = docker port fastgpt-minio 2>$null
    
    if ($fastgptPorts -match "0\.0\.0\.0") {
        Write-Host "   ✅ FastGPT端口已绑定所有接口 (0.0.0.0)" -ForegroundColor Green
    } elseif ($fastgptPorts -match "127\.0\.0\.1") {
        Write-Host "   ⚠️  FastGPT端口仅绑定本地 (127.0.0.1) - 需要修改!" -ForegroundColor Yellow
    }
    
    if ($minioPorts -match "0\.0\.0\.0") {
        Write-Host "   ✅ MinIO端口已绑定所有接口 (0.0.0.0)`n" -ForegroundColor Green
    } elseif ($minioPorts -match "127\.0\.0\.1") {
        Write-Host "   ⚠️  MinIO端口仅绑定本地 (127.0.0.1) - 需要修改!`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ 无法获取端口映射信息`n" -ForegroundColor Red
}

# 4. 检查防火墙规则
Write-Host "4️⃣  检查Windows防火墙规则..." -ForegroundColor Yellow
$firewallRules = Get-NetFirewallRule -DisplayName "FastGPT*" -ErrorAction SilentlyContinue

if ($firewallRules) {
    foreach ($rule in $firewallRules) {
        $enabled = if ($rule.Enabled) { "✅" } else { "❌" }
        Write-Host "   $enabled $($rule.DisplayName) - $($rule.Direction)" -ForegroundColor Green
    }
    Write-Host ""
} else {
    Write-Host "   ⚠️  未找到FastGPT防火墙规则 - 可能需要配置!`n" -ForegroundColor Yellow
}

# 5. 测试本地连接
Write-Host "5️⃣  测试本地连接..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ 本地访问正常 (HTTP $($response.StatusCode))`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ 本地访问失败: $($_.Exception.Message)`n" -ForegroundColor Red
}

# 6. 测试网络接口连接
Write-Host "6️⃣  测试网络接口连接..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://${ServerIP}:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ 网络接口访问正常 (HTTP $($response.StatusCode))`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ 网络接口访问失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 这可能是防火墙问题,请运行: .\enable-lan-access.ps1`n" -ForegroundColor Yellow
}

# 7. 检查网络适配器
Write-Host "7️⃣  网络适配器信息..." -ForegroundColor Yellow
$adapters = Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object {$_.InterfaceAlias -notlike "*Loopback*"} | 
    Select-Object InterfaceAlias, IPAddress

foreach ($adapter in $adapters) {
    Write-Host "   📡 $($adapter.InterfaceAlias): $($adapter.IPAddress)" -ForegroundColor Cyan
}
Write-Host ""

# 8. 测试MinIO健康检查
Write-Host "8️⃣  测试MinIO服务..." -ForegroundColor Yellow
try {
    $minioHealth = Invoke-WebRequest -Uri "http://localhost:9000/minio/health/live" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ MinIO健康检查通过 (HTTP $($minioHealth.StatusCode))`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ MinIO健康检查失败: $($_.Exception.Message)`n" -ForegroundColor Red
}

# 9. 检查MongoDB连接
Write-Host "9️⃣  检查MongoDB连接..." -ForegroundColor Yellow
try {
    $mongoTest = docker exec mongo mongosh -u myusername -p mypassword --authenticationDatabase admin --eval "db.adminCommand('ping')" 2>&1
    if ($mongoTest -match "ok.*1") {
        Write-Host "   ✅ MongoDB连接正常`n" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MongoDB连接异常`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ MongoDB连接失败`n" -ForegroundColor Red
}

# 10. 生成诊断报告
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  诊断结果汇总" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📊 访问地址:" -ForegroundColor Yellow
Write-Host "   本地: http://localhost:3000" -ForegroundColor White
Write-Host "   局域网: http://${ServerIP}:3000`n" -ForegroundColor White

Write-Host "🔧 常见问题解决:" -ForegroundColor Yellow
Write-Host "   1. 容器未运行 → 运行: docker-compose -f docker-compose.pg.yml up -d" -ForegroundColor White
Write-Host "   2. 防火墙阻止 → 运行: .\enable-lan-access.ps1" -ForegroundColor White
Write-Host "   3. 端口映射错误 → 修改docker-compose.yml为0.0.0.0" -ForegroundColor White
Write-Host "   4. 网络不通 → 检查路由器/交换机设置`n" -ForegroundColor White

Write-Host "📖 详细文档:" -ForegroundColor Yellow
Write-Host "   docs/LAN_ACCESS_GUIDE.md" -ForegroundColor Cyan
Write-Host "   DOCKER_DEPLOYMENT_SOLUTION.md`n" -ForegroundColor Cyan

# 询问是否尝试修复
Write-Host "是否尝试自动修复问题? (Y/N): " -ForegroundColor Yellow -NoNewline
$fix = Read-Host

if ($fix -eq "Y" -or $fix -eq "y") {
    Write-Host "`n正在尝试修复...`n" -ForegroundColor Yellow
    
    # 检查是否有管理员权限
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if ($isAdmin) {
        Write-Host "✅ 具有管理员权限,正在配置防火墙..." -ForegroundColor Green
        & ".\enable-lan-access.ps1"
    } else {
        Write-Host "⚠️  需要管理员权限才能修复" -ForegroundColor Yellow
        Write-Host "请以管理员身份运行: .\enable-lan-access.ps1`n" -ForegroundColor White
    }
}

Write-Host "`n诊断完成! 按任意键退出..." -ForegroundColor Green
pause
