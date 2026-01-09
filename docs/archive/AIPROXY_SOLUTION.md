# FastGPT 模型提供商功能问题解决方案

## 问题总结

您遇到的4个问题都与 **AIProxy服务未配置** 有关：

1. ❌ 账号>模型提供商>可用模型（列表显示但无法确认是否对应本地）
2. ❌ 账号>模型提供商>模型渠道（报错：错误）
3. ❌ 账号>模型提供商>调用日志（报错：获取数据异常/错误）
4. ❌ 账号>模型提供商>监控（报错：错误）

## 问题原因

### 1. AIProxy是什么？

AIProxy是FastGPT的**模型渠道管理服务**（类似OneAPI），负责：
- 管理多个AI模型提供商的API密钥
- 统一API调用接口
- 记录调用日志
- 统计使用情况和监控

### 2. 当前状态

```env
# d:\FastGPT\projects\app\.env.local
AIPROXY_API_ENDPOINT=https://localhost:3010  # ❌ 服务未运行
AIPROXY_API_TOKEN=aiproxy
```

### 3. 依赖关系

```
模型提供商页面
├── 可用模型 ✅ 直接从system_models读取（已解决）
├── 模型渠道 ❌ 需要AIProxy服务
├── 调用日志 ❌ 需要AIProxy服务
└── 监控     ❌ 需要AIProxy服务
```

---

## 解决方案

您有**两个选择**：

### 方案A: 不使用AIProxy（推荐 - 简化部署）

**适用场景**: 
- 只使用智谱AI一个提供商
- 不需要高级渠道管理
- 不需要详细的调用日志

**操作步骤**:

#### 1. 禁用AIProxy功能

修改`.env.local`，注释掉AIProxy配置：

```env
# 注释掉以下两行
# AIPROXY_API_ENDPOINT=https://localhost:3010
# AIPROXY_API_TOKEN=aiproxy
```

或者改为空值：

```env
AIPROXY_API_ENDPOINT=
AIPROXY_API_TOKEN=
```

#### 2. 直接使用OpenAI API配置

```env
# 智谱AI配置（已有）
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
CHAT_API_KEY=fc4e2397c7a9420b8d6a136c901c29b0.td3MNrZjRR9l1LLC
```

#### 3. 重启服务器

```powershell
Stop-Process -Name node -Force
cd d:\FastGPT
.\start-server.ps1
```

#### 4. 结果

✅ **可用模型**: 正常显示9个模型  
⚠️ **模型渠道**: 功能隐藏（不显示此标签）  
⚠️ **调用日志**: 功能隐藏  
⚠️ **监控**: 功能隐藏  

**优点**:
- 部署简单，无需额外服务
- 直接调用智谱AI API
- 模型功能完全可用

**缺点**:
- 无法管理多个API密钥
- 无法查看详细调用日志
- 无法进行流量监控

---

### 方案B: 部署AIProxy服务（完整功能）

**适用场景**:
- 需要管理多个API提供商
- 需要详细的调用日志
- 需要流量监控和统计

**操作步骤**:

#### 1. 部署AIProxy服务

**使用Docker Compose部署**:

创建`d:\FastGPT\deploy\aiproxy\docker-compose.yml`:

```yaml
version: '3'
services:
  aiproxy:
    image: registry.cn-hangzhou.aliyuncs.com/fastgpt/aiproxy:latest
    container_name: fastgpt-aiproxy
    ports:
      - "3010:3000"
    environment:
      # 数据库配置（使用FastGPT的PostgreSQL）
      - SQL_DSN=postgresql://username:password@host.docker.internal:5432/aiproxy?sslmode=disable
      
      # Redis配置（使用FastGPT的Redis）
      - REDIS_CONN_STRING=redis://:fastgpt@host.docker.internal:6379
      
      # 管理员配置
      - SESSION_SECRET=random_string
      - INITIAL_ROOT_TOKEN=aiproxy  # 这个token要与.env.local中的AIPROXY_API_TOKEN一致
      
      # 日志级别
      - LOG_LEVEL=info
    restart: always
    networks:
      - fastgpt
    extra_hosts:
      - "host.docker.internal:host-gateway"

networks:
  fastgpt:
    external: true
```

