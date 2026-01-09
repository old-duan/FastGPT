# 生成支付宝 RSA2 密钥对（PowerShell 版本）
# 由于 Windows 没有内置 OpenSSL，使用 .NET 生成密钥

Add-Type -AssemblyName System.Security

# 生成 2048 位 RSA 密钥对
$rsa = [System.Security.Cryptography.RSA]::Create(2048)

# 导出私钥（PKCS#1 格式）
$privateKey = $rsa.ExportRSAPrivateKey()
$privateKeyPem = "-----BEGIN RSA PRIVATE KEY-----`n"
$privateKeyPem += [Convert]::ToBase64String($privateKey, [System.Base64FormattingOptions]::InsertLineBreaks)
$privateKeyPem += "`n-----END RSA PRIVATE KEY-----"

# 导出公钥（PKCS#1 格式）
$publicKey = $rsa.ExportRSAPublicKey()
$publicKeyPem = "-----BEGIN RSA PUBLIC KEY-----`n"
$publicKeyPem += [Convert]::ToBase64String($publicKey, [System.Base64FormattingOptions]::InsertLineBreaks)
$publicKeyPem += "`n-----END RSA PUBLIC KEY-----"

# 保存私钥到文件
$privateKeyPath = "D:\FastGPT\alipay_private_key.pem"
$privateKeyPem | Out-File -FilePath $privateKeyPath -Encoding utf8
Write-Host "✅ 私钥已保存到: $privateKeyPath" -ForegroundColor Green

# 保存公钥到文件
$publicKeyPath = "D:\FastGPT\alipay_public_key.pem"
$publicKeyPem | Out-File -FilePath $publicKeyPath -Encoding utf8
Write-Host "✅ 公钥已保存到: $publicKeyPath" -ForegroundColor Green

# 输出单行格式的私钥（用于 .env.local）
$privateKeyBase64 = [Convert]::ToBase64String($privateKey)
Write-Host "`n===================================================" -ForegroundColor Yellow
Write-Host "📋 复制以下私钥到 .env.local 的 ALIPAY_PRIVATE_KEY" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Yellow
Write-Host $privateKeyBase64 -ForegroundColor Cyan

# 输出单行格式的公钥（用于上传到支付宝）
$publicKeyBase64 = [Convert]::ToBase64String($publicKey)
Write-Host "`n===================================================" -ForegroundColor Yellow
Write-Host "📋 复制以下公钥上传到支付宝沙箱" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Yellow
Write-Host $publicKeyBase64 -ForegroundColor Cyan

Write-Host "`n✅ 密钥生成完成！" -ForegroundColor Green
Write-Host "📝 下一步操作：" -ForegroundColor Yellow
Write-Host "  1. 复制上面的公钥（单行格式）" -ForegroundColor White
Write-Host "  2. 访问：https://openhome.alipay.com/develop/sandbox/app" -ForegroundColor White
Write-Host "  3. 进入【开发信息】→【接口加签方式】→【设置】" -ForegroundColor White
Write-Host "  4. 选择【公钥模式】→【上传应用公钥】" -ForegroundColor White
Write-Host "  5. 粘贴公钥（无需头尾标记）→【保存】" -ForegroundColor White
Write-Host "  6. 复制支付宝公钥（支付宝会生成并显示）" -ForegroundColor White
Write-Host "  7. 将私钥和支付宝公钥填入 projects/app/.env.local" -ForegroundColor White
