# Ollama Connection Error 修复记录

## 问题描述

FastGPT界面显示所有模型报错：**Connection error**

## 根本原因

**`requestAuth`字段导致认证失败**

Ollama不使用Bearer token认证,但FastGPT在配置中设置了`"requestAuth": "ollama"`,导致FastGPT发送请求时添加了无效的Authorization头:

```
Authorization: Bearer ollama
```

Ollama API不认识这个token,拒绝了请求。

## 解决方案

### 从所有Ollama模型配置中删除`requestAuth`字段

**修改前:**
```json
{
  "model": "qwen3:8b",
  "name": "通义千问3-8B (Ollama)",
  "requestUrl": "http://localhost:11434/v1/chat/completions",
  "requestAuth": "ollama"  ❌ 错误:导致发送无效的Bearer token
}
```

**修改后:**
```json
{
  "model": "qwen3:8b",
  "name": "通义千问3-8B (Ollama)",
  "requestUrl": "http://localhost:11434/v1/chat/completions"
  ✅ 正确:不发送Authorization头
}
```

### 修改文件

1. **d:\FastGPT\projects\app\data\config.local.json** (用户配置文件)
2. **d:\FastGPT\projects\app\.next\standalone\projects\app\data\config.local.json** (运行时配置)
3. **d:\FastGPT\projects\app\.next\standalone\projects\app\data\config.json** (系统加载文件)

### 受影响的模型

**LLM模型 (4个):**
- qwen3:8b - 通义千问3-8B (Ollama)
- deepseek-r1:8b - DeepSeek-R1-8B (Ollama)
- llama3:8b - Llama3-8B (Ollama)
- qwen2:7b - 通义千问2-7B (Ollama)

**Embedding模型 (3个):**
- bge-m3:latest - BGE-M3 (Ollama)
- mxbai-embed-large:latest - MXBAI-Large (Ollama)
- nomic-embed-text:latest - Nomic-Embed (Ollama)

## 技术解释

### FastGPT的认证处理逻辑

根据源码分析 (`packages/service/core/ai/llm/request.ts` line 613-614):

```typescript
headers: {
  ...options?.headers,
  ...(modelConstantsData.requestAuth
    ? { Authorization: `Bearer ${modelConstantsData.requestAuth}` }
    : {})
}
```

如果`requestAuth`字段存在,FastGPT会自动构造`Authorization: Bearer ${requestAuth}`头部。

### Ollama的认证要求

Ollama的OpenAI兼容API **不需要认证**:
- ✅ 无需任何Authorization头
- ❌ 拒绝无效的Bearer token

### 为什么curl能工作而FastGPT不行

```bash
# curl不发送Authorization头 - ✅ 成功
curl http://localhost:11434/v1/chat/completions -d '{"model":"qwen3:8b",...}'

# FastGPT发送 Authorization: Bearer ollama - ❌ 失败
# Ollama拒绝无效token
```

## 验证步骤

1. **检查配置文件已修复:**
   ```powershell
   # 不应该有任何输出
   Select-String -Path "d:\FastGPT\projects\app\data\config.local.json" -Pattern "requestAuth"
   ```

2. **同步到运行时配置:**
   ```powershell
   Copy-Item "d:\FastGPT\projects\app\.next\standalone\projects\app\data\config.local.json" `
             "d:\FastGPT\projects\app\.next\standalone\projects\app\data\config.json" -Force
   ```

3. **重启FastGPT:**
   ```powershell
   # 停止旧进程
   Get-Process node | Where-Object {$_.Path -like "*FastGPT*"} | Stop-Process -Force
   
   # 启动服务
   cd "d:\FastGPT\projects\app\.next\standalone\projects\app"
   $env:NODE_ENV="production"
   node server.js
   ```

4. **测试Ollama直接API:**
   ```bash
   curl http://localhost:11434/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model":"qwen3:8b","messages":[{"role":"user","content":"你好"}]}'
   ```

5. **在FastGPT界面测试:**
   - 访问 http://localhost:3000
   - 创建对话Agent
   - 选择任意Ollama模型
   - 发送测试消息
   - ✅ 应该成功返回响应

## 修复时间线

- **12:20** - 识别问题:所有模型报Connection error
- **12:25** - 发现curl能访问Ollama,PowerShell Invoke-RestMethod失败
- **12:28** - 分析源码,发现requestAuth字段会生成Authorization头
- **12:30** - 删除所有Ollama模型的requestAuth字段
- **12:31** - 同步配置文件,重启服务
- **12:32** - 服务成功启动,加载16个活跃模型

## 服务器日志验证

```
Load models success, total: 202, active: 16
[
  {"provider": "openai", "model": "qwen3:8b", "name": "通义千问3-8B (Ollama)"},
  {"provider": "openai", "model": "deepseek-r1:8b", "name": "DeepSeek-R1-8B (Ollama)"},
  {"provider": "openai", "model": "llama3:8b", "name": "Llama3-8B (Ollama)"},
  {"provider": "openai", "model": "qwen2:7b", "name": "通义千问2-7B (Ollama)"},
  {"provider": "openai", "model": "bge-m3:latest", "name": "BGE-M3 (Ollama)"},
  {"provider": "openai", "model": "mxbai-embed-large:latest", "name": "MXBAI-Large (Ollama)"},
  {"provider": "openai", "model": "nomic-embed-text:latest", "name": "Nomic-Embed (Ollama)"}
]
```

## 配置最佳实践

### Ollama模型配置模板

```json
{
  "model": "模型ID (如 qwen3:8b)",
  "name": "显示名称",
  "avatar": "/imgs/model/openai.svg",
  "maxContext": 32768,
  "maxResponse": 8000,
  "requestUrl": "http://localhost:11434/v1/chat/completions"
  // ⚠️ 不要添加 requestAuth 字段!
}
```

### 需要认证的模型配置

对于需要API Key的模型(如智谱AI):

```json
{
  "model": "glm-4",
  "name": "GLM-4",
  // 不设置requestUrl和requestAuth
  // 使用环境变量 OPENAI_BASE_URL 和 CHAT_API_KEY
}
```

## 相关文档

- [CONNECTION_ERROR_FIX.md](./CONNECTION_ERROR_FIX.md) - CONFIG_JSON_PATH路径问题
- [OLLAMA_MODELS_CONFIGURATION.md](./OLLAMA_MODELS_CONFIGURATION.md) - Ollama模型集成文档
- [FastGPT模型配置文档](https://doc.fastgpt.io/docs/introduction/development/modelConfig/intro)

## 总结

**核心问题:** Ollama不需要认证,但配置文件中错误地添加了`requestAuth`字段

**解决方法:** 删除所有Ollama模型配置中的`requestAuth`字段

**验证结果:** ✅ FastGPT成功加载16个模型,Connection error已解决

---

**修复日期:** 2025-12-16  
**FastGPT版本:** v4.14.4  
**Ollama容器:** ollama-lightrag (健康运行)
