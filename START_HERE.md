# FastGPT 项目文档导航

> **欢迎使用 FastGPT!** 这是项目文档的主入口,帮助您快速找到需要的信息。

---

## 🚀 快速开始

### 新手入门 (按顺序阅读)
1. **[README.md](README.md)** - 项目简介和特性
2. **[PROJECT_STATUS.md](PROJECT_STATUS.md)** ⭐ - 项目当前状态
3. **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** ⭐ - 完整开发指南
4. **[SCRIPTS_README.md](SCRIPTS_README.md)** - 脚本使用说明

### 快速命令
```powershell
# 启动数据库
cd deploy/dev
docker-compose up -d

# 启动 FastGPT (推荐)
cd ../..
.\start-fastgpt-stable.ps1

# 访问应用
浏览器打开: http://192.168.110.18:3000
账号: root / 1234
```

---

## 📚 核心文档系统

### 🎯 项目管理
| 文档 | 描述 | 重要性 |
|------|------|--------|
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | 项目进度、状态、日志 | ⭐⭐⭐ |
| [PROJECT_IMPROVEMENTS.md](PROJECT_IMPROVEMENTS.md) | 改进措施和最佳实践 | ⭐⭐⭐ |
| [DOCS_INDEX.md](DOCS_INDEX.md) | 文档完整索引 | ⭐⭐ |

### 💻 开发指南
| 文档 | 描述 | 重要性 |
|------|------|--------|
| [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) | 完整开发指南 (技术架构、开发流程、调试技巧) | ⭐⭐⭐ |
| [dev_zh.md](dev_zh.md) | 官方开发指南 (中文) | ⭐⭐ |
| [dev.md](dev.md) | 官方开发指南 (英文) | ⭐⭐ |

### 🚀 部署运维
| 文档 | 描述 | 重要性 |
|------|------|--------|
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | 通用部署指南 | ⭐⭐⭐ |
| [DOCKER_DEPLOYMENT_SOLUTION.md](DOCKER_DEPLOYMENT_SOLUTION.md) | Docker 部署方案 | ⭐⭐ |
| [BUILD_ISSUES_ANALYSIS.md](BUILD_ISSUES_ANALYSIS.md) | 构建问题分析 | ⭐ |

### 🔧 工具脚本
| 文档 | 描述 | 重要性 |
|------|------|--------|
| [SCRIPTS_README.md](SCRIPTS_README.md) | 所有脚本使用说明 | ⭐⭐⭐ |
| [scripts/](scripts/) | 脚本文件目录 | - |

### 📝 更新日志
| 文档 | 描述 | 重要性 |
|------|------|--------|
| [.changelog/2025-12-18.md](.changelog/2025-12-18.md) | 最新更新日志 | ⭐⭐⭐ |
| [.changelog/TEMPLATE.md](.changelog/TEMPLATE.md) | 更新日志模板 | ⭐⭐ |

---

## 🎯 按场景查找

### 场景 1: 我是新手,想了解项目
```
1. README.md - 了解 FastGPT 是什么
2. PROJECT_STATUS.md - 查看项目现状
3. DEVELOPMENT_GUIDE.md - 学习如何开发
4. 启动项目试用
```

### 场景 2: 我要开始开发
```
1. DEVELOPMENT_GUIDE.md#环境准备 - 安装必需软件
2. DEVELOPMENT_GUIDE.md#快速开始 - 启动项目
3. DEVELOPMENT_GUIDE.md#开发流程 - 了解开发规范
4. PROJECT_STATUS.md#当前阶段目标 - 选择任务
```

### 场景 3: 服务遇到问题
```
1. DEVELOPMENT_GUIDE.md#常见问题 - 查看常见问题
2. docs/SERVICE_AUTO_CLOSE_FIX.md - 服务关闭问题
3. docs/WEB_API_HTML_RESPONSE_FIX.md - API 错误
4. SCRIPTS_README.md - 使用诊断脚本
```

