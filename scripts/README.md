# FastGPT 脚本工具

本目录包含 FastGPT 的实用脚本工具。

## 🚀 当前脚本

### 网络配置脚本 🆕

#### `enable-lan-access.ps1` ⭐推荐
**用途**: 一键配置FastGPT局域网访问

**功能**:
- ✅ 自动配置Windows防火墙规则
- ✅ 检查Docker容器和端口状态
- ✅ 显示本机IP和访问地址
- ✅ 生成局域网访问HTML页面
- ✅ 提供登录信息和使用指南

**使用方法**:
```powershell
# 以管理员身份运行PowerShell
cd D:\FastGPT\scripts
.\enable-lan-access.ps1
```

**要求**: 管理员权限

**生成文件**: `FastGPT-局域网访问.html` (可分享给其他用户)

---

#### `network-diagnostic.ps1` 🆕
**用途**: 诊断局域网访问问题

**功能**:
- 🔍 检查Docker容器状态
- 🔍 验证端口监听和映射
- 🔍 检查防火墙规则
- 🔍 测试本地和网络连接
- 🔍 检查MinIO和MongoDB状态
- 🔧 提供自动修复选项

**使用方法**:
```powershell
cd D:\FastGPT\scripts
.\network-diagnostic.ps1
```

**参数**: 无需参数,自动检测

**适用场景**: 局域网无法访问时的故障排除

---

### 更新维护脚本 🆕

#### `update-fastgpt.ps1` 🆕
**用途**: 自动化更新FastGPT到指定版本

**功能**:
- 🔄 自动备份配置和数据库
- 🐳 拉取新镜像并更新
- 📝 自动更新配置文件
- 🔍 执行数据迁移脚本
- ✅ 验证更新结果

**使用方法**:
```powershell
# 标准更新 (含备份)
cd D:\FastGPT\scripts
.\update-fastgpt.ps1 -Version "v4.14.4"

# 快速更新 (跳过备份)
.\update-fastgpt.ps1 -Version "v4.14.4" -SkipBackup

# 自动确认更新
.\update-fastgpt.ps1 -Version "v4.14.4" -AutoConfirm
```

**参数**:
- `-Version`: 目标版本 (必需)
- `-SkipBackup`: 跳过备份 (可选)
- `-AutoConfirm`: 自动确认,不询问 (可选)

**注意**: 建议在更新前查看 [更新分析报告](../docs/UPDATE_ANALYSIS_20251217.md)

---

### 启动脚本

#### `quick-start.ps1` (根目录)
**用途**: 自动化启动FastGPT (Docker优先)

**功能**:
- 自动检测并停止已运行的容器
- 优先使用Docker Compose生产环境
- 包含健康检查和配置同步
- 错误处理和日志输出

**使用方法**:
```powershell
cd d:\FastGPT
.\quick-start.ps1
```

**参数**: 无需参数,自动判断环境

---

### 数据库脚本

#### `init-models.js` (根目录)
**用途**: 从config.json初始化模型到MongoDB

**功能**:
- 读取 `projects/app/data/config.local.json`
- 将LLM和Vector模型导入到 `fastgpt.system_models` 集合
- 支持JSON5格式(带注释)
- 自动清空旧数据

**使用方法**:
```bash
# 本地环境
node init-models.js

# 配置MongoDB连接
# 编辑脚本中的 MONGODB_URI
```

**要求**:
- Node.js 14+
- mongodb 驱动
- json5 包
- 配置文件存在: `projects/app/data/config.local.json`

#### `import-models.js` (根目录)
**用途**: 简化版模型导入(用于Docker容器内)

**功能**:
- 直接从 `/app/data/config.json` 读取
- 导入到 `model_datas` 集合
- 连接容器内MongoDB服务

**使用方法**:
```bash
# 复制到Docker容器
docker cp import-models.js fastgpt:/tmp/

# 在容器内执行
docker exec fastgpt node /tmp/import-models.js
```

**注意**: 需要在FastGPT容器内有mongodb模块

---

## 📦 归档脚本

以下脚本已移至 `scripts/` 目录,保留供参考:

### `start-server.ps1`
早期的服务器启动脚本,功能已整合到 `quick-start.ps1`

### `start-fastgpt.ps1`
简化版启动脚本,功能已整合到 `quick-start.ps1`

### `mongo-import.js`
MongoDB导入的中间版本,已被 `init-models.js` 替代

---

## 🔧 脚本开发规范

### 命名约定
- PowerShell脚本: `动词-名词.ps1` (如 `Start-FastGPT.ps1`)
- JavaScript脚本: `动词-名词.js` (如 `init-models.js`)
- 使用连字符分隔单词

### 脚本结构
```powershell
# PowerShell模板
# 1. 脚本说明
# 2. 参数定义
# 3. 函数定义
# 4. 主逻辑
# 5. 错误处理
```

```javascript
// JavaScript模板
// 1. 依赖导入
// 2. 配置常量
// 3. 函数定义
// 4. 主函数
// 5. 错误处理
```

### 文档要求
每个脚本必须包含:
- 用途说明
- 参数说明
- 使用示例
- 依赖要求
- 注意事项

### 版本管理
- 新功能 → 更新现有脚本
- 重大变更 → 归档旧版本到 `scripts/archive/`
- 临时测试 → 使用 `test-*.{ps1,js}` 命名
- 废弃脚本 → 移至 `scripts/deprecated/`

---

## 📋 快速参考

### 常用命令

```powershell
# 启动FastGPT (Docker)
cd d:\FastGPT
.\quick-start.ps1

# 初始化模型 (本地开发)
node init-models.js

# 查看Docker日志
docker logs fastgpt -f

# 重启FastGPT容器
docker restart fastgpt

# 进入MongoDB
docker exec -it mongo mongo -u myusername -p mypassword --authenticationDatabase admin
```

### Docker容器操作

```powershell
# 启动所有容器
cd deploy/docker/cn
docker-compose -f docker-compose.pg.yml up -d

# 停止所有容器
docker-compose -f docker-compose.pg.yml down

# 查看容器状态
docker ps

# 进入容器
docker exec -it fastgpt sh
```

### MongoDB操作

```javascript
// 连接数据库
use fastgpt

// 查看模型
db.system_models.find({}, {model: 1, "metadata.name": 1, "metadata.isActive": 1})

// 激活所有模型
db.system_models.updateMany({}, {$set: {"metadata.isActive": true}})

// 删除所有模型
db.system_models.deleteMany({})
```

---

## 🆘 故障排除

### 脚本执行错误

**问题**: PowerShell脚本无法执行
```powershell
# 解决: 设置执行策略
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**问题**: Node.js模块未找到
```bash
# 解决: 安装依赖
npm install mongodb json5
```

### Docker相关

**问题**: 容器启动失败
```powershell
# 检查日志
docker logs fastgpt

# 检查端口占用
netstat -ano | findstr "3000"
```

**问题**: 模型未加载
```powershell
# 检查MongoDB连接
docker exec mongo mongo -u myusername -p mypassword --authenticationDatabase admin --eval "db.serverStatus()"

# 重启容器
docker restart fastgpt
```

---

## 📞 获取帮助

- 查看主文档: [DOCKER_DEPLOYMENT_SOLUTION.md](../DOCKER_DEPLOYMENT_SOLUTION.md)
- 查看归档: [docs/archive/](../docs/archive/)
- GitHub Issues: [FastGPT Issues](https://github.com/labring/FastGPT/issues)

---

最后更新: 2025-12-16
