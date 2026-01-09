# FastGPT 高级版镜像构建脚本
Write-Host "`n════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 FastGPT 高级版镜像构建" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════`n" -ForegroundColor Cyan

# 确认源码修改
Write-Host "📝 检查源码修改..." -ForegroundColor Yellow

$indexTs = "projects/app/src/service/common/system/index.ts"
$publishTsx = "projects/app/src/pageComponents/app/detail/Publish/index.tsx"

if (!(Test-Path $indexTs)) {
    Write-Host "❌ 找不到 $indexTs" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $publishTsx)) {
    Write-Host "❌ 找不到 $publishTsx" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 源码文件存在" -ForegroundColor Green

# 检查关键修改
$indexContent = Get-Content $indexTs -Raw
if ($indexContent -match "isPlus:\s*true") {
    Write-Host "✓ isPlus 修改已确认" -ForegroundColor Green
} else {
    Write-Host "⚠️  警告: isPlus 可能未设置为 true" -ForegroundColor Yellow
}

# 停止现有容器
Write-Host "`n🛑 停止现有 FastGPT 容器..." -ForegroundColor Yellow
docker stop fastgpt 2>$null

# 删除旧镜像
Write-Host "`n🗑️  删除旧的高级版镜像..." -ForegroundColor Yellow
docker rmi fastgpt-advanced:latest 2>$null

# 构建新镜像
Write-Host "`n🔨 开始构建高级版镜像..." -ForegroundColor Cyan
Write-Host "   这可能需要 10-15 分钟，请耐心等待..." -ForegroundColor Gray

$buildStart = Get-Date

docker build `
    -t fastgpt-advanced:latest `
    -f projects/app/Dockerfile `
    --build-arg proxy=taobao `
    .

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ 镜像构建失败!" -ForegroundColor Red
    exit 1
}

$buildEnd = Get-Date
$buildTime = ($buildEnd - $buildStart).TotalMinutes

Write-Host "`n✓ 镜像构建成功! 耗时: $([math]::Round($buildTime, 2)) 分钟" -ForegroundColor Green

# 检查镜像
Write-Host "`n📦 镜像信息:" -ForegroundColor Cyan
docker images | Select-String "fastgpt-advanced"

# 更新 docker-compose
Write-Host "`n📝 更新 docker-compose 配置..." -ForegroundColor Yellow

$dockerComposePath = "deploy/docker/cn/docker-compose.pg.yml"
if (Test-Path $dockerComposePath) {
    $composeContent = Get-Content $dockerComposePath -Raw
    if ($composeContent -match "image:\s*fastgpt-advanced:latest") {
        Write-Host "✓ docker-compose 已使用高级版镜像" -ForegroundColor Green
    } else {
        Write-Host "⚠️  docker-compose 可能需要手动更新镜像名称" -ForegroundColor Yellow
    }
}

# 启动服务
Write-Host "`n🚀 启动 FastGPT 服务..." -ForegroundColor Cyan
cd deploy/docker/cn
docker-compose -f docker-compose.pg.yml up -d fastgpt

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ 服务启动失败!" -ForegroundColor Red
    exit 1
}

Write-Host "`n⏳ 等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 检查日志
Write-Host "`n📋 服务日志:" -ForegroundColor Cyan
docker logs --tail=20 fastgpt | Select-String "Init system|isPlus|Load models"

Write-Host "`n════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ FastGPT 高级版部署完成!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════`n" -ForegroundColor Green

Write-Host "🌐 访问地址:" -ForegroundColor Cyan
Write-Host "   局域网: http://192.168.110.18:3000" -ForegroundColor White
Write-Host "   账号:   root / 1234`n" -ForegroundColor White

Write-Host "📝 验证步骤:" -ForegroundColor Yellow
Write-Host "   1. 登录系统" -ForegroundColor White
Write-Host "   2. 创建知识库 → 测试 'Web站点同步'" -ForegroundColor White
Write-Host "   3. 应用发布 → 测试 '飞书/钉钉/微信公众号'" -ForegroundColor White
Write-Host "   4. 确认不再提示 '请升级商业版'`n" -ForegroundColor White
