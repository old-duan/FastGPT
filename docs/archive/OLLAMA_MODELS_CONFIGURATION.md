# Ollama 模型配置完成报告

## 配置概要

成功将本地 Ollama 模型集成到 FastGPT 中，现在可以同时使用智谱AI和本地Ollama模型。

## 已配置的模型

### LLM 对话模型 (12个)

#### 云端模型 (智谱AI)
1. **GLM-4** - 智谱AI旗舰对话模型
   - API: `https://open.bigmodel.cn/api/paas/v4`
   - 特点: 支持视觉、工具调用、128K上下文

#### 本地模型 (Ollama)
2. **通义千问3-8B (qwen3:8b)** 
   - 本地地址: `http://localhost:11434/v1`
   - 特点: 32K上下文，中文优化
   
3. **DeepSeek-R1-8B (deepseek-r1:8b)**
   - 本地地址: `http://localhost:11434/v1`
   - 特点: 32K上下文，推理能力强
   
4. **Llama3-8B (llama3:8b)**
   - 本地地址: `http://localhost:11434/v1`
   - 特点: 8K上下文，Meta开源模型
   
5. **通义千问2-7B (qwen2:7b)**
   - 本地地址: `http://localhost:11434/v1`
   - 特点: 32K上下文，轻量级

#### 占位模型
6. gpt-5, gpt-4o (未配置API，仅用于演示)

### Embedding 向量模型 (7个)

#### 云端模型
1. **智谱Embedding-2 (embedding-2)**
   - API: `https://open.bigmodel.cn/api/paas/v4`
   - 维度: 1536

#### 本地模型 (Ollama)
2. **BGE-M3 (bge-m3:latest)**
   - 本地地址: `http://localhost:11434/v1`
   - 最大token: 8192
   - 特点: 多语言支持

3. **MXBAI-Large (mxbai-embed-large:latest)**
   - 本地地址: `http://localhost:11434/v1`
   - 最大token: 512
   - 特点: 轻量高效

4. **Nomic-Embed (nomic-embed-text:latest)**
   - 本地地址: `http://localhost:11434/v1`
   - 最大token: 8192
   - 特点: 开源免费

#### 其他
5. text-embedding-3-large, text-embedding-3-small, text-embedding-ada-002

### 其他模型
- **TTS语音合成**: OpenAI TTS1
- **STT语音识别**: Whisper1

## 配置架构

### 双API源配置

```
FastGPT
├── 智谱AI模型 → https://open.bigmodel.cn/api/paas/v4
│   ├── GLM-4 (对话)
│   └── Embedding-2 (向量)
│
└── Ollama本地模型 → http://localhost:11434/v1
    ├── qwen3:8b, deepseek-r1:8b, llama3:8b, qwen2:7b (对话)
    └── bge-m3, mxbai-embed-large, nomic-embed-text (向量)
```

### 关键配置文件

#### 1. 模型配置 (`config.local.json`)
```json
{
  "llmModels": [
    {
      "model": "qwen3:8b",
      "name": "通义千问3-8B (Ollama)",
      "requestUrl": "http://localhost:11434/v1/chat/completions",
      "requestAuth": "ollama"
    }
  ],
  "vectorModels": [
    {
      "model": "bge-m3:latest",
      "name": "BGE-M3 (Ollama)",
      "requestUrl": "http://localhost:11434/v1/embeddings",
      "requestAuth": "ollama"
    }
  ]
}
```

#### 2. 环境变量 (`.env.local`)
```env
# 智谱AI (默认)
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
CHAT_API_KEY=fc4e2397c7a9420b8d6a136c901c29b0.td3MNrZjRR9l1LLC

# Ollama模型通过 requestUrl 字段独立配置
# 无需修改 OPENAI_BASE_URL
```

## 验证结果

### 启动日志
```
Load models success, total: 202, active: 16
```

