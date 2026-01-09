# FastGPT Web 站点同步功能测试指南

## 📋 测试环境

- **测试网站地址**: http://localhost:8080
- **FastGPT 地址**: http://192.168.110.18:3000
- **测试账号**: root / 1234

## 📂 测试网站结构

已创建 4 个 HTML 页面:
```
D:\FastGPT\test-website\
├── index.html      # 首页 - FastGPT 简介
├── about.html      # 关于我们 - 项目介绍和优势
├── products.html   # 产品介绍 - 详细功能说明
└── contact.html    # 联系方式 - 社区和支持信息
```

## 🚀 测试步骤

### 1. 验证测试网站运行

✅ 测试网站服务器已启动在 http://localhost:8080

打开浏览器访问:
- http://localhost:8080/index.html
- 应该能看到 "欢迎来到 FastGPT 测试站点" 页面
- 可以通过导航栏切换不同页面

### 2. 创建 Web 站点类型知识库

1. 访问 FastGPT: http://192.168.110.18:3000
2. 登录账号: root / 1234
3. 点击 "知识库" → "创建知识库"
4. 选择 "Web 站点" 类型
5. 输入知识库名称: "测试网站同步"
6. 点击 "确认创建"

### 3. 配置 Web 站点同步

1. 进入刚创建的知识库详情页
2. 点击右上角 "站点配置" 按钮
3. 填写配置信息:
   - **根地址**: `http://localhost:8080`
   - **网页选择器**: `body` (或留空使用默认)
   
4. 配置分块参数(使用默认值即可):
   - **分块方式**: 直接分块
   - **最大长度**: 512
   - **索引模式**: Q&A 生成

5. 点击 "开始同步" → 确认

### 4. 验证同步任务

**查看日志**:
服务器终端应该显示:
```
[Info] [DatasetSync] Start syncing dataset: [dataset_id]
[Info] [DatasetSync] Found X collections for dataset [dataset_id]
[Info] [DatasetSync] Syncing collection: [collection_id]
[Info] [DatasetSync] Dataset sync completed
```

**前端检查**:
1. 知识库列表应该显示 "同步中" 或 "同步完成" 状态
2. 集合列表中应该出现网站页面对应的集合
3. 查看数据 Tab,应该能看到抓取的内容块

### 5. 测试知识库检索

1. 在知识库详情页,切换到 "测试搜索" Tab
2. 输入测试问题:
   - "FastGPT 有哪些功能?"
   - "如何导入数据到知识库?"
   - "支持哪些大模型?"
   - "如何联系技术支持?"

3. 验证检索结果:
   - 应该返回相关的内容块
   - 可以看到来源页面(index.html, products.html 等)
   - 相似度评分应该 > 0.5

### 6. 创建问答应用测试

1. 进入 "应用" 页面
2. 创建新应用,选择 "简单问答" 模板
3. 在工作流中添加 "知识库搜索" 节点
4. 选择刚创建的 "测试网站同步" 知识库
5. 配置搜索参数:
   - 相似度: 0.5
   - 返回数量: 5

6. 测试对话:
   - "介绍一下 FastGPT"
   - "如何使用 FastGPT 的知识库功能?"
   - "FastGPT 支持哪些数据源?"

7. 验证答案是否基于同步的网站内容

## 🔍 验证点清单

### API 层面
- ✅ `/api/core/dataset/datasetSync` API 正常响应 200
- ✅ 请求体包含正确的 datasetId
- ✅ 返回成功消息

### Worker 层面
- ✅ Dataset Sync Worker 已初始化
- ✅ Worker 正常处理队列任务
- ✅ 日志显示同步开始和完成

### 数据层面
- ✅ MongoDB `dataset_collections` 表创建记录
- ✅ MongoDB `dataset_datas` 表创建数据块
- ✅ PostgreSQL `dataset_data_vectors` 表创建向量

### 功能层面
- ✅ 前端不再报 removeChild 错误
- ✅ Modal 正常关闭
- ✅ 同步任务成功添加到队列
- ✅ 网站内容正确抓取和分块
- ✅ 检索功能返回正确结果

## 🐛 可能遇到的问题

### 问题1: 网站无法访问
**现象**: FastGPT 无法访问 localhost:8080
**原因**: Docker 容器网络隔离
**解决**: 
- 使用宿主机 IP: `http://192.168.110.18:8080`
- 或使用 `host.docker.internal:8080` (Windows Docker Desktop)

### 问题2: 同步卡住不动
**现象**: 一直显示 "同步中"
**检查**:
```powershell
# 检查 Redis 队列
docker exec -it fastgpt-redis redis-cli
KEYS bull:datasetSync:*
```

### 问题3: 抓取内容为空
**原因**: 选择器不正确或页面结构问题
**解决**: 
- 使用浏览器开发者工具检查页面结构
- 调整选择器,如 `.content` 或 `main`

## 📊 预期结果

成功同步后应该看到:
- 4 个集合(对应 4 个 HTML 页面)
- 每个集合包含多个数据块
- 数据块内容包含页面的文字信息
- 搜索 "FastGPT" 相关问题能返回准确答案

## 🎯 测试完成标准

- [x] 测试网站正常访问
- [ ] Web 站点知识库创建成功
- [ ] 站点配置保存成功
- [ ] 同步任务执行完成
- [ ] 数据正确导入知识库
- [ ] 检索功能返回准确结果
- [ ] 问答应用正常工作

---

**测试完成后记得**:
- 停止测试网站服务器 (终端按 Ctrl+C)
- 可以保留知识库用于后续测试
- 或清理测试数据