### 场景 4: 我要部署到生产环境
```
1. DEPLOYMENT_GUIDE.md - 部署流程
2. DOCKER_DEPLOYMENT_SOLUTION.md - Docker 方案
3. PROJECT_IMPROVEMENTS.md#备份恢复策略 - 备份方案
4. PROJECT_IMPROVEMENTS.md#安全加固措施 - 安全配置
```

### 场景 5: 我要添加新功能
```
1. DEVELOPMENT_GUIDE.md#核心模块详解 - 理解架构
2. PROJECT_STATUS.md#详细开发日志 - 查看历史实现
3. 编写代码和测试
4. .changelog/TEMPLATE.md - 记录变更
5. PROJECT_STATUS.md - 更新进度
```

### 场景 6: 我要修复 Bug
```
1. 复现问题
2. DEVELOPMENT_GUIDE.md#调试技巧 - 使用调试工具
3. 定位根因
4. 编写修复和测试
5. .changelog/TEMPLATE.md - 记录修复
6. PROJECT_STATUS.md - 更新日志
```

---

## 🔍 按问题类型查找

### 服务问题
| 问题 | 文档 |
|------|------|
| 服务自动关闭 | [docs/SERVICE_AUTO_CLOSE_FIX.md](docs/SERVICE_AUTO_CLOSE_FIX.md) |
| API 返回 HTML | [docs/WEB_API_HTML_RESPONSE_FIX.md](docs/WEB_API_HTML_RESPONSE_FIX.md) |
| 端口被占用 | [DEVELOPMENT_GUIDE.md#常见问题](DEVELOPMENT_GUIDE.md#常见问题) |
| 数据库连接失败 | [DEVELOPMENT_GUIDE.md#常见问题](DEVELOPMENT_GUIDE.md#常见问题) |

### 功能问题
| 问题 | 文档 |
|------|------|
| 文件上传失败 | [docs/FILE_UPLOAD_FIX.md](docs/FILE_UPLOAD_FIX.md) |
| Web 同步不工作 | [docs/WEB_SYNC_UNLOCK.md](docs/WEB_SYNC_UNLOCK.md) |
| 向量生成失败 | [DEVELOPMENT_GUIDE.md#常见问题](DEVELOPMENT_GUIDE.md#常见问题) |
| 模型配置错误 | [docs/MODEL_CONFIG_QUICK_REF.md](docs/MODEL_CONFIG_QUICK_REF.md) |

### 配置问题
| 问题 | 文档 |
|------|------|
| 局域网无法访问 | [docs/LAN_ACCESS_GUIDE.md](docs/LAN_ACCESS_GUIDE.md) |
| Docker 构建失败 | [BUILD_ISSUES_ANALYSIS.md](BUILD_ISSUES_ANALYSIS.md) |
| 依赖安装失败 | [DEVELOPMENT_GUIDE.md#常见问题](DEVELOPMENT_GUIDE.md#常见问题) |

---

## 📂 目录结构

```
FastGPT/
├── 📄 START_HERE.md              ← 您在这里!
├── 📄 README.md                  - 项目简介
├── 📄 PROJECT_STATUS.md          ⭐ 项目状态
├── 📄 DEVELOPMENT_GUIDE.md       ⭐ 开发指南
├── 📄 SCRIPTS_README.md          ⭐ 脚本说明
├── 📄 DOCS_INDEX.md              - 文档索引
├── 📄 PROJECT_IMPROVEMENTS.md    - 改进措施
├── 📄 DEPLOYMENT_GUIDE.md        - 部署指南
├── 📄 DOCKER_DEPLOYMENT_SOLUTION.md - Docker 方案
├── 📄 BUILD_ISSUES_ANALYSIS.md   - 构建问题
│
├── 📁 docs/                      - 专题文档
│   ├── 修复指南/
│   ├── 配置指南/
│   ├── 功能文档/
│   ├── 测试文档/
│   ├── 分析报告/
│   └── archive/                  - 历史文档
│
├── 📁 .changelog/                - 更新日志
│   ├── TEMPLATE.md               - 日志模板
│   └── 2025-12-18.md            - 最新日志
│
├── 📁 scripts/                   - 工具脚本
│   ├── 各种脚本文件
│   └── archive/                  - 过时脚本
│
├── 📁 projects/app/              - 主应用代码
├── 📁 packages/                  - 共享包
├── 📁 test/                      - 测试文件
└── 📁 deploy/                    - 部署配置
```

---

## 🎓 学习路径

### Level 1: 入门 (1-2 天)
- [ ] 阅读 README.md
- [ ] 阅读 PROJECT_STATUS.md
- [ ] 安装环境和依赖
- [ ] 启动项目并访问
- [ ] 浏览主要功能

### Level 2: 开发 (3-5 天)
- [ ] 深入阅读 DEVELOPMENT_GUIDE.md
- [ ] 理解技术架构
- [ ] 熟悉代码结构
- [ ] 尝试修改简单功能
- [ ] 运行测试

### Level 3: 贡献 (持续)
- [ ] 选择感兴趣的模块深入
- [ ] 解决 Issue 或添加功能
- [ ] 编写测试和文档
- [ ] 提交 Pull Request
- [ ] 参与 Code Review

---

## 📋 开发检查清单

### 开始开发前
- [ ] 阅读相关文档
- [ ] 拉取最新代码
- [ ] 更新依赖
- [ ] 启动开发环境
- [ ] 了解相关模块

### 开发过程中
- [ ] 遵循代码规范
- [ ] 添加必要注释
- [ ] 编写单元测试
- [ ] 本地验证功能
- [ ] 检查性能影响

### 提交代码前
- [ ] 运行 ESLint 检查
- [ ] 运行所有测试
- [ ] 更新相关文档
- [ ] 填写更新日志
- [ ] 更新 PROJECT_STATUS.md

---

## 🔗 重要链接

### 官方资源
- **官方网站**: https://fastgpt.in/
- **官方文档**: https://doc.fastgpt.in/
- **GitHub**: https://github.com/labring/FastGPT
- **论坛**: https://forum.fastgpt.in/

### 技术文档
- **Next.js**: https://nextjs.org/docs
- **MongoDB**: https://www.mongodb.com/docs/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **BullMQ**: https://docs.bullmq.io/
- **Ollama**: https://ollama.ai/

### 工具
- **VSCode**: https://code.visualstudio.com/
- **Docker**: https://www.docker.com/
- **Postman**: https://www.postman.com/

---

## 💬 获取帮助

### 问题排查顺序
1. **搜索文档** - 先在本项目文档中搜索
2. **查看日志** - 检查应用和数据库日志
3. **搜索 Issues** - GitHub Issues 中可能有类似问题
4. **提问** - 在论坛或 Issues 中提问
5. **联系团队** - 紧急问题联系开发团队

### 提问模板
```markdown
## 环境信息
- OS: Windows 11 / macOS / Linux
- Node.js: 版本号
- FastGPT: 版本号

## 问题描述
清晰描述遇到的问题

## 复现步骤
1. 步骤 1
2. 步骤 2
3. ...

## 预期行为
应该发生什么

## 实际行为
实际发生了什么

## 日志/截图
相关的错误日志或截图
```

---

## 📈 项目指标

### 当前状态 (2025-12-18)
- **版本**: v4.14.4
- **代码行数**: ~150,000 行
- **文档数量**: 73+ 个
- **脚本数量**: 13 个
- **核心模块**: 6 个
- **测试覆盖**: 待完善

### 近期里程碑
- ✅ 2025-12-18: 服务稳定性修复
- ✅ 2025-12-18: 文档体系完善
- ✅ 2025-12-17: Web 站点同步实现
- ⏳ 2025-12-20: 端到端测试完成
- ⏳ 2025-12-25: Docker 构建修复

---

## 🎉 开始您的 FastGPT 之旅!

选择您的角色开始:

### 👨‍💻 开发者
→ [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)

### 🚀 运维人员
→ [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### 📚 文档编写者
→ [DOCS_INDEX.md](DOCS_INDEX.md)

### 🎯 项目管理
→ [PROJECT_STATUS.md](PROJECT_STATUS.md)

---

**最后更新**: 2025-12-18  
**维护者**: FastGPT 开发团队  
**反馈**: 欢迎在 GitHub Issues 提出建议
