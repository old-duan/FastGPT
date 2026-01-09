# FastGPT Connection Error 修复报告

## 问题描述
工作台创建对话Agent时，所有可用模型都报错：**Connection error**

## 根本原因

### 1. 配置文件路径错误
`.env.local`中的路径配置错误：
```env
# ❌ 错误配置
CONFIG_JSON_PATH=D:\FastGPT\projects\app\data

# ✅ 正确配置
CONFIG_JSON_PATH=D:\FastGPT\projects\app\.next\standalone\projects\app\data
```

### 2. 配置文件缺失
服务器需要两个配置文件：
- `config.local.json` - 模型配置（用户创建）
- `config.json` - 系统读取的文件名

但standalone目录中只有`config.local.json`的副本，缺少`config.json`。

## 修复步骤

### 步骤1: 修复环境变量路径

**文件**: `d:\FastGPT\projects\app\.env.local`

```env
# 修改配置文件路径为standalone目录
CONFIG_JSON_PATH=D:\FastGPT\projects\app\.next\standalone\projects\app\data
PACKAGE_JSON_PATH=D:\FastGPT\projects\app\.next\standalone\projects\app\package.json
```

### 步骤2: 创建/复制配置文件

```powershell
# 创建data目录
New-Item -ItemType Directory -Path "d:\FastGPT\projects\app\.next\standalone\projects\app\data" -Force

# 复制配置文件（两个文件名）
Copy-Item "d:\FastGPT\projects\app\data\config.local.json" `
  "d:\FastGPT\projects\app\.next\standalone\projects\app\data\config.local.json" -Force

Copy-Item "d:\FastGPT\projects\app\data\config.local.json" `
  "d:\FastGPT\projects\app\.next\standalone\projects\app\data\config.json" -Force
```

### 步骤3: 复制环境变量文件

```powershell
Copy-Item "d:\FastGPT\projects\app\.env.local" `
  "d:\FastGPT\projects\app\.next\standalone\projects\app\" -Force
```

### 步骤4: 重启服务器

```powershell
# 停止现有进程
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 启动服务器
cd d:\FastGPT\projects\app\.next\standalone\projects\app
$env:NODE_ENV="production"
node server.js
```

## 验证结果

### 启动日志显示
```
] Load models success, total: 202, active: 16
Init system success
```

### 16个活动模型
**云端模型 (智谱AI)**:
- GLM-4 (对话)
- 智谱Embedding-2 (向量)

**本地模型 (Ollama)**:
- 通义千问3-8B (qwen3:8b)
- DeepSeek-R1-8B (deepseek-r1:8b)
- Llama3-8B (llama3:8b)
- 通义千问2-7B (qwen2:7b)
- BGE-M3 (bge-m3:latest)
- MXBAI-Large (mxbai-embed-large:latest)
- Nomic-Embed (nomic-embed-text:latest)

**其他模型**:
- gpt-5, gpt-4o (占位模型)
- text-embedding-3-large, text-embedding-3-small, text-embedding-ada-002
- OpenAI TTS1, Whisper1

## 测试结果

### API测试
```powershell
# 测试智谱AI（通过环境变量）
Invoke-RestMethod -Uri "https://open.bigmodel.cn/api/paas/v4/chat/completions" `
  -Method Post -Headers @{
    "Authorization" = "Bearer fc4e2397c7a9420b8d6a136c901c29b0.td3MNrZjRR9l1LLC"
    "Content-Type" = "application/json"
  } -Body '{"model":"glm-4","messages":[{"role":"user","content":"测试"}]}'
# ✅ 成功返回响应

# 测试Ollama（通过requestUrl）
Invoke-RestMethod -Uri "http://localhost:11434/v1/chat/completions" `
  -Method Post -ContentType "application/json" `
  -Body '{"model":"qwen3:8b","messages":[{"role":"user","content":"test"}]}'
# ✅ 成功返回响应

# 测试FastGPT系统API
Invoke-RestMethod -Uri "http://localhost:3000/api/common/system/getInitData"
# ✅ 成功返回配置信息
```

### 错误日志分析
修复前的错误：
```javascript
Error: Connection error.
    at pl.makeRequest (D:\FastGPT\projects\app\.next\standalone\projects\app\.next\server\chunks\42384.js:1:226274)
```

修复后：
- 无Connection error错误
- 模型正常加载
- API调用成功

## 配置文件结构

### 正确的目录结构
```
d:\FastGPT\projects\app\
├── .env.local                    # 源环境变量
├── data/
│   └── config.local.json         # 源模型配置
└── .next\standalone\projects\app\
    ├── .env.local                # ✅ 复制的环境变量
    ├── server.js                 # 服务器入口
    ├── package.json              # ✅ 包信息
    └── data/
        ├── config.local.json     # ✅ 模型配置
        └── config.json           # ✅ 系统读取的配置（同内容）
```

