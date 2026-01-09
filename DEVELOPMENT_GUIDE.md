# FastGPT 完整开发指南

> **文档版本**: v1.0  
> **最后更新**: 2025年12月18日  
> **适用版本**: FastGPT v4.14.4+

---

## 📋 目录

1. [项目概述](#项目概述)
2. [技术架构](#技术架构)
3. [环境准备](#环境准备)
4. [快速开始](#快速开始)
5. [开发流程](#开发流程)
6. [核心模块详解](#核心模块详解)
7. [调试技巧](#调试技巧)
8. [常见问题](#常见问题)
9. [最佳实践](#最佳实践)
10. [贡献指南](#贡献指南)

---

## 🎯 项目概述

### 什么是 FastGPT?

FastGPT 是一个基于 LLM 的知识库问答系统,提供开箱即用的数据处理、模型调用等能力。本项目是 FastGPT 的开源增强版,增加了 Web 站点同步等高级功能。

### 核心功能

- ✅ **知识库管理**: 支持多种数据源(文档、Web、API)
- ✅ **智能问答**: 基于 RAG 的上下文检索和回答
- ✅ **工作流编排**: 可视化流程设计
- ✅ **多模型支持**: 兼容 OpenAI、Ollama 等主流模型
- ✅ **Web 站点同步**: 自动爬取和同步网站内容(新增)
- ✅ **权限管理**: 团队协作和资源共享

### 项目特色

1. **开源增强**: 在官方开源版基础上增加商业版功能
2. **本地部署**: 完全私有化部署,数据安全可控
3. **高度可定制**: 模块化设计,易于扩展
4. **中文优化**: 针对中文场景深度优化

---

## 🏗️ 技术架构

### 技术栈

```yaml
前端:
  框架: Next.js 14.2.32 (React 18)
  语言: TypeScript 5.0+
  状态管理: Zustand
  UI组件: Chakra UI
  样式: CSS Modules + Emotion

后端:
  运行时: Node.js 24.9.0+
  框架: Next.js API Routes
  语言: TypeScript
  数据库:
    - MongoDB 7.0+ (主数据库)
    - PostgreSQL 16+ (向量数据库 + pgvector)
    - Redis 7.0+ (缓存 + 队列)

Worker系统:
  队列: BullMQ 5.28+
  调度: Redis
  并发: 可配置

向量化:
  模型: Ollama (bge-m3, nomic-embed-text)
  存储: PostgreSQL + pgvector
  检索: 余弦相似度

AI模型:
  对话: Ollama (qwen2.5:7b, llama3.1:8b)
  Embedding: bge-m3, nomic-embed-text
  API兼容: OpenAI API 标准

开发工具:
  包管理: pnpm 9.0+
  代码检查: ESLint + Prettier
  测试: Vitest
  容器化: Docker + Docker Compose
```

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                 │
│  Web Browser ←→ Next.js Frontend (React + TypeScript)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      应用服务层                               │
│  Next.js API Routes (Backend)                               │
│  ├─ 认证授权 (Auth)                                          │
│  ├─ 知识库管理 (Dataset)                                     │
│  ├─ 对话管理 (Chat)                                          │
│  ├─ 工作流引擎 (Workflow)                                    │
│  └─ 数据同步 (Sync) ←─ NEW!                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Worker 处理层                            │
│  BullMQ Workers (异步任务)                                   │
│  ├─ Dataset Sync Worker (Web站点同步)                        │
│  ├─ Vector Generation Worker (向量生成)                      │
│  └─ File Processing Worker (文件处理)                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                               │
│  ├─ MongoDB (业务数据)                                       │
│  ├─ PostgreSQL + pgvector (向量数据)                        │
│  ├─ Redis (缓存 + 消息队列)                                  │
│  └─ MinIO / 本地存储 (文件存储)                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      AI 模型层                                │
│  Ollama (本地模型服务)                                        │
│  ├─ 对话模型 (qwen2.5:7b, llama3.1:8b)                      │
│  └─ Embedding 模型 (bge-m3, nomic-embed-text)               │
└─────────────────────────────────────────────────────────────┘
```

### 数据流示例: Web 站点同步

```
用户操作: 创建 Web 站点知识库 + 开始同步
    ↓
1. 前端发起请求
   POST /api/core/dataset/sync/urlSync
   { datasetId, rootUrl, syncMode, ... }
    ↓
2. API 验证权限和参数
   - 检查用户权限
   - 验证 URL 有效性
   - 创建同步任务
    ↓
3. 添加任务到 Redis 队列
   Queue: datasetSyncQueue
   Job: { datasetId, rootUrl, ... }
    ↓
4. Worker 处理任务
   Dataset Sync Worker:
   - 爬取网站页面 (递归)
   - 解析 HTML 内容
   - 转换为 Markdown
   - 分块处理文本
    ↓
5. 存储到数据库
   MongoDB:
   - 创建 Collection 记录
   - 保存 Data 数据块
   PostgreSQL:
   - 生成向量 (Embedding)
   - 存储到 pg.model_data
    ↓
6. 更新任务状态
   - 更新进度回调
   - 通知前端完成
    ↓
用户: 在知识库中看到同步的内容
```

---

## ⚙️ 环境准备

### 系统要求

- **操作系统**: Windows 10/11, macOS 12+, Ubuntu 20.04+
- **内存**: 至少 8GB (推荐 16GB+)
- **存储**: 至少 20GB 可用空间
- **网络**: 稳定的互联网连接 (用于下载依赖和模型)

### 必需软件

#### 1. Node.js (v18.0+)

```powershell
# 检查版本
node --version  # 应显示 v18.0.0 或更高

# 下载地址
https://nodejs.org/
```

#### 2. pnpm (v9.0+)

```powershell
# 安装 pnpm
npm install -g pnpm

# 检查版本
pnpm --version  # 应显示 9.0.0 或更高
```

#### 3. Docker Desktop

```powershell
# 检查 Docker
docker --version
docker-compose --version

# 下载地址
https://www.docker.com/products/docker-desktop
```

#### 4. Git

```powershell
# 检查 Git
git --version

# 下载地址
https://git-scm.com/
```

### 可选软件

- **VSCode**: 推荐的代码编辑器
- **Postman**: API 测试工具
- **MongoDB Compass**: MongoDB 可视化工具
- **RedisInsight**: Redis 可视化工具

---

## 🚀 快速开始

### 1. 克隆项目

```powershell
git clone https://github.com/labring/FastGPT.git
cd FastGPT
```

### 2. 安装依赖

```powershell
# 使用淘宝镜像加速
pnpm install --registry=https://registry.npmmirror.com

# 等待约 5-10 分钟
```

### 3. 启动数据库服务

```powershell
cd deploy/dev
docker-compose up -d

# 检查服务状态
docker-compose ps
```

预期输出:
```
NAME        IMAGE              STATUS
mongo       mongo:7.0          Up
redis       redis:7.2          Up
pg          ankane/pgvector    Up
```

### 4. 配置环境变量

复制 `.env.template` 为 `.env` (如果存在),或使用默认配置。

关键配置项:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/fastgpt

# PostgreSQL
PG_URL=postgresql://username:password@localhost:5432/postgres

# Redis
REDIS_URL=redis://localhost:6379

# Ollama (AI 模型)
OLLAMA_BASE_URL=http://localhost:11434
```

### 5. 启动开发服务

```powershell
# 方式 1: 使用稳定启动脚本 (推荐)
.\start-fastgpt-stable.ps1

# 方式 2: 传统方式
cd projects/app
pnpm dev
```

### 6. 访问应用

打开浏览器访问:
- **本地**: http://localhost:3000
- **局域网**: http://192.168.110.18:3000 (如已配置)

默认账号:
- 用户名: `root`
- 密码: `1234`

---

## 💻 开发流程

### 日常开发步骤

1. **启动服务**
   ```powershell
   # 启动数据库
   cd deploy/dev
   docker-compose up -d
   
   # 启动 FastGPT
   cd ../..
   .\start-fastgpt-stable.ps1
   ```

2. **修改代码**
   - 前端代码: `projects/app/src/`
   - 后端 API: `projects/app/src/pages/api/`
   - 共享服务: `packages/service/`
   - 全局组件: `packages/global/`

3. **实时预览**
   - Next.js 支持热更新 (Hot Reload)
   - 保存文件后自动刷新浏览器
   - API 更改需要重启服务

4. **测试验证**
   ```powershell
   # 运行单元测试
   pnpm test
   
   # 运行特定测试
   pnpm test --filter=app
   ```

5. **提交代码**
   ```powershell
   git add .
   git commit -m "feat: 添加新功能"
   git push
   ```

### 分支管理策略

```
main (稳定分支)
  ↓
develop (开发分支)
  ↓
feature/xxx (功能分支)
  ↓
bugfix/xxx (修复分支)
```

### 代码规范

- **TypeScript**: 严格模式,禁止 `any`
- **命名规范**:
  - 文件: `kebab-case.ts`
  - 组件: `PascalCase.tsx`
  - 函数: `camelCase`
  - 常量: `UPPER_SNAKE_CASE`
- **注释**: 关键逻辑必须添加注释
- **格式化**: 使用 Prettier 自动格式化

---

## 🧩 核心模块详解

### 1. 认证授权模块

**位置**: `packages/service/support/permission/`

**核心功能**:
- 用户登录/注册
- JWT Token 生成和验证
- 权限检查 (RBAC)
- 团队管理

**关键文件**:
- `auth/controller.ts`: 认证控制器
- `auth/bill.ts`: Token 管理
- `type.ts`: 权限类型定义

**使用示例**:
```typescript
import { authCert } from '@fastgpt/service/support/permission/auth/common';

export default async function handler(req, res) {
  // 验证用户身份
  const { userId, tmbId } = await authCert({
    req,
    authToken: true
  });
  
  // 业务逻辑
  // ...
}
```

---

### 2. 知识库管理模块

**位置**: `packages/service/core/dataset/`

**核心功能**:
- 知识库 CRUD
- 数据集合管理
- 数据块处理
- 向量化存储

**数据模型**:
```typescript
// 知识库
Dataset {
  _id: ObjectId
  name: string
  vectorModel: string
  tmbId: ObjectId
  type: 'dataset' | 'websiteDataset' | 'apiDataset'
}

// 集合
DatasetCollection {
  _id: ObjectId
  datasetId: ObjectId
  name: string
  type: 'virtual' | 'file' | 'link'
  rawLink?: string  // Web 站点 URL
}

// 数据块
DatasetData {
  _id: ObjectId
  collectionId: ObjectId
  q: string  // 问题/标题
  a: string  // 答案/内容
  chunkIndex: number
  indexes: Array  // 向量索引
}
```

**关键 API**:
```typescript
// 创建知识库
POST /api/core/dataset/create

// 同步 Web 站点
POST /api/core/dataset/sync/urlSync

// 搜索知识库
POST /api/core/dataset/searchTest
```

---

### 3. Web 站点同步模块 (新增)

**位置**: 
- Worker: `packages/service/core/dataset/sync/worker.ts`
- API: `projects/app/src/pages/api/core/dataset/sync/urlSync.ts`

**工作流程**:

```typescript
// 1. 用户创建同步任务
const job = await datasetSyncQueue.add('sync-task', {
  datasetId: 'xxx',
  rootUrl: 'http://example.com',
  syncMode: 'increment',
  maxDepth: 3
});

// 2. Worker 处理任务
class DatasetSyncWorker {
  async processJob(job: Job) {
    const { rootUrl, maxDepth } = job.data;
    
    // 递归爬取
    const pages = await this.crawlWebsite(rootUrl, maxDepth);
    
    // 处理每个页面
    for (const page of pages) {
      // 解析 HTML
      const content = await this.parseHTML(page.html);
      
      // 转换为 Markdown
      const markdown = await this.htmlToMarkdown(content);
      
      // 分块存储
      await this.saveToDataset(markdown);
      
      // 向量化
      await this.generateEmbedding(markdown);
    }
  }
}

// 3. 进度回调
worker.on('progress', (job, progress) => {
  console.log(`任务 ${job.id}: ${progress}%`);
});
```

**配置选项**:
```typescript
interface SyncOptions {
  rootUrl: string;          // 根地址
  syncMode: 'increment' | 'fullSync';  // 同步模式
  maxDepth: number;         // 最大深度
  selectors?: string[];     // CSS 选择器
  excludePatterns?: string[];  // 排除规则
}
```

**注意事项**:
- 遵守 robots.txt 规则
- 控制爬取频率,避免过载
- 处理重定向和错误页面
- 清理无效内容 (导航、页脚等)

---

### 4. 向量检索模块

**位置**: `packages/service/core/dataset/search/`

**核心算法**:
```typescript
// 1. 将用户问题向量化
const queryVector = await embeddingModel.embed(userQuery);

// 2. 在 PostgreSQL 中检索相似向量
const results = await pg.query(`
  SELECT 
    data_id,
    q,
    a,
    1 - (vector <=> $1::vector) as score
  FROM pg.model_data
  WHERE dataset_id = $2
  ORDER BY vector <=> $1::vector
  LIMIT $3
`, [queryVector, datasetId, topK]);

// 3. 过滤低分结果
const filtered = results.filter(r => r.score > 0.5);

// 4. 构建上下文
const context = filtered.map(r => r.a).join('\n\n');
```

**性能优化**:
- 使用 IVFFlat 索引加速检索
- 批量向量化请求
- 缓存常见查询
- 异步生成向量

---

### 5. 对话管理模块

**位置**: `packages/service/core/chat/`

**对话流程**:
```typescript
// 1. 接收用户消息
POST /api/v1/chat/completions
{
  chatId: 'xxx',
  messages: [
    { role: 'user', content: '什么是FastGPT?' }
  ]
}

// 2. 检索知识库
const knowledgeContext = await searchDataset(query);

// 3. 构建 Prompt
const prompt = `
背景知识:
${knowledgeContext}

用户问题:
${userQuery}

请基于背景知识回答用户问题。
`;

// 4. 调用 LLM
const response = await llm.chat({
  model: 'qwen2.5:7b',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ]
});

// 5. 返回结果 (流式)
return stream(response);
```

---

### 6. 工作流引擎

**位置**: `packages/service/core/workflow/`

**节点类型**:
- **输入节点**: 接收用户输入
- **知识库节点**: 检索知识库
- **LLM 节点**: 调用语言模型
- **条件节点**: 分支逻辑
- **输出节点**: 返回结果

**执行引擎**:
```typescript
class WorkflowRunner {
  async run(workflow: Workflow, input: any) {
    let currentNode = workflow.startNode;
    let context = { input };
    
    while (currentNode) {
      // 执行节点
      const output = await this.executeNode(currentNode, context);
      
      // 更新上下文
      context = { ...context, ...output };
      
      // 获取下一个节点
      currentNode = this.getNextNode(currentNode, output);
    }
    
    return context.output;
  }
}
```

---

## 🐛 调试技巧

### 1. 日志调试

**查看应用日志**:
```powershell
# 实时查看 FastGPT 日志
# 日志会在启动窗口中显示

# 查看 Next.js 编译日志
cat projects/app/.next/trace
```

**查看 Worker 日志**:
```typescript
// 在 Worker 中添加日志
console.log('[DatasetSync] 开始处理:', job.id);
```

**查看数据库日志**:
```powershell
# MongoDB 日志
docker logs mongo -f

# Redis 日志
docker logs redis -f

# PostgreSQL 日志
docker logs pg -f
```

---

### 2. 断点调试

**VSCode 配置** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**启动调试**:
```powershell
# 以调试模式启动
NODE_OPTIONS='--inspect' pnpm dev
```

---

### 3. 网络调试

**使用浏览器开发者工具**:
- Network 标签: 查看 API 请求
- Console 标签: 查看前端错误
- React DevTools: 检查组件状态

**使用 Postman 测试 API**:
```http
POST http://localhost:3000/api/core/dataset/sync/urlSync
Content-Type: application/json
Authorization: Bearer <token>

{
  "datasetId": "xxx",
  "rootUrl": "http://example.com"
}
```

---

### 4. 数据库调试

**MongoDB 查询**:
```javascript
// 使用 MongoDB Compass 或命令行

// 查看知识库
db.datasets.find({})

// 查看集合
db.dataset_collections.find({ datasetId: ObjectId('xxx') })

// 查看数据块
db.dataset_datas.find({ collectionId: ObjectId('xxx') })
```

**PostgreSQL 查询**:
```sql
-- 查看向量数据
SELECT data_id, q, a FROM pg.model_data WHERE dataset_id = 'xxx';

-- 查看向量相似度
SELECT 
  data_id,
  1 - (vector <=> '[0.1, 0.2, ...]'::vector) as score
FROM pg.model_data
ORDER BY score DESC
LIMIT 10;
```

**Redis 查询**:
```bash
# 使用 redis-cli
docker exec -it redis redis-cli

# 查看队列
KEYS datasetSyncQueue:*

# 查看任务
HGETALL datasetSyncQueue:xxx
```

---

## ❓ 常见问题

### Q1: 服务启动后自动关闭?

**原因**: 终端窗口关闭或进程被中断

**解决方案**:
```powershell
# 使用稳定启动脚本
.\start-fastgpt-stable.ps1

# 该脚本会在独立窗口运行服务
```

---

### Q2: API 返回 404 Not Found?

**原因**: Next.js 首次启动需要编译 API 路由

**解决方案**:
```powershell
# 等待 30-90 秒让 Next.js 完成编译
# 或者清理缓存重新编译
Remove-Item -Path "projects/app/.next" -Recurse -Force
pnpm dev
```

---

### Q3: 数据库连接失败?

**检查步骤**:
```powershell
# 1. 检查 Docker 服务
docker ps

# 2. 检查端口监听
netstat -ano | findstr ":27017"  # MongoDB
netstat -ano | findstr ":6379"   # Redis
netstat -ano | findstr ":5432"   # PostgreSQL

# 3. 重启数据库
cd deploy/dev
docker-compose restart
```

---

### Q4: 向量生成失败?

**原因**: Ollama 模型未安装或服务未启动

**解决方案**:
```powershell
# 1. 启动 Ollama
ollama serve

# 2. 拉取 Embedding 模型
ollama pull bge-m3
ollama pull nomic-embed-text

# 3. 测试模型
ollama run bge-m3
```

---

### Q5: 依赖安装失败?

**解决方案**:
```powershell
# 1. 清理缓存
pnpm store prune
Remove-Item -Path "node_modules" -Recurse -Force

# 2. 使用淘宝镜像
pnpm install --registry=https://registry.npmmirror.com

# 3. 如仍失败,使用 --force
pnpm install --force
```

---

### Q6: Docker 构建超时?

**解决方案**:
```powershell
# 1. 配置 Docker 镜像加速
# 编辑 Docker Desktop 设置 > Docker Engine
# 添加淘宝镜像

# 2. 增加内存限制
# Docker Desktop > Settings > Resources
# Memory: 至少 8GB

# 3. 分阶段构建
docker build --target dependencies ...
docker build --target builder ...
```

---

## 🎯 最佳实践

### 1. 代码组织

```
projects/app/src/
├── pages/              # Next.js 页面和 API
│   ├── api/            # API 路由
│   │   ├── core/       # 核心业务
│   │   └── support/    # 支持功能
│   └── app/            # 页面组件
├── components/         # UI 组件
│   ├── common/         # 通用组件
│   └── core/           # 业务组件
├── web/                # 前端逻辑
│   ├── core/           # 核心模块
│   └── support/        # 支持模块
└── utils/              # 工具函数
```

**原则**:
- 单一职责: 每个文件只做一件事
- 分层清晰: UI、逻辑、数据分离
- 可复用性: 提取公共组件和函数
- 类型安全: 充分利用 TypeScript

---

### 2. API 设计

**RESTful 风格**:
```typescript
GET    /api/core/dataset/:id        # 获取知识库
POST   /api/core/dataset            # 创建知识库
PUT    /api/core/dataset/:id        # 更新知识库
DELETE /api/core/dataset/:id        # 删除知识库
POST   /api/core/dataset/:id/sync   # 同步知识库
```

**响应格式**:
```typescript
// 成功
{
  code: 200,
  data: { ... },
  message: 'success'
}

// 失败
{
  code: 500,
  error: '错误信息',
  message: 'error'
}
```

**错误处理**:
```typescript
try {
  // 业务逻辑
  const result = await someOperation();
  jsonRes(res, { data: result });
} catch (error) {
  console.error('[API Error]', error);
  jsonRes(res, {
    code: 500,
    error: error.message || '服务器错误'
  });
}
```

---

### 3. 性能优化

**前端优化**:
- 使用 `React.memo` 避免不必要的重渲染
- 懒加载大型组件: `lazy(() => import(...))`
- 虚拟滚动: 大列表使用 `react-window`
- 图片优化: 使用 Next.js `Image` 组件

**后端优化**:
- 数据库索引: 为常用查询字段建索引
- 批量操作: 使用 `bulkWrite` 等批量 API
- 缓存策略: Redis 缓存热点数据
- 异步处理: 使用 Worker 处理耗时任务

**示例**:
```typescript
// 缓存知识库信息
const getCachedDataset = async (datasetId: string) => {
  const cacheKey = `dataset:${datasetId}`;
  
  // 尝试从缓存获取
  let dataset = await redis.get(cacheKey);
  if (dataset) return JSON.parse(dataset);
  
  // 缓存未命中,查询数据库
  dataset = await MongoDataset.findById(datasetId);
  
  // 写入缓存 (1小时过期)
  await redis.setex(cacheKey, 3600, JSON.stringify(dataset));
  
  return dataset;
};
```

---

### 4. 安全考虑

**认证授权**:
```typescript
// 每个 API 都要验证身份
const { userId } = await authCert({ req, authToken: true });

// 检查资源权限
await authDataset({ datasetId, tmbId, per: 'w' });
```

**输入验证**:
```typescript
// 使用 Zod 验证输入
const schema = z.object({
  datasetId: z.string().min(1),
  rootUrl: z.string().url(),
  maxDepth: z.number().min(1).max(5)
});

const validated = schema.parse(req.body);
```

**SQL 注入防护**:
```typescript
// 使用参数化查询
const results = await pg.query(
  'SELECT * FROM model_data WHERE dataset_id = $1',
  [datasetId]  // 参数自动转义
);
```

**XSS 防护**:
```typescript
// 前端显示时转义 HTML
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
```

---

### 5. 测试策略

**单元测试**:
```typescript
// 测试工具函数
import { describe, it, expect } from 'vitest';
import { parseMarkdown } from './utils';

describe('parseMarkdown', () => {
  it('should convert HTML to Markdown', () => {
    const html = '<h1>Title</h1>';
    const md = parseMarkdown(html);
    expect(md).toBe('# Title\n');
  });
});
```

**集成测试**:
```typescript
// 测试 API 端点
describe('POST /api/core/dataset/sync/urlSync', () => {
  it('should create sync job', async () => {
    const response = await fetch('/api/core/dataset/sync/urlSync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        datasetId: 'xxx',
        rootUrl: 'http://example.com'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.jobId).toBeDefined();
  });
});
```

**端到端测试**:
参考 `test-web-sync.ps1` 和 `docs/MANUAL_TEST_GUIDE.md`

---

## 🤝 贡献指南

### 提交代码

1. Fork 项目到自己的账号
2. 创建功能分支: `git checkout -b feature/xxx`
3. 提交代码: `git commit -m "feat: 添加xxx功能"`
4. 推送分支: `git push origin feature/xxx`
5. 创建 Pull Request

### Commit 规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

### Pull Request 清单

- [ ] 代码遵循项目规范
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 通过了所有测试
- [ ] 没有引入新的警告

---

## 📚 参考资源

### 官方文档
- [FastGPT 官方文档](https://doc.fastgpt.in/)
- [Next.js 文档](https://nextjs.org/docs)
- [MongoDB 文档](https://www.mongodb.com/docs/)
- [pgvector 文档](https://github.com/pgvector/pgvector)
- [BullMQ 文档](https://docs.bullmq.io/)

### 相关项目
- [LangChain](https://js.langchain.com/)
- [Ollama](https://ollama.ai/)
- [Chakra UI](https://chakra-ui.com/)

### 社区资源
- [FastGPT GitHub](https://github.com/labring/FastGPT)
- [FastGPT 论坛](https://forum.fastgpt.in/)

---

## 📞 获取帮助

遇到问题?尝试以下方式:

1. **查看文档**: 首先查看本指南和 `docs/` 目录
2. **搜索 Issues**: 在 GitHub Issues 中搜索类似问题
3. **查看日志**: 检查应用和数据库日志
4. **提问**: 在社区论坛或 GitHub Issues 提问

---

**文档维护者**: FastGPT 开发团队  
**最后更新**: 2025-12-18  
**反馈与建议**: 欢迎提交 Issue 或 PR
