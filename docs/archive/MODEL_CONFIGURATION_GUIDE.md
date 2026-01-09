# FastGPT 模型配置完整指南

## 目录

1. [模型配置概述](#模型配置概述)
2. [模型配置方法](#模型配置方法)
3. [云模型配置详解](#云模型配置详解)
4. [本地模型配置详解](#本地模型配置详解)
5. [参数详解](#参数详解)
6. [常见问题解决](#常见问题解决)

---

## 模型配置概述

FastGPT支持两种模型配置方式：

### 1. 数据库配置（推荐）
- **存储位置**: MongoDB `system_models` 集合
- **优先级**: 最高
- **适用场景**: 生产环境、动态管理模型
- **管理方式**: Web界面（账号 > 模型提供商）或API

### 2. 本地配置文件（备用）
- **文件路径**: `projects/app/data/config.local.json`
- **优先级**: 低于数据库配置
- **适用场景**: 开发环境、初始化配置
- **管理方式**: 直接编辑JSON文件

**注意**: 数据库中的配置会覆盖config.local.json中的同名模型配置。

---

## 模型配置方法

### 方法一：使用初始化脚本（推荐）

将`config.local.json`中的模型导入到数据库：

```powershell
# 1. 编辑配置文件
notepad d:\FastGPT\projects\app\data\config.local.json

# 2. 运行初始化脚本
cd d:\FastGPT
node init-models.js

# 3. 重启服务器
Stop-Process -Name node -Force
.\start-server.ps1
```

### 方法二：通过Web界面添加

1. 访问 http://localhost:3000/account/model
2. 登录账号: `root` / `123456`
3. 点击「可用模型」标签
4. 点击「添加模型」按钮
5. 填写模型配置参数
6. 保存即可生效（无需重启）

### 方法三：直接修改数据库

```bash
# 连接MongoDB
docker exec -it mongo mongosh -u myusername -p mypassword --authenticationDatabase admin fastgpt

# 插入新模型
db.system_models.insertOne({
  model: "your-model-name",
  metadata: {
    model: "your-model-name",
    name: "模型显示名称",
    type: "llm",  # 或 "embedding", "rerank", "tts", "stt"
    provider: "openai",
    isActive: true,
    # ... 其他参数见下文
  }
})
```

---

## 云模型配置详解

### 1. 智谱AI（已配置示例）

#### LLM对话模型 - GLM-4

```json
{
  "model": "glm-4",
  "metadata": {
    "model": "glm-4",
    "name": "GLM-4",
    "type": "llm",
    "provider": "openai",
    "avatar": "/imgs/model/openai.svg",
    
    // === 基础容量配置 ===
    "maxContext": 128000,        // 最大上下文窗口（token数）
    "maxResponse": 4000,          // 最大回复长度（token数）
    "quoteMaxToken": 120000,      // 知识库引用最大token
    "maxTemperature": 0.95,       // 最大温度值（0-2，控制随机性）
    
    // === 价格配置 ===
    "charsPointsPrice": 0,        // 积分价格（商业版，0表示免费）
    "inputPrice": 0.005,          // 输入价格（元/1K token）
    "outputPrice": 0.005,         // 输出价格（元/1K token）
    
    // === 功能开关 ===
    "vision": true,               // 支持图片输入（GPT-4V、GLM-4V）
    "datasetProcess": true,       // 用于知识库处理（至少一个为true）
    "usedInClassify": true,       // 用于问题分类（至少一个为true）
    "usedInExtractFields": true,  // 用于内容提取（至少一个为true）
    "usedInToolCall": true,       // 用于工具调用（至少一个为true）
    "usedInQueryExtension": true, // 用于问题优化（至少一个为true）
    "toolChoice": true,           // 支持工具选择（function calling）
    "functionCall": false,        // 支持旧版函数调用
    "censor": false,              // 启用敏感词过滤（商业版）
    
    // === 提示词配置 ===
    "customCQPrompt": "",         // 自定义分类提示词
    "customExtractPrompt": "",    // 自定义提取提示词
    "defaultSystemChatPrompt": "", // 默认系统提示词
    
    // === 默认参数 ===
    "defaultConfig": {
      "top_p": 0.7                // GLM-4推荐的采样参数
    },
    
    // === 状态配置 ===
    "isActive": true,             // 激活状态
    "isDefault": true             // 设为默认LLM模型
  }
}
```

#### Embedding向量模型 - Embedding-2

```json
{
  "model": "embedding-2",
  "metadata": {
    "model": "embedding-2",
    "name": "智谱Embedding-2",
    "type": "embedding",
    "provider": "openai",
    "avatar": "/imgs/model/openai.svg",
    
    // === 向量配置 ===
    "defaultToken": 700,          // 默认切片大小（token）
    "maxToken": 3000,             // 最大token数
    "weight": 100,                // 训练权重（多模型时的优先级）
    
    // === 价格配置 ===
    "charsPointsPrice": 0,
    "inputPrice": 0.0005,         // 输入价格（元/1K token）
    
    // === 高级配置 ===
    "defaultConfig": {},          // 额外参数，如dimensions: 1024
    "dbConfig": {},               // 存储时的参数（非对称向量）
    "queryConfig": {},            // 查询时的参数（非对称向量）
    
    // === 状态配置 ===
    "isActive": true,
    "isDefault": true             // 设为默认Embedding模型
  }
}
```

### 2. OpenAI模型配置

#### GPT-4o

```json
{
  "model": "gpt-4o",
  "metadata": {
    "model": "gpt-4o",
    "name": "GPT-4o",
    "type": "llm",
    "provider": "openai",
    
    "maxContext": 128000,
    "maxResponse": 4000,
    "quoteMaxToken": 120000,
    "maxTemperature": 1.2,
    
    "inputPrice": 0.03,           // $0.03/1K tokens
    "outputPrice": 0.06,          // $0.06/1K tokens
    
    "vision": true,
    "datasetProcess": true,
    "usedInClassify": true,
    "usedInExtractFields": true,
    "usedInToolCall": true,
    "usedInQueryExtension": true,
    "toolChoice": true,
    
    "isActive": true
  }
}
```

#### text-embedding-3-large

```json
{
  "model": "text-embedding-3-large",
  "metadata": {
    "model": "text-embedding-3-large",
    "name": "text-embedding-3-large",
    "type": "embedding",
    "provider": "openai",
    
    "defaultToken": 512,
    "maxToken": 8191,
    "weight": 100,
    
    "inputPrice": 0.00013,        // $0.00013/1K tokens
    
    "defaultConfig": {
      "dimensions": 1024          // 返回1024维向量（默认3072维）
    },
    
    "isActive": true
  }
}
```

### 3. 其他云服务商

#### 百度文心一言

```json
{
  "model": "ERNIE-4.0-8K",
  "metadata": {
    "model": "ERNIE-4.0-8K",
    "name": "文心一言 4.0",
    "type": "llm",
    "provider": "openai",         // 使用OneAPI代理
    
    "maxContext": 8192,
    "maxResponse": 2048,
    "quoteMaxToken": 6000,
    "maxTemperature": 1.0,
    
    "inputPrice": 0.03,
    "outputPrice": 0.09,
    
    "vision": false,
    "datasetProcess": true,
    "usedInClassify": true,
    "usedInExtractFields": true,
    "usedInToolCall": false,
    "toolChoice": false,
    
    "isActive": true
  }
}
```

#### 通义千问

```json
{
  "model": "qwen-plus",
  "metadata": {
    "model": "qwen-plus",
    "name": "通义千问Plus",
    "type": "llm",
    "provider": "openai",
    
    "maxContext": 32768,
    "maxResponse": 6000,
    "quoteMaxToken": 30000,
    "maxTemperature": 1.5,
    
    "inputPrice": 0.004,
    "outputPrice": 0.004,
    
    "vision": false,
    "datasetProcess": true,
    "usedInClassify": true,
    "usedInExtractFields": true,
    "usedInToolCall": true,
    "functionCall": true,
    
    "isActive": true
  }
}
```

---

## 本地模型配置详解

### 1. Ollama本地模型

#### 前置条件

```powershell
# 1. 安装Ollama
# 下载: https://ollama.ai

# 2. 拉取模型
ollama pull llama3.1:8b
ollama pull qwen2.5:7b
ollama pull nomic-embed-text

# 3. 查看模型列表
ollama list
```

#### LLM配置 - Llama 3.1

```json
{
  "model": "llama3.1:8b",
  "metadata": {
    "model": "llama3.1:8b",
    "name": "Llama 3.1 8B",
    "type": "llm",
    "provider": "ollama",         // 使用ollama提供商
    "avatar": "/imgs/model/ollama.svg",
    
    "maxContext": 8192,
    "maxResponse": 2048,
    "quoteMaxToken": 6000,
    "maxTemperature": 1.0,
    
    "charsPointsPrice": 0,        // 本地模型免费
    "inputPrice": 0,
    "outputPrice": 0,
    
    "vision": false,
    "datasetProcess": true,
    "usedInClassify": true,
    "usedInExtractFields": true,
    "usedInToolCall": false,      // 开源模型工具调用支持较弱
    
    // Ollama特定配置
    "requestUrl": "http://localhost:11434/v1/chat/completions",
    "requestAuth": "",            // Ollama默认无认证
    
    "isActive": true
  }
}
```

#### Embedding配置 - nomic-embed-text

```json
{
  "model": "nomic-embed-text",
  "metadata": {
    "model": "nomic-embed-text",
    "name": "Nomic Embed Text",
    "type": "embedding",
    "provider": "ollama",
    
    "defaultToken": 512,
    "maxToken": 2048,
    "weight": 100,
    
    "charsPointsPrice": 0,
    "inputPrice": 0,
    
    "requestUrl": "http://localhost:11434/v1/embeddings",
    
    "isActive": true
  }
}
```

### 2. vLLM本地推理服务

#### 部署vLLM

```bash
# Docker方式部署
docker run --gpus all -p 8000:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:latest \
  --model Qwen/Qwen2.5-7B-Instruct \
  --trust-remote-code
```

#### 配置到FastGPT

```json
{
  "model": "Qwen2.5-7B-Instruct",
  "metadata": {
    "model": "Qwen2.5-7B-Instruct",
    "name": "通义千问2.5 7B",
    "type": "llm",
    "provider": "openai",         // vLLM兼容OpenAI API
    
    "maxContext": 32768,
    "maxResponse": 2048,
    "quoteMaxToken": 30000,
    "maxTemperature": 1.0,
    
    "charsPointsPrice": 0,
    "inputPrice": 0,
    "outputPrice": 0,
    
    "vision": false,
    "datasetProcess": true,
    "usedInClassify": true,
    "usedInExtractFields": true,
    "usedInToolCall": true,
    
    "requestUrl": "http://localhost:8000/v1/chat/completions",
    "requestAuth": "",
    
    "isActive": true
  }
}
```

### 3. OneAPI聚合管理（推荐）

OneAPI可以统一管理多个模型提供商，简化配置。

#### 部署OneAPI

```yaml
# docker-compose.yml
version: '3'
services:
  one-api:
    image: justsong/one-api:latest
    ports:
      - "3001:3000"
    environment:
      - SQL_DSN=root:123456@tcp(mysql:3306)/oneapi
    volumes:
      - ./data:/data
```

#### 配置流程

1. **OneAPI管理后台配置**:
   - 访问 http://localhost:3001
   - 添加渠道（智谱AI、OpenAI、本地Ollama等）
   - 配置密钥和额度
   - 获取OneAPI统一密钥

2. **FastGPT环境变量**:
   ```env
   OPENAI_BASE_URL=http://localhost:3001/v1
   CHAT_API_KEY=sk-your-oneapi-key
   ```

3. **模型配置简化**:
   ```json
   {
     "model": "glm-4",
     "metadata": {
       "model": "glm-4",
       "name": "GLM-4",
       "type": "llm",
       "provider": "openai",
       // OneAPI会自动路由到正确的提供商
       // 无需配置requestUrl
       "isActive": true
     }
   }
   ```

---

## 参数详解

### LLM模型参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `model` | string | ✅ | 模型唯一标识 | `glm-4` |
| `name` | string | ✅ | 显示名称 | `GLM-4` |
| `type` | string | ✅ | 模型类型 | `llm` |
| `provider` | string | ✅ | 提供商 | `openai` |
| `avatar` | string | ❌ | Logo路径 | `/imgs/model/openai.svg` |
| `maxContext` | number | ✅ | 最大上下文 | `128000` |
| `maxResponse` | number | ✅ | 最大回复 | `4000` |
| `quoteMaxToken` | number | ❌ | 引用最大token | `120000` |
| `maxTemperature` | number | ❌ | 最大温度 | `1.2` |
| `charsPointsPrice` | number | ❌ | 积分价格 | `0` |
| `inputPrice` | number | ❌ | 输入价格(元/1K) | `0.005` |
| `outputPrice` | number | ❌ | 输出价格(元/1K) | `0.005` |
| `vision` | boolean | ❌ | 支持图片 | `true` |
| `datasetProcess` | boolean | ✅ | 知识库处理 | `true` |
| `usedInClassify` | boolean | ✅ | 问题分类 | `true` |
| `usedInExtractFields` | boolean | ✅ | 内容提取 | `true` |
| `usedInToolCall` | boolean | ✅ | 工具调用 | `true` |
| `usedInQueryExtension` | boolean | ❌ | 问题优化 | `true` |
| `toolChoice` | boolean | ❌ | 工具选择 | `true` |
| `functionCall` | boolean | ❌ | 函数调用 | `false` |
| `censor` | boolean | ❌ | 敏感词过滤 | `false` |
| `customCQPrompt` | string | ❌ | 自定义分类提示词 | `` |
| `customExtractPrompt` | string | ❌ | 自定义提取提示词 | `` |
| `defaultSystemChatPrompt` | string | ❌ | 默认系统提示词 | `` |
| `defaultConfig` | object | ❌ | 默认参数 | `{"top_p": 0.7}` |
| `requestUrl` | string | ❌ | 自定义API地址 | `http://localhost:8000/v1` |
| `requestAuth` | string | ❌ | 自定义认证头 | `` |
| `isActive` | boolean | ✅ | 激活状态 | `true` |
| `isDefault` | boolean | ❌ | 默认模型 | `false` |

### Embedding模型参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `model` | string | ✅ | 模型唯一标识 | `embedding-2` |
| `name` | string | ✅ | 显示名称 | `智谱Embedding-2` |
| `type` | string | ✅ | 模型类型 | `embedding` |
| `provider` | string | ✅ | 提供商 | `openai` |
| `defaultToken` | number | ✅ | 默认切片大小 | `700` |
| `maxToken` | number | ✅ | 最大token数 | `3000` |
| `weight` | number | ❌ | 训练权重 | `100` |
| `charsPointsPrice` | number | ❌ | 积分价格 | `0` |
| `inputPrice` | number | ❌ | 输入价格 | `0.0005` |
| `defaultConfig` | object | ❌ | 默认参数 | `{"dimensions": 1024}` |
| `dbConfig` | object | ❌ | 存储参数 | `{}` |
| `queryConfig` | object | ❌ | 查询参数 | `{}` |
| `requestUrl` | string | ❌ | 自定义API地址 | `` |
| `isActive` | boolean | ✅ | 激活状态 | `true` |
| `isDefault` | boolean | ❌ | 默认模型 | `false` |

### ReRank模型参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `model` | string | ✅ | 模型唯一标识 | `bge-reranker-v2-m3` |
| `name` | string | ✅ | 显示名称 | `BGE ReRanker v2` |
| `type` | string | ✅ | 模型类型 | `rerank` |
| `provider` | string | ✅ | 提供商 | `openai` |
| `charsPointsPrice` | number | ❌ | 积分价格 | `0` |
| `inputPrice` | number | ❌ | 输入价格 | `0` |
| `requestUrl` | string | ❌ | 自定义API地址 | `http://localhost:6006` |
| `isActive` | boolean | ✅ | 激活状态 | `true` |

### TTS/STT模型参数

```json
// TTS (文本转语音)
{
  "model": "tts-1",
  "type": "tts",
  "voices": [
    {"label": "Alloy", "value": "alloy", "bufferId": "openai-Alloy"},
    {"label": "Echo", "value": "echo", "bufferId": "openai-Echo"}
  ],
  "isActive": true
}

// STT (语音转文本)
{
  "model": "whisper-1",
  "type": "stt",
  "charsPointsPrice": 0,
  "isActive": true
}
```

---

## 常见问题解决

### 1. 模型提供商页面显示为空

**问题原因**: `system_models`数据库集合为空

**解决方案**:
```powershell
# 运行初始化脚本
cd d:\FastGPT
node init-models.js

# 重启服务器
Stop-Process -Name node -Force
.\start-server.ps1
```

### 2. 模型渠道报错

**问题原因**: 
- API密钥配置错误
- 网络连接问题
- 模型名称不匹配

**排查步骤**:
```powershell
# 1. 检查环境变量
cat d:\FastGPT\projects\app\.env.local | Select-String "API"

# 2. 测试API连接
$headers = @{
    "Authorization" = "Bearer fc4e2397c7a9420b8d6a136c901c29b0.td3MNrZjRR9l1LLC"
    "Content-Type" = "application/json"
}
$body = @{
    model = "glm-4"
    messages = @(@{role="user"; content="你好"})
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://open.bigmodel.cn/api/paas/v4/chat/completions" `
    -Method POST -Headers $headers -Body $body
```

### 3. 调用日志获取异常

**问题原因**: 
- MongoDB连接问题
- 日志集合索引缺失

**解决方案**:
```bash
# 连接MongoDB并创建索引
docker exec -it mongo mongosh -u myusername -p mypassword --authenticationDatabase admin fastgpt

# 创建调用日志集合
db.createCollection("model_call_logs")

# 创建索引
db.model_call_logs.createIndex({"teamId": 1, "createTime": -1})
```

### 4. 监控页面报错

**问题原因**: 
- 统计数据不完整
- 时间范围查询问题

**临时解决**: 
- 刷新页面重试
- 切换时间范围
- 等待数据积累后查看

### 5. 本地模型无法调用

**检查清单**:
```powershell
# 1. 确认Ollama服务运行
curl http://localhost:11434/api/tags

# 2. 确认模型已下载
ollama list

# 3. 测试模型推理
ollama run llama3.1:8b "你好"

# 4. 检查FastGPT配置
# requestUrl: http://host.docker.internal:11434/v1  # Docker环境
# requestUrl: http://localhost:11434/v1            # 本地环境
```

### 6. 模型不显示在应用配置中

**原因**: `isActive` 为 `false` 或功能开关未启用

**解决**:
```json
{
  "isActive": true,               // ✅ 必须为true
  "datasetProcess": true,         // ✅ 至少一个功能为true
  "usedInClassify": true,
  "usedInExtractFields": true,
  "usedInToolCall": true
}
```

### 7. 向量模型不匹配

**问题**: 知识库使用1536维embedding，新模型只有1024维

**解决方案**:
```json
// 方案1: 配置dimensions参数
{
  "model": "text-embedding-3-large",
  "defaultConfig": {
    "dimensions": 1536  // 强制返回1536维
  }
}

// 方案2: 重建知识库（推荐）
// Web界面 > 知识库 > 设置 > 重新向量化
```

---

## 附录

### A. 提供商列表

| Provider ID | 名称 | 说明 |
|-------------|------|------|
| `openai` | OpenAI | GPT-4、GPT-3.5系列 |
| `azure` | Azure OpenAI | 微软Azure托管的OpenAI |
| `zhipu` | 智谱AI | GLM系列模型 |
| `baidu` | 百度 | 文心一言 |
| `ali` | 阿里云 | 通义千问 |
| `tencent` | 腾讯 | 混元大模型 |
| `anthropic` | Anthropic | Claude系列 |
| `ollama` | Ollama | 本地模型管理 |
| `other` | 其他 | 自定义提供商 |

### B. 模型类型

| Type | 说明 | 用途 |
|------|------|------|
| `llm` | 大语言模型 | 对话、生成、推理 |
| `embedding` | 向量模型 | 语义搜索、相似度计算 |
| `rerank` | 重排序模型 | 搜索结果优化 |
| `tts` | 文本转语音 | 语音合成 |
| `stt` | 语音转文本 | 语音识别 |

### C. 环境变量配置

```env
# API配置
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
CHAT_API_KEY=your-api-key

# 模型配置路径
CONFIG_JSON_PATH=D:\FastGPT\projects\app\data
PACKAGE_JSON_PATH=D:\FastGPT\projects\app\package.json

# 数据库配置
MONGODB_URI=mongodb://myusername:mypassword@127.0.0.1:27017/fastgpt?authSource=admin&directConnection=true
PG_URL=postgresql://username:password@localhost:5432/fastgpt

# Redis配置
REDIS_URL=redis://:fastgpt@localhost:6379

# S3配置
S3_ENDPOINT=localhost
S3_PORT=9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
```

### D. 相关命令

```powershell
# 启动服务器
cd d:\FastGPT
.\start-server.ps1

# 停止服务器
Stop-Process -Name node -Force

# 查看日志
Get-Process -Name node | Select-Object Id, CPU, WorkingSet

# 测试端口
Test-NetConnection localhost -Port 3000

# 查看MongoDB数据
docker exec -it mongo mongosh -u myusername -p mypassword --authenticationDatabase admin fastgpt
db.system_models.find().pretty()

# 备份配置
docker exec mongo mongodump -u myusername -p mypassword --authenticationDatabase admin --db fastgpt --collection system_models --out /tmp/backup
```

---

## 更新日志

- **2025-12-16**: 初始版本创建
  - 添加智谱AI GLM-4配置示例
  - 添加本地Ollama配置指南
  - 添加OneAPI集成方案
  - 添加常见问题解决方案

---

## 支持与反馈

- 官方文档: https://doc.fastgpt.io
- GitHub Issues: https://github.com/labring/FastGPT/issues
- 技术交流群: 见官方文档

**配置完成后，访问**: http://localhost:3000/account/model 查看模型列表！
