# 支付宝沙箱配置指南

## 📋 沙箱账号信息

### 商家信息
- **商户账号**: qltxwf5382@sandbox.com
- **登录密码**: 111111
- **商户 PID**: 2088721092522042
- **账户余额**: 100万元 ✅

### 买家信息
- **买家账号**: qabjwm6264@sandbox.com
- **登录密码**: 111111
- **支付密码**: 111111
- **用户 UID**: 2088722092483551
- **用户名称**: qabjwm6264
- **证件类型**: IDENTITY_CARD
- **证件号码**: 812166198707012005
- **账户余额**: 100万元 ✅

---

## 🔧 应用配置信息

### 基本信息
- **APPID**: `9021000159612884`
- **应用名称**: sandbox 默认应用:2088721092522042
- **绑定的商家账号（PID）**: `2088721092522042`

### 开发信息
- **接口加签方式**: 系统默认密钥（公钥模式已启用）
- **证书模式**: 未启用
- **支付网关地址**: `https://openapi-sandbox.dl.alipaydev.com/gateway.do`
- **WebSocket 服务地址**: `openchannel-sandbox.dl.alipaydev.com`
- **应用网关地址**: 设置（需配置）
- **授权回调地址**: 设置（需配置）
- **接口内容加密方式**: 设置（需配置）
- **OpenId 设置**: userId（默认）

---

## 🚀 快速配置步骤

### 第 1 步：生成应用公私钥对

#### 方案 A：使用支付宝官方工具（推荐）
1. 下载工具：https://opendocs.alipay.com/common/02kipk
2. 选择密钥长度：`RSA2 (2048位)`
3. 选择密钥格式：`PKCS1 (非JAVA适用)`
4. 点击生成密钥
5. 保存私钥到本地（**不要泄露**）
6. 复制应用公钥

#### 方案 B：使用 OpenSSL（命令行）
```bash
# 生成私钥
openssl genrsa -out alipay_private_key.pem 2048

# 从私钥生成公钥
openssl rsa -in alipay_private_key.pem -pubout -out alipay_public_key.pem

# 转换为 PKCS1 格式（去掉头尾标记）
openssl rsa -in alipay_private_key.pem -outform PEM -out alipay_private_key_pkcs1.pem
```

### 第 2 步：上传应用公钥到支付宝

1. 登录支付宝开放平台沙箱：https://openhome.alipay.com/develop/sandbox/app
2. 进入 **沙箱应用** → **应用信息** → **开发信息**
3. 找到 **接口加签方式** → 点击 **查看/设置**
4. 选择 **公钥模式** → 点击 **上传应用公钥**
5. 粘贴步骤 1 生成的 **应用公钥**（去掉头尾标记）
6. 点击保存
7. **保存支付宝公钥**（支付宝会生成并显示）

### 第 3 步：配置 .env.local

编辑 `projects/app/.env.local` 文件：

```bash
# 填入你的应用私钥（去掉头尾标记和换行符，单行字符串）
ALIPAY_PRIVATE_KEY=MIIEpAIBAAKCAQEA...（完整的私钥内容）

# 填入支付宝公钥（从支付宝开放平台获取，去掉头尾标记和换行符）
ALIPAY_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...（完整的公钥内容）
```

**重要提示**：
- 私钥格式为单行字符串，去掉 `-----BEGIN RSA PRIVATE KEY-----` 和 `-----END RSA PRIVATE KEY-----`
- 去掉所有换行符和空格
- 不要将私钥提交到 Git 仓库

### 第 4 步：配置回调地址（内网穿透）

开发环境需要配置内网穿透工具，让支付宝能够访问本地回调接口。

#### 方案 A：使用 ngrok（推荐）
```bash
# 安装 ngrok
# Windows: 下载 https://ngrok.com/download
# Mac: brew install ngrok
# Linux: snap install ngrok

# 启动内网穿透（映射到本地 3001 端口）
ngrok http 3001

# 复制生成的 https 地址，例如：
# https://abc123.ngrok.io

# 修改 .env.local
ALIPAY_NOTIFY_URL=https://abc123.ngrok.io/api/alipay/notify
ALIPAY_RETURN_URL=https://abc123.ngrok.io/account/balance
```

#### 方案 B：使用花生壳（国内）
1. 注册账号：https://hsk.oray.com
2. 下载客户端并登录
3. 添加映射：`本地端口 3001` → `外网域名`
4. 复制外网域名地址
5. 修改 .env.local 的回调地址

