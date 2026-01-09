# 飞书机器人接入指南

## 概述

FastGPT 支持通过飞书机器人接入，实现在飞书中与 AI 智能体对话，并自动使用关联的知识库进行回答。

## ✅ 功能特性

- ✅ **消息接收**：接收飞书用户发送的文本消息
- ✅ **知识库搜索**：自动检索应用关联的知识库（向量检索）
- ✅ **AI回复**：基于知识库内容生成智能回复
- ✅ **消息发送**：将回复发送给用户
- ✅ **重复消息过滤**：防止重复处理相同事件
- ✅ **异步处理**：防止飞书请求超时

## 快速开始

### 1. 飞书应用配置

1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 创建企业自建应用
3. 获取 **App ID** 和 **App Secret**

### 2. 配置应用权限

在飞书开放平台中，为应用添加以下权限：

- `im:message` - 获取与发送单聊、群组消息
- `im:message:send_as_bot` - 以机器人身份发送消息
- `im:message.receive_v1` - 接收消息事件

### 3. 配置事件订阅

1. 进入应用的【事件订阅】页面
2. 设置请求地址为：`https://你的域名/api/feishu/{shareId}`
   - `shareId` 是 FastGPT 外部链接的分享ID（如 `hpHsAyssoqOZ1rUGTMtuXKEp`）
3. **⚠️ 重要**：**清空 Encrypt Key（加密密钥）**
4. 订阅事件：`im.message.receive_v1`（接收消息）

### 4. 在 FastGPT 中配置

1. 创建应用并配置工作流
2. 在工作流中添加【知识库搜索】节点并关联知识库
3. 创建外部链接（OutLink），获取 shareId
4. 配置飞书应用凭证（见下方）

### 5. 发布应用

1. 在飞书开放平台发布应用版本
2. 在企业管理后台审核通过

## 配置飞书应用凭证

### 方案1：环境变量配置（推荐）

在 `.env.local` 中添加：

```env
# 飞书应用配置
FEISHU_APP_ID=cli_xxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxx

# AI 配置（智谱AI示例）
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
CHAT_API_KEY=你的API密钥
```

### 方案2：数据库配置

连接 MongoDB 更新外链：

```javascript
db.outlinks.updateOne(
  { shareId: "你的shareId" },
  { 
    $set: { 
      app: {
        appId: "cli_xxxxxxxxxx",
        appSecret: "xxxxxxxxxxxxxxxx"
      }
    }
  }
)
```

## 技术实现

### 处理流程

```
飞书用户发送消息
       ↓
飞书接口接收消息 (/api/feishu/[shareId])
       ↓
调用 FastGPT 对话 API (/api/v1/chat/completions)
使用 shareId + outLinkUid (飞书用户openId) 鉴权
       ↓
FastGPT 对话 Agent 处理
（自动使用应用配置的模型、知识库、提示词等）
       ↓
返回回复给飞书接口
       ↓
发送消息给飞书用户
```

### 优势

1. **使用应用完整配置** - 包括 AI 模型、知识库、系统提示词
2. **与 Web 端一致** - 飞书和 Web 使用相同的对话逻辑
3. **支持多轮对话** - 使用 chatId 保持对话上下文
4. **简化代码** - 不需要单独处理知识库搜索和 AI 调用

### API 接口

- **路径**: `/api/feishu/[token].ts`
- **方法**: POST
- **token**: OutLink 的 shareId

## 测试验证

### 查看服务器日志

成功的日志示例：

```
[Feishu] Request received: {...}
[Feishu] Message from: ou_xxxxxxxxxx
[Feishu] User message: 介绍婷媄婷好的专家
[Feishu] App: 测试3
[Feishu] Dataset IDs: [ '694a005cbec2d8fe598d6a81' ]
[Feishu] Searching datasets...
[Feishu] Search results: 5
[Feishu] Knowledge context built, length: 5661
[Feishu] Calling AI...
[Feishu] Using model: glm-4-flash
[Feishu] AI response received
[Feishu] Reply: 婷媄婷好拥有一支专业的专家团队...
[Feishu] Reply sent successfully
```

## 常见问题

### Q: Challenge code 没有返回
**A**: 确保**清空 Encrypt Key**，接口会正确返回 JSON 格式的 challenge。

### Q: 收不到消息
**A**: 
1. 检查服务器是否在运行
2. 检查外网是否可访问（需要公网IP或内网穿透）
3. 检查飞书事件订阅配置是否正确

### Q: 知识库搜索无结果
**A**: 
1. 确认应用工作流中配置了【知识库搜索】节点
2. 确认知识库中有相关数据
3. 检查向量模型（embedding model）配置

### Q: AI 回复失败
**A**: 
1. 检查 AI 配置（OPENAI_BASE_URL, CHAT_API_KEY）
2. 查看服务器错误日志

### Q: 飞书请求超时
**A**: 代码已实现异步处理，先返回 200 响应，再异步处理消息。

## 相关文件

| 文件 | 说明 |
|------|------|
| `projects/app/src/pages/api/feishu/[token].ts` | 飞书接口实现 |
| `packages/service/support/outLink/schema.ts` | OutLink 数据模型 |
| `packages/service/core/dataset/search/controller.ts` | 知识库搜索 |

## 更新日志

### 2025-12-31 - v1.0（功能完善）
- ✅ 完成飞书消息接收功能
- ✅ 完成飞书消息发送功能
- ✅ 集成知识库搜索（自动从应用工作流获取关联知识库）
- ✅ 使用智谱AI（glm-4-flash）生成回复
- ✅ 添加事件去重机制（防止重复处理）
- ✅ 支持异步消息处理（防止飞书超时）
- ✅ 修复 NodeInputKeyEnum 类型错误
