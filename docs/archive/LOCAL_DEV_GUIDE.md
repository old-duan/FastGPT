# FastGPT 本地开发环境快速启动指南

## 🎯 当前状态

✅ **已完成**: FastGPT 本地开发环境已成功部署并验证

- ✅ 开发依赖工具准备完成
- ✅ 项目代码克隆完成 (Fork: https://github.com/old-duan/FastGPT)
- ✅ 项目依赖安装完成
- ✅ 环境变量配置完成
- ✅ 依赖服务启动完成 (MongoDB, PostgreSQL, Redis, MinIO)
- ✅ AI模型配置完成 (智谱AI GLM-4 + Embedding-2)
- ✅ 应用启动并验证通过

---

## 🚀 快速启动

### 方式一: 一键启动脚本

创建启动脚本 `start-fastgpt.ps1`:
```powershell
# 检查并启动Docker服务
Write-Host "检查Docker容器状态..." -ForegroundColor Cyan
$containers = docker ps --format "{{.Names}}" 2>$null

if ($containers -notcontains "mongo") {
    Write-Host "启动数据库服务..." -ForegroundColor Yellow
    cd d:\FastGPT\deploy\dev
    docker-compose up -d
    Start-Sleep -Seconds 10
}

# 启动FastGPT应用
Write-Host "启动FastGPT应用..." -ForegroundColor Cyan
cd d:\FastGPT
pnpm --filter app dev
```

运行:
```powershell
.\start-fastgpt.ps1
```

### 方式二: 手动启动

```powershell
# 1. 确保Docker服务运行
docker ps

# 2. 如果容器未运行,启动它们
cd d:\FastGPT\deploy\dev
docker-compose up -d

# 3. 启动FastGPT应用
cd d:\FastGPT
pnpm --filter app dev

# 4. 等待服务启动完成后访问
# http://localhost:3000
```

---

## 🔑 登录信息

- **访问地址**: http://localhost:3000
- **用户名**: `root`
- **密码**: `123456`

---

## 🤖 AI模型配置

### GLM-4 (对话模型)
- **API地址**: https://open.bigmodel.cn/api/paas/v4
- **API Key**: fc4e2397c7a9420b8d6a136c901c29b0.td3MNrZjRR9l1LLC
- **模型编码**: glm-4

### Embedding-2 (向量模型)
- **模型编码**: embedding-2
- **向量维度**: 1024

---

## 🧪 验证测试

### 测试API连接
```powershell
node d:\FastGPT\test\test-zhipu-api.js
```

预期输出:
```
✅ Chat API 测试成功
✅ Embedding API 测试成功
✅ 所有测试通过!
```

### 验证部署状态
```powershell
node d:\FastGPT\test\verify-deployment.js
```

---

## 📁 重要文件

### 配置文件
```
d:\FastGPT\projects\app\.env.local              # 环境变量
d:\FastGPT\projects\app\data\config.local.json  # 模型配置
```

### 文档
```
d:\FastGPT\DEPLOYMENT_REPORT.md  # 详细部署报告
```

### 测试文件
```
d:\FastGPT\test\test-zhipu-api.js        # API测试
d:\FastGPT\test\verify-deployment.js     # 部署验证
```

---

## 🔧 常用命令

### 开发服务器
```powershell
# 启动
cd d:\FastGPT
pnpm --filter app dev

# 停止: Ctrl+C
```

### Docker服务
```powershell
# 查看状态
docker ps

# 启动服务
cd d:\FastGPT\deploy\dev
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker restart mongo pg redis minio

# 查看日志
docker logs mongo
docker logs pg
docker logs redis
```

---

## 📝 快速上手

### 1. 创建知识库

1. 登录系统 http://localhost:3000
2. 点击"知识库" → "新建知识库"
3. 选择向量模型: **智谱Embedding-2**
4. 导入文档:
   - 支持格式: txt, md, pdf, docx, csv, xlsx
   - 或手动输入内容

### 2. 创建应用

1. 点击"应用" → "创建应用"
2. 选择模板或从空白开始
3. 配置AI模型: **GLM-4**
4. (可选) 关联知识库
5. 配置工作流:
   - 添加"AI对话"节点
   - 添加"知识库搜索"节点
   - 配置节点连接

### 3. 测试应用

1. 点击"对话测试"
2. 输入问题
3. 查看回复

### 4. 获取API

1. 个人设置 → API密钥
2. 创建新的API Key
3. 使用API调用应用

---

## 🔍 故障排查

### 问题: 服务启动失败

**解决方案**:
```powershell
# 1. 检查Docker容器
docker ps

# 2. 查看日志
docker logs mongo
docker logs pg

# 3. 重启容器
docker restart mongo pg redis
```

### 问题: 数据库连接失败

**解决方案**:
```powershell
# 检查MongoDB连接
docker exec -it mongo mongosh -u myusername -p mypassword

# 检查PostgreSQL连接
docker exec -it pg psql -U username -d postgres
```

### 问题: AI模型调用失败

**解决方案**:
```powershell
# 运行API测试
node d:\FastGPT\test\test-zhipu-api.js

# 检查配置文件
# 1. API Key是否正确
# 2. 模型编码是否匹配
```

---

## 📚 学习资源

- **官方文档**: https://doc.fastgpt.io
- **API文档**: https://doc.fastgpt.io/docs/development/openapi
- **GitHub**: https://github.com/labring/FastGPT
- **智谱AI**: https://open.bigmodel.cn

---

## 💡 进阶开发

### 自定义模型

编辑 `d:\FastGPT\projects\app\data\config.local.json`:
```json
{
  "llmModels": [
    {
      "model": "your-model",
      "name": "Your Model Name",
      ...
    }
  ]
}
```

### 添加插件

1. 查看插件目录: `d:\FastGPT\plugins\`
2. 参考现有插件结构
3. 编写自定义插件

### API开发

```javascript
// 示例: 调用对话API
fetch('http://localhost:3000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    chatId: 'xxx',
    messages: [
      { role: 'user', content: '你好' }
    ]
  })
})
```

---

## 📈 性能优化

### 数据库优化
```
# 在 .env.local 中调整
DB_MAX_LINK=10  # 增加连接池大小
EMBEDDING_CHUNK_SIZE=20  # 调整向量化并发
```

### 向量搜索优化
```json
// 在 config.local.json 中调整
{
  "systemEnv": {
    "vectorMaxProcess": 20,  // 增加向量处理并发
    "pgHNSWEfSearch": 200    // 提高搜索精度
  }
}
```

---

## ✅ 检查清单

- [x] Docker服务运行正常
- [x] MongoDB连接成功
- [x] PostgreSQL连接成功
- [x] Redis连接成功
- [x] FastGPT应用启动成功
- [x] 智谱AI API测试通过
- [x] Web界面可访问
- [x] 能够登录系统

---

## 🎊 完成!

你的 FastGPT 本地开发环境已经完全配置好了!

**接下来**:
1. 访问 http://localhost:3000 开始使用
2. 创建你的第一个知识库
3. 创建你的第一个AI应用
4. 探索更多功能!

**需要帮助?**
- 查看 `DEPLOYMENT_REPORT.md` 获取详细信息
- 运行测试脚本验证功能
- 参考官方文档学习更多

祝开发愉快! 🚀
