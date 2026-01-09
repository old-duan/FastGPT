# 🔥 Web站点同步快速测试指南 (带认证)

## ⚡ 最快速的测试方法

### 1. 获取登录Token (必需)

```
在浏览器中:
1. 打开 http://192.168.110.18:3001
2. 登录FastGPT
3. 按F12 → Application → Cookies → http://192.168.110.18:3001
4. 找到"token",复制其Value值
```

### 2. 运行测试脚本

```powershell
cd D:\FastGPT
node test-web-sync.js
```

### 3. 粘贴Token

脚本会提示输入token,粘贴后按回车。

### 4. 等待结果

脚本会自动:
- ✅ 创建测试数据集 (URL: https://www.baidu.com)
- ✅ 触发同步任务
- ✅ 每3秒检查进度
- ✅ 显示最终结果

---

## 📊 预期成功输出

```
✅ 同步已完成!

📊 数据统计:
   集合数量: 1
   总数据量: 5
   训练数据量: 5

📝 集合详情:
   1. Root Page
      - ID: 6944xxxxxxxxxxxxx
      - 数据量: 5
      - 训练量: 5
      - 状态: active
```

---

## 🔧 使用现有数据集测试

如果已有数据集ID:

```powershell
node test-web-sync.js 6944abddfccd49606521c80d
```

脚本会:
1. 要求输入token (或直接回车跳过)
2. 直接触发该数据集的同步
3. 监控同步进度

---

## 📸 获取Token的图示

### Chrome/Edge:
```
F12 → 
  Application (应用程序) → 
    Cookies → 
      http://192.168.110.18:3001 → 
        token (复制Value列的值)
```

### Firefox:
```
F12 → 
  存储 → 
    Cookie → 
      http://192.168.110.18:3001 → 
        token (复制值)
```

Token看起来像这样:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTNiY2MxMWNiNTc4ODc1ODViMjJkYmMiLCJ0ZWFtSWQiOiI2OTNiY2MxMWNiNTc4ODc1ODViMjJkYzYiLCJ0bWJJZCI6IjY5M2JjYzExY2I1Nzg4NzU4NWIyMmRjOCIsImlhdCI6MTczNDU3ODgyMCwiZXhwIjoxNzM3MTcwODIwfQ.xxx
```

---

## 🎯 完全手动测试 (不用脚本)

### 步骤1: 创建Web站点知识库

1. 访问: http://192.168.110.18:3001/dataset/list
2. 点击"新建知识库" → "Web 站点"
3. 填写:
   - 名称: 测试百度
   - URL: https://www.baidu.com
   - 选择器: body
   - 最大深度: 0
4. 点击确认

### 步骤2: 触发同步

1. 进入知识库详情页
2. 点击"立即同步"
3. 观察状态: 同步中 → 已就绪

### 步骤3: 检查结果

**刷新页面**,查看:
- ✅ "X 组数据, X 组索引" (应该>0)
- ✅ 集合列表中有数据

### 步骤4: 同时观察服务端日志

在运行 `pnpm dev` 的终端应该看到:

```
[Info] [DatasetSync] Start syncing dataset: xxx
[Info] [DatasetSync] Creating initial collection...
[Info] [DatasetSync] Syncing collection: xxx
[Debug] [Parse Queue] Queue size: 1
[Info] Parse Success
[Debug] [Vector Queue] Queue size: 1
[Info] Vector Success
[Info] [DatasetSync] Dataset xxx sync completed
```

---

## ❌ 如果失败了

### 检查清单:

1. **服务端有同步日志吗?**
   - 如果没有 → Worker可能没启动
   - 检查启动日志是否有: `Init Dataset Sync Worker...`

2. **有错误日志吗?**
   ```
   [Error] [DatasetSync] Failed to sync collection: xxx
   ```
   - 复制完整错误信息

3. **Redis运行正常吗?**
   ```powershell
   docker ps | Select-String redis
   ```

4. **目标网站可访问吗?**
   ```powershell
   curl https://www.baidu.com
   ```

5. **本地模型正常吗?**
   ```powershell
   curl http://localhost:11434/api/tags
   ```

---

## 🔍 调试命令

### 检查数据库

```powershell
# 启动MongoDB Compass或使用命令行
mongodb://localhost:27017

# 查询数据量
db.dataset_datas.find({ datasetId: "你的ID" }).count()

# 查询集合
db.dataset_collections.find({ datasetId: "你的ID" })
```

### 检查Docker服务

```powershell
docker ps
# 应该看到:
# - fastgpt-mongo
# - fastgpt-redis
# - fastgpt-pg (如果使用PostgreSQL)
```

### 检查Ollama

```powershell
# 查看已安装的模型
curl http://localhost:11434/api/tags

# 测试向量模型
curl http://localhost:11434/api/embeddings -X POST -d '{
  "model": "bge-m3:latest",
  "prompt": "测试"
}'
```

---

## 💡 提示

1. **Token有效期**: Token会过期,如果测试时报403,重新获取token
2. **首次同步**: 第一次同步可能需要1-2分钟
3. **观察日志**: 同步时务必观察服务端日志
4. **简单网站**: 先用百度等简单网站测试,不要用复杂的SPA应用

---

## 📝 报告问题时提供

如果测试失败,请提供:

1. **测试脚本完整输出**
2. **服务端日志** (从点击"立即同步"到完成的所有日志)
3. **浏览器控制台错误** (如果有)
4. **截图** (显示"0 组数据, 0 组索引"的页面)

---

**现在就开始测试!**

```powershell
cd D:\FastGPT
node test-web-sync.js
```

按提示输入token,坐等结果! 🚀
