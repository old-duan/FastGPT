# FastGPT 快速启动指南

## 🚀 启动服务器

### 方法1: 使用启动脚本(推荐)
```powershell
cd d:\FastGPT
.\start-server.ps1
```

### 方法2: 手动启动
```powershell
# 1. 启动Docker容器
cd d:\FastGPT\deploy\dev
docker-compose up -d

# 2. 启动FastGPT
cd d:\FastGPT\projects\app\.next\standalone\projects\app
node server.js
```

## 📝 登录信息

- **访问地址**: http://localhost:3000
- **用户名**: `root`
- **密码**: `123456`

## 🤖 AI模型配置

- **Chat模型**: 智谱 GLM-4 (128K context)
- **Embedding模型**: Embedding-2 (1024 dimensions)
- **API地址**: https://open.bigmodel.cn/api/paas/v4

## 🔧 常用命令

### 查看服务器状态
```powershell
# 查看Node进程
Get-Process -Name node

# 查看端口占用
Get-NetTCPConnection -LocalPort 3000
```

### 停止服务器
```powershell
Get-Process -Name node | Stop-Process
```

### 重启服务器
```powershell
# 停止
Get-Process -Name node | Stop-Process

# 等待2秒
Start-Sleep -Seconds 2

# 启动
cd d:\FastGPT\projects\app\.next\standalone\projects\app
node server.js
```

### 查看Docker容器状态
```powershell
docker ps
```

### 重启Docker容器
```powershell
cd d:\FastGPT\deploy\dev
docker-compose restart
```

## 🐛 故障排除

### 页面一直加载中

**原因**: 静态资源未复制到standalone目录

**解决**:
```powershell
# 复制静态资源
Copy-Item "d:\FastGPT\projects\app\.next\static" "d:\FastGPT\projects\app\.next\standalone\projects\app\.next\" -Recurse -Force
Copy-Item "d:\FastGPT\projects\app\public" "d:\FastGPT\projects\app\.next\standalone\projects\app\" -Recurse -Force

# 重启服务器
Get-Process -Name node | Stop-Process
cd d:\FastGPT\projects\app\.next\standalone\projects\app
node server.js
```

### 端口3000被占用

**查看占用进程**:
```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
Get-Process -Id <进程ID>
```

**释放端口**:
```powershell
Stop-Process -Id <进程ID> -Force
```

### MongoDB连接失败

**检查容器**:
```powershell
docker ps | Select-String "mongo"
```

**重启MongoDB**:
```powershell
docker restart mongo
```

### 数据库密码错误

**查看配置**:
```powershell
Get-Content "d:\FastGPT\projects\app\.env.local" | Select-String "MONGODB_URI"
```

**正确配置**:
```
MONGODB_URI=mongodb://myusername:mypassword@127.0.0.1:27017/fastgpt?authSource=admin&directConnection=true
```

## 📁 重要文件路径

### 配置文件
- 环境变量: `d:\FastGPT\projects\app\.env.local`
- 模型配置: `d:\FastGPT\projects\app\data\config.local.json`
- Docker配置: `d:\FastGPT\deploy\dev\docker-compose.yml`

### 服务器文件
- 主程序: `d:\FastGPT\projects\app\.next\standalone\projects\app\server.js`
- 静态资源: `d:\FastGPT\projects\app\.next\standalone\projects\app\.next\static`
- 公共资源: `d:\FastGPT\projects\app\.next\standalone\projects\app\public`

## 📊 系统架构

```
FastGPT
├── Web服务 (localhost:3000)
├── MongoDB (localhost:27017)
├── PostgreSQL + pgvector (localhost:5432)
├── Redis (localhost:6379)
└── MinIO (localhost:9000-9001)
```

## 🔄 更新代码后重新构建

```powershell
# 1. 清理旧构建
cd d:\FastGPT\projects\app
Remove-Item ".next" -Recurse -Force

# 2. 重新构建
cd d:\FastGPT
pnpm --filter app build

# 3. 复制静态资源
Copy-Item "d:\FastGPT\projects\app\.next\static" "d:\FastGPT\projects\app\.next\standalone\projects\app\.next\" -Recurse -Force
Copy-Item "d:\FastGPT\projects\app\public" "d:\FastGPT\projects\app\.next\standalone\projects\app\" -Recurse -Force

# 4. 启动服务器
cd d:\FastGPT\projects\app\.next\standalone\projects\app
node server.js
```

## 📞 技术支持

- 官方文档: https://doc.fastgpt.io
- GitHub: https://github.com/labring/FastGPT
- 问题反馈: https://github.com/labring/FastGPT/issues

## 🎯 下一步

1. 创建知识库
2. 上传文档数据
3. 配置工作流
4. 测试AI对话
5. 探索高级功能

---

**提示**: 使用 `start-server.ps1` 脚本可以自动完成所有启动步骤!
