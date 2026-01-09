# FastGPT 局域网访问配置指南

本指南帮助您配置FastGPT,使局域网内其他电脑可以访问。

## 📋 目录

- [快速开始](#快速开始)
- [端口说明](#端口说明)
- [配置步骤](#配置步骤)
- [客户端访问](#客户端访问)
- [故障排除](#故障排除)

## 🚀 快速开始

### 方法1: 一键配置脚本(推荐)

```powershell
# 1. 以管理员身份运行PowerShell
# 右键点击PowerShell图标 → 以管理员身份运行

# 2. 执行配置脚本
cd D:\FastGPT\scripts
.\enable-lan-access.ps1
```

脚本会自动:
- ✅ 检查Docker容器状态
- ✅ 配置Windows防火墙规则
- ✅ 显示本机IP和访问地址
- ✅ 生成局域网访问页面

### 方法2: 手动配置

如果脚本无法运行,可以手动配置:

```powershell
# 1. 获取本机IP
ipconfig | Select-String "IPv4"

# 2. 添加防火墙规则
New-NetFirewallRule -DisplayName "FastGPT-HTTP" `
    -Direction Inbound -Protocol TCP -LocalPort 3000 `
    -Action Allow -Profile Private,Domain

New-NetFirewallRule -DisplayName "FastGPT-MinIO-API" `
    -Direction Inbound -Protocol TCP -LocalPort 9000 `
    -Action Allow -Profile Private,Domain

New-NetFirewallRule -DisplayName "FastGPT-MinIO-Console" `
    -Direction Inbound -Protocol TCP -LocalPort 9001 `
    -Action Allow -Profile Private,Domain

# 3. 验证端口监听
Get-NetTCPConnection -LocalPort 3000,9000,9001 -State Listen
```

## 🔌 端口说明

| 端口 | 服务 | 用途 | 是否必须开放 |
|------|------|------|-------------|
| 3000 | FastGPT Web | 主要访问入口 | ✅ 必须 |
| 9000 | MinIO API | 文件上传/下载 | ✅ 必须 |
| 9001 | MinIO Console | MinIO管理界面 | ⚪ 可选 |

**注意**: 
- 端口3000和9000必须同时开放,否则文件上传功能会失败
- 端口9001仅用于MinIO管理,普通用户不需要访问

## ⚙️ 配置步骤

### 1. 服务器端配置

#### 检查Docker端口映射

```powershell
# 查看当前端口映射
docker port fastgpt
docker port fastgpt-minio

# 应该显示:
# 3000/tcp -> 0.0.0.0:3000
# 9000/tcp -> 0.0.0.0:9000
# 9001/tcp -> 0.0.0.0:9001
```

如果显示 `127.0.0.1` 而不是 `0.0.0.0`,需要修改docker-compose配置:

```yaml
# D:\FastGPT\deploy\docker\cn\docker-compose.pg.yml
services:
  fastgpt:
    ports:
      - "0.0.0.0:3000:3000"  # 修改这里
  
  fastgpt-minio:
    ports:
      - "0.0.0.0:9000:9000"  # 修改这里
      - "0.0.0.0:9001:9001"  # 修改这里
```

然后重启:
```powershell
cd D:\FastGPT\deploy\docker\cn
docker-compose -f docker-compose.pg.yml down
docker-compose -f docker-compose.pg.yml up -d
```

#### 配置防火墙

**方式A: 使用脚本(推荐)**
```powershell
cd D:\FastGPT\scripts
.\enable-lan-access.ps1
```

**方式B: Windows防火墙图形界面**
1. 打开 `Windows Defender 防火墙` → `高级设置`
2. 点击 `入站规则` → `新建规则`
3. 选择 `端口` → 下一步
4. 输入端口 `3000,9000,9001` → 下一步
5. 选择 `允许连接` → 下一步
6. 勾选 `专用` 和 `域` → 下一步
7. 命名为 `FastGPT服务` → 完成

#### 获取服务器IP地址

```powershell
# 方法1: PowerShell
(Get-NetIPAddress -AddressFamily IPv4 | 
 Where-Object {$_.InterfaceAlias -notlike "*Loopback*"} | 
 Select-Object -First 1).IPAddress

# 方法2: 命令行
ipconfig | findstr "IPv4"

# 示例输出: 192.168.1.100
```

### 2. 客户端访问

#### 浏览器直接访问

在局域网内其他电脑的浏览器中访问:

```
http://服务器IP:3000
```

例如,如果服务器IP是 `192.168.1.100`:
```
http://192.168.1.100:3000
```

#### 登录信息

| 项目 | 值 |
|------|-----|
| **FastGPT 用户名** | `root` |
| **FastGPT 密码** | `1234` |
| **MinIO 用户名** | `minioadmin` |
| **MinIO 密码** | `minioadmin` |

#### 使用快捷访问页面

配置脚本会生成一个HTML文件:
```
D:\FastGPT\scripts\FastGPT-局域网访问.html
```

可以通过以下方式分享:
1. **发送文件**: 将HTML文件发送给其他用户,双击打开即可
2. **共享链接**: 告知用户服务器IP,让他们在浏览器输入 `http://IP:3000`
3. **创建快捷方式**: 在桌面创建浏览器快捷方式,目标设为访问地址

## 🔧 故障排除

### 问题1: 无法访问FastGPT(ERR_CONNECTION_REFUSED)

**原因分析**:
- Docker容器未运行
- 防火墙阻止了连接
- 网络不在同一局域网

**解决方案**:

```powershell
# 1. 检查容器状态
docker ps | Select-String "fastgpt"

# 如果没有输出,启动容器:
cd D:\FastGPT\deploy\docker\cn
docker-compose -f docker-compose.pg.yml up -d

# 2. 测试本机访问
curl http://localhost:3000

# 3. 检查防火墙规则
Get-NetFirewallRule -DisplayName "*FastGPT*" | Select-Object DisplayName, Enabled

# 4. 测试端口监听
Test-NetConnection -ComputerName localhost -Port 3000

# 5. 从其他电脑ping测试
# 在客户端电脑运行:
ping 服务器IP
telnet 服务器IP 3000
```

### 问题2: 文件上传失败

**症状**: 可以访问FastGPT,但上传文件时报错

**原因**: MinIO端口(9000)未开放

**解决方案**:

```powershell
# 1. 检查MinIO容器
docker ps | Select-String "minio"

# 2. 测试MinIO访问
curl http://localhost:9000/minio/health/live

# 3. 检查9000端口防火墙规则
Get-NetFirewallRule -DisplayName "*MinIO*"

# 4. 重新配置防火墙
.\scripts\enable-lan-access.ps1
```

### 问题3: 访问很慢或超时

**可能原因**:
- 网络拥堵
- DNS解析问题
- 路由器设置

**解决方案**:

```powershell
# 1. 在客户端测试网络延迟
ping -n 10 服务器IP

# 2. 检查路由路径
tracert 服务器IP

# 3. 测试端口连接速度
Test-NetConnection -ComputerName 服务器IP -Port 3000 -InformationLevel Detailed
```

### 问题4: 手机/平板无法访问

**检查项目**:
1. ✅ 手机连接的是WiFi(不是移动数据)
2. ✅ WiFi连接的是同一路由器
3. ✅ 没有开启访客网络隔离

**解决方案**:

在手机浏览器中输入: `http://服务器IP:3000`

如果还是无法访问:
1. 检查路由器的「访客网络隔离」设置
2. 检查路由器的「AP隔离」设置
3. 尝试重启路由器

### 问题5: 防火墙规则添加失败

**错误信息**: "拒绝访问" 或 "需要管理员权限"

**解决方案**:

```powershell
# 1. 以管理员身份运行PowerShell
# 右键PowerShell图标 → 以管理员身份运行

# 2. 验证管理员权限
([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
# 应该返回: True

# 3. 如果返回False,重新以管理员身份运行
```

## 📱 移动设备访问

### iOS/Android 浏览器访问

1. 确保设备连接WiFi(与服务器在同一网络)
2. 打开浏览器(Safari/Chrome)
3. 输入: `http://服务器IP:3000`
4. 登录: root / 1234

### 添加到主屏幕(iOS)

1. 在Safari中打开FastGPT
2. 点击底部「分享」按钮
3. 选择「添加到主屏幕」
4. 输入名称: FastGPT
5. 点击「添加」

现在可以像APP一样使用!

### 添加到主屏幕(Android)

1. 在Chrome中打开FastGPT
2. 点击右上角「⋮」菜单
3. 选择「添加到主屏幕」
4. 输入名称: FastGPT
5. 点击「添加」

## 🔒 安全建议

### 修改默认密码

```powershell
# 1. 进入FastGPT容器
docker exec -it fastgpt sh

# 2. FastGPT会在首次启动时使用环境变量中的密码
# 修改密码需要在docker-compose.yml中设置:
```

```yaml
# docker-compose.pg.yml
services:
  fastgpt:
    environment:
      DEFAULT_ROOT_PSW: "新密码"  # 修改这里
```

```powershell
# 3. 重启容器
cd D:\FastGPT\deploy\docker\cn
docker-compose -f docker-compose.pg.yml restart fastgpt
```

### 限制访问IP范围

如果只想允许特定IP访问:

```powershell
# 删除现有规则
Remove-NetFirewallRule -DisplayName "FastGPT-HTTP"

# 创建带IP限制的规则
New-NetFirewallRule -DisplayName "FastGPT-HTTP-Limited" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 3000 `
    -Action Allow `
    -RemoteAddress "192.168.1.100-192.168.1.200" `
    -Profile Private,Domain
```

### 使用HTTPS(高级)

生产环境建议配置HTTPS:

1. 申请SSL证书
2. 使用Nginx反向代理
3. 配置证书

详见: [生产环境部署指南](./PRODUCTION_DEPLOYMENT.md)

## 📊 性能优化

### 局域网内多人使用

如果有多人同时使用,建议:

```yaml
# docker-compose.pg.yml
services:
  fastgpt:
    deploy:
      resources:
        limits:
          cpus: '4'  # 增加CPU限制
          memory: 8G # 增加内存限制
```

### 网络优化

```powershell
# 1. 增加MongoDB连接池
# 在docker-compose.yml中设置:
environment:
  DB_MAX_LINK: 200  # 默认100

# 2. 调整Redis配置
# 在redis命令中增加:
command: |
  redis-server --maxclients 10000 --maxmemory 4gb
```

## 🆘 获取帮助

如果遇到问题,请检查:

1. **日志文件**:
```powershell
# FastGPT日志
docker logs fastgpt --tail 100

# MinIO日志
docker logs fastgpt-minio --tail 100
```

2. **网络诊断**:
```powershell
# 完整网络测试
.\scripts\network-diagnostic.ps1
```

3. **文档参考**:
- [Docker部署方案](./DOCKER_DEPLOYMENT_SOLUTION.md)
- [模型配置速查](./MODEL_CONFIG_QUICK_REF.md)
- [维护指南](./MAINTENANCE.md)

## 📝 快速参考卡

```
┌─────────────────────────────────────────┐
│  FastGPT 局域网访问快速参考             │
├─────────────────────────────────────────┤
│  服务器IP: 192.168.1.100 (示例)         │
│  FastGPT:  http://IP:3000               │
│  MinIO:    http://IP:9001               │
├─────────────────────────────────────────┤
│  登录信息:                              │
│  用户名: root                           │
│  密码:   1234                           │
├─────────────────────────────────────────┤
│  必开端口: 3000, 9000                   │
│  可选端口: 9001                         │
└─────────────────────────────────────────┘
```

---

**最后更新**: 2025-12-17  
**版本**: 1.0  
**作者**: FastGPT部署团队