### 为什么需要两个配置文件？
FastGPT代码中硬编码读取`config.json`：
```javascript
// 系统会尝试读取这个文件
const configPath = path.join(CONFIG_JSON_PATH, 'config.json');
```

但用户习惯创建`config.local.json`，所以需要复制一份为`config.json`。

## 常见问题

### Q1: 为什么修改.env.local后还是报错？
**A**: 需要同时修复两处：
1. 源文件: `d:\FastGPT\projects\app\.env.local`
2. 运行目录: `d:\FastGPT\projects\app\.next\standalone\projects\app\.env.local`

### Q2: 添加新模型后不显示？
**A**: 需要三步：
1. 修改`config.local.json`添加模型配置
2. 运行`node init-models.js`导入到数据库
3. 复制配置文件并重启服务器

```powershell
# 完整流程
node d:\FastGPT\init-models.js
Copy-Item "d:\FastGPT\projects\app\data\config.local.json" `
  "d:\FastGPT\projects\app\.next\standalone\projects\app\data\config.json" -Force
Stop-Process -Name node -Force
cd d:\FastGPT; .\start-server.ps1
```

### Q3: Ollama模型无法连接？
**A**: 检查三点：
1. Ollama服务运行: `docker exec -it ollama ollama list`
2. 模型已拉取: 应该能看到qwen3:8b等模型
3. requestUrl配置正确: `http://localhost:11434/v1/chat/completions`

### Q4: Connection error还在出现？
**A**: 检查清单：
```powershell
# 1. 确认配置文件存在
Test-Path "d:\FastGPT\projects\app\.next\standalone\projects\app\data\config.json"
# 应该返回 True

# 2. 确认环境变量正确
Get-Content "d:\FastGPT\projects\app\.next\standalone\projects\app\.env.local" | Select-String "CONFIG_JSON_PATH"
# 应该显示: CONFIG_JSON_PATH=D:\FastGPT\projects\app\.next\standalone\projects\app\data

# 3. 确认模型已加载
# 查看服务器日志应该看到: Load models success, total: 202, active: 16

# 4. 确认API可访问
Invoke-RestMethod "http://localhost:3000/api/common/system/getInitData"
# 应该返回配置信息
```

## 预防措施

### 自动化配置脚本
创建`d:\FastGPT\sync-config.ps1`：

```powershell
#!/usr/bin/env pwsh
# FastGPT 配置同步脚本

Write-Host "开始同步配置..." -ForegroundColor Cyan

# 1. 确保目标目录存在
$targetDataDir = "d:\FastGPT\projects\app\.next\standalone\projects\app\data"
New-Item -ItemType Directory -Path $targetDataDir -Force | Out-Null

# 2. 复制环境变量
Copy-Item "d:\FastGPT\projects\app\.env.local" `
  "d:\FastGPT\projects\app\.next\standalone\projects\app\" -Force
Write-Host "✅ .env.local 已复制"

# 3. 复制配置文件（两个文件名）
Copy-Item "d:\FastGPT\projects\app\data\config.local.json" `
  "$targetDataDir\config.local.json" -Force
Copy-Item "d:\FastGPT\projects\app\data\config.local.json" `
  "$targetDataDir\config.json" -Force
Write-Host "✅ config.json 已复制"

# 4. 重新导入模型
Write-Host "导入模型到数据库..." -ForegroundColor Yellow
node "d:\FastGPT\init-models.js"

Write-Host "`n✅ 配置同步完成！请重启服务器。" -ForegroundColor Green
Write-Host "重启命令: Stop-Process -Name node -Force; cd d:\FastGPT; .\start-server.ps1"
```

使用方法：
```powershell
# 每次修改配置后运行
cd d:\FastGPT
.\sync-config.ps1

# 然后重启服务器
Stop-Process -Name node -Force
.\start-server.ps1
```

## 总结

### 问题根源
1. ❌ 环境变量路径指向源目录而非运行目录
2. ❌ 配置文件只有`config.local.json`，缺少`config.json`
3. ❌ standalone目录缺少必要的配置文件

### 解决方案
1. ✅ 修复`.env.local`中的路径配置
2. ✅ 创建`config.json`（复制自`config.local.json`）
3. ✅ 确保所有配置文件在standalone目录

### 验证成功
- ✅ 16个模型成功加载
- ✅ 智谱AI API连接正常
- ✅ Ollama API连接正常
- ✅ FastGPT系统API响应正常
- ✅ 可以正常创建对话Agent

---

**修复完成时间**: 2025-12-16 11:50  
**FastGPT版本**: v4.14.4  
**活动模型数**: 16  
**状态**: ✅ 已解决
