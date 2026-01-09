# FastGPT 文档索引

本目录包含 FastGPT 的配置、部署和问题解决文档。

## 📖 主要文档

### 部署方案

- **[Docker部署完整方案](../DOCKER_DEPLOYMENT_SOLUTION.md)** ⭐ 推荐
  - Docker Compose生产环境部署
  - Ollama模型配置详解(第8节)
  - 模型导入与验证
  - Connection Error问题修复
  - 模型身份错误排查(第9节)
  - 完整的故障排除指南
  - 最后更新: 2025-12-16

- **[模型配置速查表](MODEL_CONFIG_QUICK_REF.md)** ⭐ 快速参考
  - 当前已配置的8个模型列表
  - 常用命令快速索引
  - 添加新模型的完整步骤
  - 常见错误及解决方案
  - 配置模板
  - 最后更新: 2025-12-16

- **[构建问题分析](../BUILD_ISSUES_ANALYSIS.md)**
  - 本地构建失败原因分析
  - standalone目录为空的解释
  - 为什么Docker方案更可靠
  - 最后更新: 2025-12-16

### 快速启动

- **[快速启动脚本](../quick-start.ps1)**
  - 自动化启动脚本
  - 支持Docker和开发模式
  - 包含健康检查
  - 使用方法: `.\quick-start.ps1`

### 数据库工具

- **[模型初始化脚本](../init-models.js)**
  - 从config.json导入模型到MongoDB
  - 用于本地开发环境
  - 使用方法: `node init-models.js`

- **[模型导入脚本](../import-models.js)**
  - 简化版模型导入
  - 用于Docker环境
  - 使用方法: 复制到容器后执行

## 📦 归档文档

以下文档已归档到 `archive/` 目录,记录了问题解决的历史过程:

### Connection Error 修复历史 (2个)
- `CONNECTION_ERROR_FIX.md` - 初次问题分析 (8.3KB)
- `OLLAMA_CONNECTION_FIX.md` - Ollama专项修复 (5.9KB)

### 模型配置历史 (3个)
- `MODEL_CONFIGURATION_GUIDE.md` - 完整配置指南 (20.2KB)
- `OLLAMA_MODELS_CONFIGURATION.md` - Ollama配置报告 (7.1KB)
- `MODEL_PROVIDER_ISSUES_RESOLUTION.md` - 提供商问题解决 (18.2KB)

### 部署历史 (4个)
- `DEPLOYMENT_STATUS.md` - 部署状态记录 (4.9KB)
- `DEPLOYMENT_REPORT.md` - 部署报告 (5.3KB)
- `QUICK_START.md` - 早期快速启动文档 (4.2KB)
- `LOCAL_DEV_GUIDE.md` - 本地开发指南 (6.4KB)

### 其他历史文档 (3个)
- `AIPROXY_SOLUTION.md` - AIProxy配置方案 (10.8KB)
- `WHITE_SCREEN_SOLUTION.md` - 白屏问题解决 (2.9KB)
- `TROUBLESHOOTING.md` - 故障排除 (3.4KB)

**总计**: 12个历史文档已归档,保留供参考

## 🚀 快速开始

### 1. Docker 生产部署 (推荐)

```powershell
# 停止开发环境
cd d:\FastGPT\deploy\dev
docker-compose down

# 启动生产环境
cd d:\FastGPT\deploy\docker\cn
docker-compose -f docker-compose.pg.yml up -d

# 查看日志
docker logs fastgpt -f
```

访问: http://localhost:3000 (登录: root / 1234)

### 2. 使用快速启动脚本

```powershell
cd d:\FastGPT
.\quick-start.ps1
```

### 3. 模型配置

Docker环境中的模型通过MongoDB管理,参考 [DOCKER_DEPLOYMENT_SOLUTION.md](../DOCKER_DEPLOYMENT_SOLUTION.md) 的第6节。

## ⚠️ 重要提示

1. **推荐使用Docker部署** - 本地构建存在依赖问题
2. **模型配置在MongoDB** - 不是通过config.json自动加载
3. **Ollama模型不需要requestAuth** - 移除该字段避免Connection Error
4. **使用host.docker.internal** - Docker内访问宿主机服务

## 🔧 常见问题

### Connection Error
原因: `requestAuth` 字段导致发送无效的 Bearer token
解决: 从配置中移除 `requestAuth` 字段

### 模型未加载 (active: 0)
原因: MongoDB中模型缺少 `metadata.isActive: true`
解决: 更新MongoDB文档添加该字段

### 本地构建失败
原因: 依赖版本冲突,构建工具链问题
解决: 使用Docker部署替代

详细解决方案请参考主文档。

## 📝 文档更新规范

为保持文档清晰,请遵循以下规范:

1. **新增功能** - 更新主文档 `DOCKER_DEPLOYMENT_SOLUTION.md`
2. **问题修复** - 在主文档添加故障排除章节
3. **临时笔记** - 使用临时文件名(带日期),解决后合并到主文档并删除
4. **历史记录** - 重要的问题解决过程可归档到 `archive/`

### 文件命名约定
- 主文档: `大写_下划线_分隔.md`
- 脚本: `小写-连字符-分隔.{ps1,js}`
- 临时文档: `TEMP_描述_YYYYMMDD.md`
- 归档文档: 移动到 `docs/archive/`

## 📚 相关资源

- [FastGPT 官方文档](https://doc.fastgpt.in/)
- [FastGPT GitHub](https://github.com/labring/FastGPT)
- [Ollama 官网](https://ollama.ai/)
- [智谱AI开放平台](https://open.bigmodel.cn/)

---

最后更新: 2025-12-16
维护者: FastGPT 部署团队
