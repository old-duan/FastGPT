# FastGPT 二次开发完整手册

> **文档版本**: v2.0  
> **最后更新**: 2025年12月23日  
> **适用版本**: FastGPT v4.14.4 (开源增强版)  
> **项目状态**: ✅ 阶段性目标完成

---

## 📖 前言

### 项目背景

本项目是 FastGPT 开源版本的二次开发项目，在官方开源版基础上增加了商业版特有功能（如 Web 站点同步），实现了完全私有化部署的企业级知识库问答系统。

### 阶段性成果概述

| 成果项 | 状态 | 说明 |
|--------|------|------|
| Web 站点同步功能 | ✅ 完成 | 支持自动爬取网站内容并向量化存储 |
| Ollama 本地模型集成 | ✅ 完成 | 4个LLM + 3个Embedding 模型 |
| 服务稳定性修复 | ✅ 完成 | 解决商业版API导致的服务崩溃 |
| 开发环境配置 | ✅ 完成 | 本地开发环境完全就绪 |
| 文档体系建设 | ✅ 完成 | 完整的开发使用指南 |

### 指南使用说明

- **新手开发者**: 从 [第一章 环境准备](#第一章-环境准备) 开始阅读
- **团队维护人员**: 重点关注 [第六章 常见问题排查](#第六章-常见问题排查)
- **二次开发人员**: 参考 [第五章 二次开发规范](#第五章-二次开发规范)

---

## 目录

1. [第一章 环境准备](#第一章-环境准备)
2. [第二章 项目源码操作](#第二章-项目源码操作)
3. [第三章 编译与启动](#第三章-编译与启动)
4. [第四章 核心功能操作](#第四章-核心功能操作)
5. [第五章 二次开发规范](#第五章-二次开发规范)
6. [第六章 常见问题排查](#第六章-常见问题排查)
7. [第七章 附件](#第七章-附件)

---

# 第一章 环境准备

## 1.1 必备软件清单

| 软件 | 最低版本 | 推荐版本 | 用途 | 安装验证 |
|------|----------|----------|------|----------|
| Node.js | 20.0+ | 24.9.0 | JavaScript 运行时 | `node --version` |
| pnpm | 9.0+ | 9.15.0 | 包管理器 | `pnpm --version` |
| Docker | 24.0+ | 27.0+ | 容器化服务 | `docker --version` |
| Docker Compose | 2.20+ | 2.30+ | 容器编排 | `docker compose version` |
| Git | 2.40+ | 2.47+ | 版本控制 | `git --version` |
| VS Code | 1.85+ | 最新版 | 开发IDE | - |

### 安装步骤 (Windows)

```powershell
# 1. 安装 Node.js (使用 nvm-windows)
# 下载: https://github.com/coreybutler/nvm-windows/releases
nvm install 24.9.0
nvm use 24.9.0

# 2. 安装 pnpm
npm install -g pnpm@9

# 3. 安装 Docker Desktop
# 下载: https://www.docker.com/products/docker-desktop

# 4. 验证安装
node --version      # v24.9.0
pnpm --version      # 9.15.0
docker --version    # Docker version 27.x
```

## 1.2 依赖服务配置

### 数据库服务 (Docker Compose)

项目依赖以下服务，使用 Docker Compose 一键启动：

```yaml
# 位置: deploy/dev/docker-compose.yml
services:
  mongo:      # MongoDB 主数据库
  pg:         # PostgreSQL + pgvector 向量数据库
  redis:      # Redis 缓存和队列
  ollama:     # Ollama 本地模型服务
```

**启动命令**:
```powershell
cd deploy/dev
docker-compose up -d

# 验证服务状态
docker ps
```

### 端口信息对照表

| 端口 | 服务 | 协议 | 默认状态 | 配置路径 |
|------|------|------|----------|----------|
| 3000 | FastGPT Web | HTTP | 开发启用 | `projects/app/next.config.mjs` |
| 27017 | MongoDB | TCP | Docker内部 | `deploy/dev/docker-compose.yml` |
| 28017 | MongoDB (外部) | TCP | Docker映射 | `deploy/dev/docker-compose.yml` |
| 5432 | PostgreSQL | TCP | Docker内部 | `deploy/dev/docker-compose.yml` |
| 6379 | Redis | TCP | Docker内部 | `deploy/dev/docker-compose.yml` |
| 11434 | Ollama | HTTP | Docker映射 | `deploy/dev/docker-compose.yml` |

### 数据库连接信息

```yaml
MongoDB:
  连接字符串: mongodb://myusername:mypassword@127.0.0.1:28017/fastgpt?authSource=admin
  用户名: myusername
  密码: mypassword
  数据库: fastgpt

PostgreSQL:
  连接字符串: postgresql://postgres:1234@127.0.0.1:5432/postgres
  用户名: postgres
  密码: 1234
  数据库: postgres

Redis:
  连接地址: redis://127.0.0.1:6379
  密码: 无 (开发环境)
```

## 1.3 环境变量配置

主要配置文件: `projects/app/data/config.local.json`

```json
{
  "feConfigs": {
    "lafEnv": "https://laf.dev"
  },
  "systemEnv": {
    "vectorMaxProcess": 15,
    "qaMaxProcess": 15,
    "pgHNSWEfSearch": 100
  }
}
```

---

# 第二章 项目源码操作

## 2.1 目录结构解读

```
D:\FastGPT/
├── projects/                    # 主要应用项目
│   ├── app/                     # FastGPT 主应用 ⭐
│   │   ├── src/                 # 源代码
│   │   │   ├── pages/           # Next.js 页面和 API
│   │   │   ├── components/      # React 组件
│   │   │   ├── web/             # 前端逻辑
│   │   │   └── service/         # 服务端逻辑
│   │   └── data/                # 配置文件
│   │       └── config.local.json # 本地配置 ⭐
│   └── sandbox/                 # 沙箱服务
│
├── packages/                    # 共享包
│   ├── global/                  # 全局类型和常量
│   ├── service/                 # 后端服务逻辑 ⭐
│   │   ├── core/                # 核心业务逻辑
│   │   │   ├── dataset/         # 知识库模块
│   │   │   │   └── sync/        # 同步功能 (二次开发)
│   │   │   └── ai/              # AI 模型相关
│   │   └── common/              # 公共模块
│   └── web/                     # 前端共享代码
│
├── deploy/                      # 部署配置
│   └── dev/                     # 开发环境 Docker Compose
│
├── scripts/                     # 工具脚本
├── docs/                        # 项目文档
├── test-website/                # 测试用网站
└── *.ps1, *.js                  # 根目录脚本
```

## 2.2 核心配置文件

| 文件路径 | 用途 | 修改频率 |
|----------|------|----------|
| `projects/app/data/config.local.json` | 系统配置、模型配置 | 常改 |
| `deploy/dev/docker-compose.yml` | Docker 服务配置 | 偶尔 |
| `projects/app/next.config.mjs` | Next.js 配置 | 少改 |
| `package.json` | 项目依赖 | 少改 |
| `tsconfig.json` | TypeScript 配置 | 少改 |

## 2.3 分支管理规范

```bash
# 分支命名
main              # 主分支 (稳定版本)
develop           # 开发分支
feature/xxx       # 功能分支
bugfix/xxx        # 修复分支
hotfix/xxx        # 紧急修复

# 常用操作
git checkout -b feature/new-feature  # 创建功能分支
git add .
git commit -m "feat: 添加新功能"
git push origin feature/new-feature
```

---

# 第三章 编译与启动

## 3.1 首次安装

```powershell
# 1. 克隆项目 (如果还没有)
git clone https://github.com/old-duan/FastGPT.git
cd FastGPT

# 2. 安装依赖
pnpm install

# 3. 启动数据库服务
cd deploy/dev
docker-compose up -d
cd ../..

# 4. 初始化模型配置 (首次)
node init-models.js
```

## 3.2 日常开发启动

### 方式一: 推荐方式 (稳定启动)

```powershell
.\start-fastgpt-stable.ps1
```

**特点**:
- 独立窗口运行，防止意外关闭
- 完整的前置检查
- 自动等待服务就绪

### 方式二: 标准方式

```powershell
cd projects/app
pnpm dev
```

**特点**:
- 可查看实时日志
- 支持 Ctrl+C 快速停止

## 3.3 启动验证

```powershell
# 检查服务状态
curl http://localhost:3000/api/health

# 检查数据库连接
docker exec mongo mongosh --eval "db.stats()"

# 检查模型服务
curl http://localhost:11434/api/tags
```

**访问应用**:
- 本地: http://localhost:3000
- 局域网: http://192.168.110.18:3000
- 账号: root / 1234

---

# 第四章 核心功能操作

## 4.1 可用模型列表

### LLM 模型 (对话生成)

| 模型名称 | 模型ID | 提供商 | 上下文 | 用途 |
|----------|--------|--------|--------|------|
| 通义千问3-8B | qwen3:8b | Ollama | 32K | 通用对话、问答 |
| DeepSeek-R1-8B | deepseek-r1:8b | Ollama | 32K | 推理、代码 |
| Llama3-8B | llama3:8b | Ollama | 8K | 英文对话 |
| 通义千问2-7B | qwen2:7b | Ollama | 32K | 通用对话 |

### Embedding 模型 (向量化)

| 模型名称 | 模型ID | 提供商 | 维度 | 用途 |
|----------|--------|--------|------|------|
| BGE-M3 | bge-m3:latest | Ollama | 1024 | 中文首选 |
| MXBAI-Large | mxbai-embed-large:latest | Ollama | 1024 | 通用 |
| Nomic-Embed | nomic-embed-text:latest | Ollama | 768 | 轻量级 |

### 模型提供商配置

系统支持自定义模型提供商（Provider），用于在前端显示对应的图标和名称。

**核心文件：**
- 图标文件：`packages/web/components/common/Icon/icons/model/`
- 图标注册：`packages/web/components/common/Icon/constants.ts`
- Provider 配置：`packages/service/core/app/provider/controller.ts`

**已配置的本地 Provider：**
| Provider | 图标路径 | 说明 |
|----------|----------|------|
| Ollama | `model/ollama` | 本地 Ollama 模型 |

**添加新 Provider 步骤：**
1. 创建 SVG 图标至 `packages/web/components/common/Icon/icons/model/`
2. 在 `constants.ts` 中注册图标路径
3. 在 `controller.ts` 的 `localProviders` 数组中添加配置
4. 更新 MongoDB 中模型的 `metadata.provider` 和 `metadata.avatar`

## 4.2 Web 站点同步功能

### 功能说明

Web 站点同步是二次开发的核心功能，允许用户将外部网站内容自动爬取并同步到知识库。

### 操作步骤

1. **创建知识库**
   - 进入「知识库」页面
   - 点击「新建知识库」
   - 类型选择「Web 站点同步」
   - 填写知识库名称

2. **配置同步源**
   - 输入网站根 URL
   - 设置爬取深度 (建议 1-3)
   - 选择同步模式 (增量/完整)

3. **开始同步**
   - 点击「立即同步」
   - 系统自动爬取网页内容
   - 内容解析为 Markdown
   - 自动向量化存储

4. **验证结果**
   - 查看同步进度
   - 检查数据条数
   - 测试问答效果

## 4.3 对话 Agent 使用

1. 进入「工作台」→「简易应用」或「工作流」
2. 创建新应用，选择 AI 模型
3. 关联知识库
4. 测试对话效果

---

# 第五章 二次开发规范

## 5.1 代码编写规范

### 命名规范

```typescript
// 文件名: kebab-case
user-service.ts
dataset-sync-worker.ts

// 类名: PascalCase
class DatasetSyncWorker {}

// 函数名: camelCase
function processWebSync() {}

// 常量: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// 变量: camelCase
const datasetId = '123';
```

### 注释规范

```typescript
/**
 * Web 站点同步 Worker
 * @description 处理 Web 站点的自动爬取和同步任务
 * @author Developer
 * @date 2025-12-23
 */
export class WebSyncWorker {
  /**
   * 执行同步任务
   * @param datasetId - 知识库ID
   * @param rootUrl - 根URL
   * @returns 同步结果
   */
  async execute(datasetId: string, rootUrl: string): Promise<SyncResult> {
    // 实现逻辑
  }
}
```

## 5.2 提交规范

### Commit 信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例**:
```bash
git commit -m "feat(dataset): 添加 Web 站点同步功能

- 实现 WebSyncWorker 处理器
- 添加递归爬取逻辑
- 集成 BullMQ 队列

Closes #123"
```

## 5.3 模块扩展流程

### 添加新 API

1. 在 `projects/app/src/pages/api/` 下创建文件
2. 按照现有 API 格式编写
3. 添加权限验证
4. 编写单元测试

### 添加新 Worker

1. 在 `packages/service/` 下创建 Worker 文件
2. 注册到 Worker 初始化模块
3. 配置 Redis 队列
4. 编写日志记录

---

# 第六章 常见问题排查

## 6.1 环境问题

### 问题: pnpm install 失败

**现象**: 依赖安装报错，网络超时

**解决方案**:
```powershell
# 设置镜像
pnpm config set registry https://registry.npmmirror.com

# 清理缓存重试
pnpm store prune
pnpm install
```

### 问题: Docker 服务启动失败

**现象**: docker-compose up 报错

**解决方案**:
```powershell
# 检查 Docker 服务
docker info

# 重启 Docker Desktop
# 或清理旧容器
docker-compose down -v
docker-compose up -d
```

## 6.2 启动问题

### 问题: 端口被占用

**现象**: Error: listen EADDRINUSE: address already in use :::3000

**解决方案**:
```powershell
# 查找占用进程
netstat -ano | findstr :3000

# 终止进程
taskkill /PID <进程ID> /F
```

### 问题: MongoDB 连接失败

**现象**: MongoServerSelectionError

**解决方案**:
```powershell
# 检查 MongoDB 容器
docker logs mongo

# 重启容器
docker restart mongo

# 验证连接
docker exec mongo mongosh --eval "db.stats()"
```

## 6.3 功能问题

### 问题: AI 对话返回空值

**现象**: 提问后返回空内容

**排查步骤**:
1. 检查模型配置的 `requestUrl`
2. 验证 Ollama 服务是否正常
3. 查看 FastGPT 日志

**解决方案**:
```javascript
// 检查模型配置
// requestUrl 应为完整路径
"requestUrl": "http://localhost:11434/v1/chat/completions"
```

### 问题: Web 同步数据为0

**现象**: 同步完成但数据条数为0

**排查步骤**:
1. 检查 Embedding 模型配置
2. 验证 PostgreSQL 连接
3. 查看 Worker 日志

---

# 第七章 附件

## 7.1 可用脚本清单

### 启动脚本

| 脚本名称 | 路径 | 用途 | 推荐度 |
|----------|------|------|--------|
| start-fastgpt-stable.ps1 | 根目录 | 稳定启动开发环境 | ⭐⭐⭐ |
| start-dev.ps1 | 根目录 | 传统开发启动 | ⭐⭐ |

### 工具脚本

| 脚本名称 | 路径 | 用途 |
|----------|------|------|
| init-models.js | 根目录 | 初始化模型配置到数据库 |
| test-all-models.js | 根目录 | 验证所有模型可用性 |
| verify-models.js | 根目录 | 验证模型配置 |

### 已废弃脚本 (建议删除)

| 脚本名称 | 废弃原因 |
|----------|----------|
| quick-start.ps1 | 功能重复 |
| check-*.js (多个) | 调试用，已完成使命 |
| test-web-sync*.js | 测试用，可归档 |
| temp_*.js | 临时文件 |

## 7.2 使用命令速查表

### 环境准备

```powershell
# 安装依赖
pnpm install

# 启动数据库
cd deploy/dev && docker-compose up -d && cd ../..

# 初始化模型
node init-models.js
```

### 日常开发

```powershell
# 启动开发环境
.\start-fastgpt-stable.ps1

# 查看日志
Get-Content fastgpt-live.log -Tail 50 -Wait

# 停止服务
Get-Process -Name "node" | Stop-Process -Force
```

### 数据库操作

```powershell
# 连接 MongoDB
docker exec -it mongo mongosh -u myusername -p mypassword --authenticationDatabase admin

# 查看模型配置
docker exec mongo mongosh ... --eval 'db.getSiblingDB("fastgpt").system_models.find({"metadata.isActive": true}).forEach(m => print(m.model))'
```

## 7.3 配置参数对照表

### config.local.json 关键参数

| 参数路径 | 默认值 | 说明 |
|----------|--------|------|
| systemEnv.vectorMaxProcess | 15 | 向量化并发数 |
| systemEnv.qaMaxProcess | 15 | QA 处理并发数 |
| systemEnv.pgHNSWEfSearch | 100 | 向量搜索精度 |
| feConfigs.isPlus | true | 启用商业版功能 |

### 模型配置关键参数

| 参数 | 类型 | 说明 |
|------|------|------|
| model | string | 模型标识符 |
| name | string | 显示名称 |
| requestUrl | string | API 请求地址 |
| maxContext | number | 最大上下文 Token |
| maxResponse | number | 最大响应 Token |

---

## 📝 文档更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2025-12-23 | v2.0 | 全面整理，完成阶段性成果文档化 |
| 2025-12-18 | v1.0 | 初始版本 |

---

**文档维护人**: FastGPT 二次开发团队  
**联系方式**: [项目仓库 Issues](https://github.com/old-duan/FastGPT/issues)