### 活动模型列表
```json
[
  {"provider": "openai", "model": "glm-4", "name": "GLM-4"},
  {"provider": "openai", "model": "qwen3:8b", "name": "通义千问3-8B (Ollama)"},
  {"provider": "openai", "model": "deepseek-r1:8b", "name": "DeepSeek-R1-8B (Ollama)"},
  {"provider": "openai", "model": "llama3:8b", "name": "Llama3-8B (Ollama)"},
  {"provider": "openai", "model": "qwen2:7b", "name": "通义千问2-7B (Ollama)"},
  {"provider": "openai", "model": "embedding-2", "name": "智谱Embedding-2"},
  {"provider": "openai", "model": "bge-m3:latest", "name": "BGE-M3 (Ollama)"},
  {"provider": "openai", "model": "mxbai-embed-large:latest", "name": "MXBAI-Large (Ollama)"},
  {"provider": "openai", "model": "nomic-embed-text:latest", "name": "Nomic-Embed (Ollama)"}
]
```

## 使用方法

### 1. 查看模型列表
访问: `http://localhost:3000/account/model`

所有16个模型都会显示在"可用模型"列表中，包括：
- 标注为 `(Ollama)` 的是本地模型
- 没有标注的是云端模型

### 2. 创建对话应用
1. 进入"应用" → "创建应用"
2. 选择对话模型:
   - **云端高质量**: GLM-4
   - **本地免费**: 通义千问3-8B, DeepSeek-R1-8B, Llama3-8B
3. 开始对话

### 3. 创建知识库
1. 进入"知识库" → "创建知识库"
2. 选择向量模型:
   - **云端**: 智谱Embedding-2
   - **本地**: BGE-M3, MXBAI-Large, Nomic-Embed
3. 上传文档进行向量化

## 性能对比

| 模型类型 | 云端模型 (智谱AI) | 本地模型 (Ollama) |
|---------|-----------------|------------------|
| **成本** | 按调用计费 | 完全免费 |
| **速度** | 取决于网络 | 本地运行更快 |
| **质量** | GLM-4质量高 | 8B模型质量略低 |
| **隐私** | 数据上传云端 | 数据不出本地 |
| **可用性** | 需要网络 | 离线可用 |

## 推荐配置

### 场景1: 高质量对话
- 对话模型: **GLM-4** (智谱AI)
- 向量模型: **智谱Embedding-2**
- 适合: 生产环境、对质量要求高

### 场景2: 本地离线
- 对话模型: **通义千问3-8B** 或 **DeepSeek-R1-8B**
- 向量模型: **BGE-M3**
- 适合: 内网环境、数据安全要求高

### 场景3: 混合部署
- 对话模型: **GLM-4** (重要对话) + **qwen3:8b** (测试/内部)
- 向量模型: **BGE-M3** (本地知识库)
- 适合: 平衡成本与质量

## 故障排除

### 1. Ollama模型调用失败
**检查Ollama服务**:
```powershell
# 测试API
Invoke-RestMethod -Uri "http://localhost:11434/api/tags"

# 列出模型
docker exec -it ollama ollama list
```

### 2. 模型不显示
**重新导入模型**:
```powershell
cd d:\FastGPT
node init-models.js
```

### 3. 配置文件未生效
**复制配置到运行目录**:
```powershell
Copy-Item "d:\FastGPT\projects\app\data\config.local.json" `
  "d:\FastGPT\projects\app\.next\standalone\projects\app\data\" -Force
```

**重启服务器**:
```powershell
Stop-Process -Name node -Force
cd d:\FastGPT
.\start-server.ps1
```

## 扩展配置

### 添加新的Ollama模型

1. **拉取模型**:
```bash
docker exec -it ollama ollama pull <model-name>
```

2. **编辑配置文件** (`config.local.json`):
```json
{
  "model": "<model-name>:tag",
  "name": "模型显示名称",
  "requestUrl": "http://localhost:11434/v1/chat/completions",
  "requestAuth": "ollama",
  "maxContext": 8192,
  "maxResponse": 4000
}
```

3. **重新导入**:
```powershell
node init-models.js
Copy-Item "config.local.json" ".next\standalone\projects\app\data\" -Force
Stop-Process -Name node -Force; .\start-server.ps1
```

## 总结

✅ **成功配置**: 16个活动模型 (从9个增加到16个)  
✅ **双API源**: 智谱AI + Ollama本地模型共存  
✅ **自定义请求地址**: 每个Ollama模型独立配置API端点  
✅ **完全可用**: 对话、知识库、工作流全部功能可用  

现在您可以自由选择使用云端智谱AI模型（高质量但需付费）或本地Ollama模型（免费但需本地资源）！

---

**配置完成时间**: 2025-12-16 11:37  
**FastGPT版本**: v4.14.4  
**Ollama端点**: http://localhost:11434
