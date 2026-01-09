# FRP 内网穿透配置指南（支付宝回调）

## 📋 当前配置信息

### FRP 客户端配置
- **安装路径**: `D:\frp-client\`
- **服务端地址**: `39.107.88.130:7000`
- **认证 Token**: `Duan2050`
- **当前映射**: 本地 3000 端口 → 云服务器

### 服务端公网访问地址
根据您的 FRP 配置，外网访问地址应该是：
```
http://39.107.88.130:3000
```

---

## 🔧 为支付宝回调配置 FRP 映射

### 问题分析
当前 FRP 配置映射的是 **3000 端口**（FastGPT 主应用），但：
- FastGPT 开发环境运行在 `3001` 端口
- 支付宝回调地址需要访问 `http://localhost:3001/api/alipay/notify`

### 解决方案：修改 FRP 客户端配置

编辑 `D:\frp-client\frpc.toml`，添加新的映射配置：

```toml
# 1. 改为你的云服务器公网 IP（阿里云 ECS 控制台查看）
serverAddr = "39.107.88.130"  # 示例：120.25.100.50

# 2. 服务端通信端口（和服务端 bindPort 一致，固定 7000）
serverPort = 7000

# 3. 安全 token（必须和服务端 frps.toml 中的 token 完全一致！）
[auth]
token = "Duan2050"  # 改为你服务端设置的 token

# 映射本地 FastGPT 配置（生产环境 3000 端口）
[[proxies]]
name = "local-fastgpt-api"  # 必须和服务端 proxies.name 一致
type = "tcp"
localIP = "127.0.0.1"  # 本地地址（固定）
localPort = 3000  # 本地 FastGPT 运行端口（默认 3000）

# ========== 新增：映射开发环境 3001 端口（用于支付宝回调）==========
[[proxies]]
name = "local-fastgpt-dev"  # 开发环境映射
type = "tcp"
localIP = "127.0.0.1"
localPort = 3001  # FastGPT 开发环境端口
remotePort = 3001  # 云服务器监听端口（需要在服务端开放）
```

---

## 🚀 服务端配置（需要在云服务器操作）

### 1. 修改服务端配置 `frps.toml`

SSH 登录到云服务器 `39.107.88.130`，编辑 FRP 服务端配置：

```bash
# 登录云服务器
ssh root@39.107.88.130

# 编辑服务端配置（假设在 /root/frp-server/ 目录）
vi /root/frp-server/frps.toml
```

添加以下配置：

```toml
# FRP 服务端配置
bindPort = 7000  # 客户端连接端口

[auth]
token = "Duan2050"  # 和客户端保持一致

# 原有的 3000 端口映射
[[proxies]]
name = "local-fastgpt-api"
type = "tcp"
remotePort = 3000

# ========== 新增：3001 端口映射（用于支付宝回调）==========
[[proxies]]
name = "local-fastgpt-dev"
type = "tcp"
remotePort = 3001  # 云服务器监听端口
```

### 2. 开放云服务器端口（阿里云 ECS 安全组）

登录阿里云控制台：
1. 进入 **ECS 控制台** → **实例列表**
2. 找到 IP 为 `39.107.88.130` 的实例
3. 点击 **安全组** → **配置规则**
4. 点击 **添加安全组规则**：
   - **协议类型**: TCP
   - **端口范围**: 3001/3001
   - **授权对象**: 0.0.0.0/0（允许所有 IP 访问）
   - **描述**: FastGPT 开发环境（支付宝回调）
5. 点击 **确定**

### 3. 重启 FRP 服务端

```bash
# 停止 FRP 服务端
pkill frps

# 启动 FRP 服务端
cd /root/frp-server
nohup ./frps -c frps.toml > frps.log 2>&1 &

# 查看启动日志
tail -f frps.log
```

---

## 💻 本地操作（Windows）

### 1. 修改 FRP 客户端配置

已完成（见上方 `frpc.toml` 配置）