#### 方案 C：跳过回调配置（仅测试）
如果只是测试支付流程，可以暂时使用本地地址：
```bash
ALIPAY_NOTIFY_URL=http://localhost:3001/api/alipay/notify
ALIPAY_RETURN_URL=http://localhost:3001/account/balance
```
**注意**：支付宝无法访问本地地址，回调通知会失败，需要手动刷新订单状态。

---

## 📝 环境变量完整配置

编辑 `projects/app/.env.local`：

```bash
# ==================== 支付宝沙箱配置 ====================
# 应用信息
ALIPAY_APP_ID=9021000159612884
ALIPAY_PID=2088721092522042

# 支付网关地址（沙箱环境）
ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do

# WebSocket 服务地址（沙箱环境）
ALIPAY_WEBSOCKET=openchannel-sandbox.dl.alipaydev.com

# 应用私钥（RSA2 格式，生成后填入）
ALIPAY_PRIVATE_KEY=MIIEpAIBAAKCAQEA...（完整的私钥内容）

# 支付宝公钥（RSA2 格式，从支付宝开放平台获取）
ALIPAY_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...（完整的公钥内容）

# 回调通知地址（需要外网可访问的地址）
ALIPAY_NOTIFY_URL=https://your-domain.ngrok.io/api/alipay/notify

# 支付成功后跳转地址
ALIPAY_RETURN_URL=https://your-domain.ngrok.io/account/balance
```

---

## ✅ 配置验证

### 1. 检查配置是否生效
```bash
# 进入项目目录
cd projects/app

# 启动开发服务器
pnpm dev

# 查看环境变量是否加载
# 访问 http://localhost:3001
# 打开浏览器控制台，检查是否有支付宝配置错误日志
```

### 2. 测试支付接口
```typescript
// 创建测试接口：projects/app/src/pages/api/alipay/test.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const config = {
    appId: process.env.ALIPAY_APP_ID,
    gateway: process.env.ALIPAY_GATEWAY,
    hasPrivateKey: !!process.env.ALIPAY_PRIVATE_KEY,
    hasPublicKey: !!process.env.ALIPAY_PUBLIC_KEY,
  };
  
  res.json(config);
}
```

访问：http://localhost:3001/api/alipay/test

期望返回：
```json
{
  "appId": "9021000159612884",
  "gateway": "https://openapi-sandbox.dl.alipaydev.com/gateway.do",
  "hasPrivateKey": true,
  "hasPublicKey": true
}
```

### 3. 测试支付流程（模拟）
使用买家账号 `qabjwm6264@sandbox.com` 登录沙箱：
1. 访问支付页面
2. 使用买家账号登录：`qabjwm6264@sandbox.com`
3. 输入支付密码：`111111`
4. 确认支付
5. 检查回调通知是否接收到

---

## 🔒 安全注意事项

### 1. 私钥保护
- ❌ **绝对不要**将私钥提交到 Git 仓库
- ✅ 将 `.env.local` 添加到 `.gitignore`
- ✅ 使用环境变量或密钥管理工具（如 AWS Secrets Manager）

### 2. .gitignore 配置
确保 `.env.local` 已添加到 `.gitignore`：
```bash
# .gitignore
.env.local
.env.local.*
.env*.local
```

### 3. 生产环境配置
生产环境需要：
- 申请正式的支付宝商户账号
- 使用正式网关地址：`https://openapi.alipay.com/gateway.do`
- 配置正式的回调地址（HTTPS）
- 启用证书模式（更安全）

---

## 📚 相关文档

- [支付宝开放平台](https://open.alipay.com/)
- [沙箱环境使用说明](https://opendocs.alipay.com/common/02kkv7)
- [密钥生成工具](https://opendocs.alipay.com/common/02kipk)
- [网页支付 API](https://opendocs.alipay.com/open/59da99d0_alipay.trade.page.pay)
- [支付回调通知](https://opendocs.alipay.com/open/203/105286)

---

## 🆘 常见问题

### 1. 应用公钥上传失败？
- 检查格式是否正确（PKCS1 格式，去掉头尾标记）
- 检查是否有多余的空格或换行符
- 尝试重新生成密钥对

### 2. 支付时提示"签名错误"？
- 检查应用私钥是否正确
- 检查支付宝公钥是否正确
- 检查密钥格式（单行字符串，无头尾标记）

### 3. 回调通知收不到？
- 检查回调地址是否外网可访问
- 检查内网穿透工具是否正常运行
- 检查回调接口是否正确实现（返回 "success"）

### 4. 沙箱余额不足？
- 点击沙箱页面的"充值"按钮可以重置余额到 100万元
- 无需真实充值，沙箱环境是虚拟资金

---

**配置完成后，记得重启开发服务器！**
```bash
# 按 Ctrl+C 停止服务器
pnpm dev
```