**启动服务**:

```powershell
cd d:\FastGPT\deploy\aiproxy
docker-compose up -d
```

#### 2. 初始化AIProxy数据库

```powershell
# 连接PostgreSQL创建数据库
docker exec -it pg psql -U username -c "CREATE DATABASE aiproxy;"
```

#### 3. 访问AIProxy管理后台

```
URL: http://localhost:3010
用户名: root
密码: (在首次访问时设置)
```

#### 4. 在AIProxy中配置智谱AI渠道

1. 登录AIProxy管理后台
2. 点击「渠道」菜单
3. 点击「创建新渠道」
4. 填写配置:
   ```
   渠道名称: 智谱AI
   渠道类型: OpenAI Compatible
   Base URL: https://open.bigmodel.cn/api/paas/v4
   API Key: fc4e2397c7a9420b8d6a136c901c29b0.td3MNrZjRR9l1LLC
   模型: glm-4, embedding-2
   优先级: 1
   ```
5. 保存并启用

#### 5. 验证配置

访问 http://localhost:3000/account/model，所有标签应该正常显示。

#### 6. 结果

✅ **可用模型**: 正常显示  
✅ **模型渠道**: 可管理多个API提供商  
✅ **调用日志**: 详细记录每次API调用  
✅ **监控**: 实时统计和分析  

**优点**:
- 完整的渠道管理功能
- 详细的调用日志和统计
- 支持多个API提供商
- 负载均衡和故障转移

**缺点**:
- 需要部署额外服务
- 配置相对复杂
- 占用更多资源

---

## 问题详解

### 1. 可用模型

**问题**: 列表中的模型是否和本地模型对应？

**答案**: ✅ **是的，完全对应**

查看启动日志可以看到：

```
Load models success, total: 195, active: 9

[
  {"provider": "openai", "model": "glm-4", "name": "GLM-4"},
  {"provider": "openai", "model": "embedding-2", "name": "智谱Embedding-2"},
  ...
]
```

这9个模型**已经加载到内存中，可以直接使用**。

**验证方法**:

```powershell
# 查看数据库中的模型
docker exec -it mongo mongosh -u myusername -p mypassword --authenticationDatabase admin fastgpt --eval "
  db.system_models.find({}, {model: 1, 'metadata.name': 1}).pretty()
"
```

**使用方法**:

1. 创建应用 → 选择GLM-4模型 → 开始对话 ✅
2. 创建知识库 → 选择Embedding-2 → 上传文档 ✅
3. 无需任何额外配置，直接可用 ✅

### 2. 模型渠道报错

**错误原因**: 

代码文件 `projects/app/src/pages/api/aiproxy/[...path].ts`:

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await authSystemAdmin({ req });  // ✅ 已通过（您是root用户）

    if (!baseUrl || !token) {
      throw new Error('AIPROXY_API_ENDPOINT or AIPROXY_API_TOKEN is not set');
    }

    // 尝试连接 https://localhost:3010
    const requestResult = requestFn({
      hostname: 'localhost',
      port: '3010',
      // ...
    });
    // ❌ 连接失败：服务未运行
```

**解决方案**: 选择方案A（禁用）或方案B（部署AIProxy）

### 3. 调用日志报错

**错误原因**: 同上，依赖AIProxy服务记录日志

**如果不使用AIProxy**: 
- FastGPT仍然会记录基本的使用日志
- 存储在MongoDB的`usages`集合中
- 可以通过其他方式查看

**查看FastGPT内置日志**:

```bash
docker exec -it mongo mongosh -u myusername -p mypassword --authenticationDatabase admin fastgpt