### 2. 重启 FRP 客户端

```powershell
# 停止现有的 FRP 进程（如果正在运行）
Get-Process frpc -ErrorAction SilentlyContinue | Stop-Process -Force

# 启动 FRP 客户端
cd D:\frp-client
.\frpc.exe -c frpc.toml

# 或者使用后台启动
Start-Process -FilePath "D:\frp-client\frpc.exe" -ArgumentList "-c", "frpc.toml" -WindowStyle Hidden
```

### 3. 验证连接

检查 FRP 客户端日志，应该看到类似输出：
```
[I] [service.go:xxx] login to server success, get run id [xxx]
[I] [proxy_manager.go:xxx] [local-fastgpt-api] start proxy success
[I] [proxy_manager.go:xxx] [local-fastgpt-dev] start proxy success
```

---

## 🔧 修改支付宝回调地址

编辑 `D:\FastGPT\projects\app\.env.local`：

```bash
# 回调通知地址（使用 FRP 映射后的公网地址）
ALIPAY_NOTIFY_URL=http://39.107.88.130:3001/api/alipay/notify

# 支付成功后跳转地址（使用 FRP 映射后的公网地址）
ALIPAY_RETURN_URL=http://39.107.88.130:3001/account/balance
```

---

## ✅ 测试验证

### 1. 启动 FastGPT 开发服务器

```powershell
cd D:\FastGPT\projects\app
pnpm dev
```

### 2. 测试公网访问

在浏览器访问：
```
http://39.107.88.130:3001
```

如果能够访问 FastGPT 界面，说明 FRP 映射成功。

### 3. 测试回调接口（模拟支付宝通知）

```powershell
# 使用 curl 模拟支付宝回调
curl -X POST http://39.107.88.130:3001/api/alipay/notify `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "out_trade_no=TEST123&trade_status=TRADE_SUCCESS"
```

预期返回：
```
success
```

---

## 🔒 生产环境建议

### 1. 使用 HTTPS
支付宝要求生产环境必须使用 HTTPS 回调地址。

**方案 A：Nginx 反向代理 + Let's Encrypt 证书**
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**方案 B：使用 FRP 的 HTTPS 插件**
```toml
[[proxies]]
name = "local-fastgpt-dev-https"
type = "https"
customDomains = ["yourdomain.com"]
localIP = "127.0.0.1"
localPort = 3001
```

### 2. 域名配置
回调地址使用域名而不是 IP：
```bash
ALIPAY_NOTIFY_URL=https://yourdomain.com/api/alipay/notify
ALIPAY_RETURN_URL=https://yourdomain.com/account/balance
```

### 3. 安全性加固
- 验证支付宝回调签名
- 使用 Token 认证
- 限制回调 IP 来源（只允许支付宝服务器 IP）

---

## 📚 相关文档

- [FRP 官方文档](https://gofrp.org/zh-cn/docs/)
- [支付宝回调通知](https://opendocs.alipay.com/open/203/105286)
- [阿里云 ECS 安全组配置](https://help.aliyun.com/document_detail/25471.html)

---

## 🆘 常见问题

### 1. FRP 客户端连接失败？
- 检查云服务器 7000 端口是否开放
- 检查 Token 是否和服务端一致
- 检查云服务器防火墙设置

### 2. 公网无法访问 3001 端口？
- 检查云服务器安全组是否开放 3001 端口
- 检查 FRP 服务端是否正确配置映射
- 检查 FRP 服务端是否正常运行

### 3. 支付宝回调通知失败？
- 检查回调地址是否公网可访问
- 检查回调接口是否返回 "success"
- 查看 FastGPT 后台日志是否有错误

### 4. FRP 连接经常断开？
- 添加心跳配置（frpc.toml）：
  ```toml
  [common]
  heartbeatInterval = 30
  heartbeatTimeout = 90
  ```

---

**配置完成后，记得重启 FRP 客户端和 FastGPT 开发服务器！**