# 查看最近的调用记录
db.usages.find().sort({time: -1}).limit(10).pretty()
```

### 4. 监控报错

**错误原因**: 监控功能依赖AIProxy的统计数据

**替代方案**: 使用FastGPT内置的统计

```bash
# 查看今天的总调用量
db.usages.aggregate([
  {$match: {time: {$gte: new Date(new Date().setHours(0,0,0,0))}}},
  {$group: {_id: "$model", count: {$sum: 1}, totalTokens: {$sum: "$totalTokens"}}}
])
```

---

## 推荐配置（方案A - 简化版）

### 步骤1: 修改环境变量

编辑 `d:\FastGPT\projects\app\.env.local`:

```powershell
notepad d:\FastGPT\projects\app\.env.local
```

将AIProxy配置注释掉：

```env
# ai proxy api (暂不使用)
# AIPROXY_API_ENDPOINT=https://localhost:3010
# AIPROXY_API_TOKEN=aiproxy
```

同时将配置复制到standalone目录：

```powershell
Copy-Item "d:\FastGPT\projects\app\.env.local" "d:\FastGPT\projects\app\.next\standalone\projects\app\" -Force
```

### 步骤2: 重启服务器

```powershell
Stop-Process -Name node -Force
cd d:\FastGPT
.\start-server.ps1
```

### 步骤3: 验证功能

1. 访问 http://localhost:3000/account/model
2. 应该只看到「可用模型」和「配置」标签
3. 「模型渠道」、「调用日志」、「监控」标签不显示（这是正常的）

### 步骤4: 测试模型

1. 创建应用 → 选择GLM-4
2. 发送消息测试
3. 应该正常回复 ✅

---

## 常见问题

### Q1: 不使用AIProxy，模型还能正常工作吗？

**A**: ✅ **完全可以！**

FastGPT会直接调用配置的API：
```
FastGPT → 智谱AI API (https://open.bigmodel.cn/api/paas/v4)
```

而不是通过AIProxy中转：
```
FastGPT → AIProxy → 智谱AI API
```

### Q2: 没有AIProxy怎么查看调用日志？

**A**: 使用MongoDB查询

```bash
docker exec -it mongo mongosh -u myusername -p mypassword --authenticationDatabase admin fastgpt

# 查看最近10条调用记录
db.usages.find().sort({time: -1}).limit(10).pretty()

# 查看GLM-4的调用统计
db.usages.aggregate([
  {$match: {model: "glm-4"}},
  {$group: {
    _id: null,
    totalCalls: {$sum: 1},
    totalTokens: {$sum: "$totalTokens"},
    totalCost: {$sum: "$totalAmount"}
  }}
])
```

### Q3: 以后想用AIProxy怎么办？

**A**: 按照方案B部署AIProxy即可，随时可以切换。

### Q4: AIProxy是必需的吗？

**A**: ❌ **不是必需的！**

FastGPT的核心功能（对话、知识库、工作流）**完全不依赖AIProxy**。

AIProxy只是提供了额外的管理功能：
- 多渠道管理
- 详细日志
- 流量统计
- 负载均衡

如果您只使用智谱AI一个提供商，**完全可以不用AIProxy**。

---

## 总结

### 当前状态

✅ **模型已正确配置**: 9个模型已导入数据库  
✅ **模型可以正常使用**: 创建应用、知识库都可以调用  
❌ **AIProxy未配置**: 导致渠道管理、日志、监控功能报错  

### 推荐方案

**对于您的场景（只使用智谱AI）**:

👉 **选择方案A - 禁用AIProxy**

**原因**:
1. 部署更简单
2. 维护成本更低
3. 功能完全够用
4. 性能更好（少一层代理）

### 操作清单

- [ ] 编辑.env.local，注释AIProxy配置
- [ ] 复制.env.local到standalone目录
- [ ] 重启服务器
- [ ] 测试模型功能
- [ ] 验证应用对话

### 验证命令

```powershell
# 1. 修改配置
notepad d:\FastGPT\projects\app\.env.local
# 注释掉 AIPROXY_API_ENDPOINT 和 AIPROXY_API_TOKEN

# 2. 复制配置
Copy-Item "d:\FastGPT\projects\app\.env.local" "d:\FastGPT\projects\app\.next\standalone\projects\app\" -Force

# 3. 重启
Stop-Process -Name node -Force
.\start-server.ps1

# 4. 打开浏览器测试
Start-Process "http://localhost:3000/account/model"
```

---

**报告完成时间**: 2025-12-16  
**问题状态**: 已识别根本原因  
**推荐方案**: 方案A - 禁用AIProxy（简化部署）
