# 商业版API Mock解决方案

## 问题解决状态

✅ **已实施Mock方案** - 2025-12-19

## 修改内容

### 修改的文件

**文件**: `projects/app/src/pages/api/proApi/[...path].ts`

**备份位置**: `projects/app/src/pages/api/proApi/[...path].ts.backup`

### 修改说明

为开源版本的FastGPT添加了商业版API的Mock支持,避免在未配置商业版服务器时出现大量404错误。

#### 添加的Mock数据

```typescript
const mockResponses: Record<string, any> = {
  // 协作者管理 - 返回空列表
  'core/dataset/collaborator/list': { code: 200, data: { collaborators: [] } },
  
  // 标签管理 - 返回空列表  
  'core/dataset/tag/getAllTags': { code: 200, data: { list: [] } },
  'core/dataset/tag/list': { code: 200, data: { total: 0, list: [] } },
  'core/dataset/tag/tagUsage': { code: 200, data: [] },
  
  // 系统消息 - 无消息
  'support/user/inform/getSystemMsgModal': { code: 200, data: { hasMsg: false } },
  
  // 运营广告 - 无广告
  'support/user/inform/getOperationalAd': { code: 200, data: { hasAd: false } },
  
  // 团队标签 - 空列表
  'support/user/team/tag/list': { code: 200, data: [] },
  
  // 团队套餐 - 空列表
  'support/user/team/plan/getTeamPlans': { code: 200, data: [] }
};
```

#### 修改的逻辑

**之前**:
```typescript
if (!FastGPTProUrl) {
  return jsonRes(res, {
    code: 404,
    error: { message: `商业版 API 未配置: ${path}` }
  });
}
```

**现在**:
```typescript
if (!FastGPTProUrl) {
  // 先尝试返回mock数据
  if (mockResponses[apiPath]) {
    console.log(`[proApi Mock] 返回mock数据: ${apiPath}`);
    return jsonRes(res, mockResponses[apiPath]);
  }
  
  // 没有mock数据才返回404
  return jsonRes(res, {
    code: 404,
    error: {
      message: `商业版 API 未配置: ${apiPath}`,
      tip: '部分高级功能需要商业版支持。'
    }
  });
}
```

## 预期效果

### 修改前

```
[Error] 商业版 API 未配置: core/dataset/tag/getAllTags
[Error] 商业版 API 未配置: core/dataset/collaborator/list
[Error] 商业版 API 未配置: support/user/inform/getSystemMsgModal
GET /api/proApi/core/dataset/tag/getAllTags 500
GET /api/proApi/core/dataset/collaborator/list 500
GET /api/proApi/support/user/inform/getSystemMsgModal 500
```

- ❌ 控制台大量错误信息
- ❌ 用户心理压力大
- ❌ 误以为功能不可用

### 修改后

```
[proApi Mock] 返回mock数据: core/dataset/tag/getAllTags
[proApi Mock] 返回mock数据: core/dataset/collaborator/list
[proApi Mock] 返回mock数据: support/user/inform/getSystemMsgModal
GET /api/proApi/core/dataset/tag/getAllTags 200
GET /api/proApi/core/dataset/collaborator/list 200
GET /api/proApi/support/user/inform/getSystemMsgModal 200
```

- ✅ 不再有404错误
- ✅ API正常返回(空数据)
- ✅ 用户体验良好
- ✅ Web站点同步正常工作

## 功能影响

### 不受影响的功能 (✅ 完全可用)

- ✅ Web站点同步 - 核心功能完全正常
- ✅ 数据集管理 - 创建/编辑/删除
- ✅ 集合管理 - 文件上传/Web爬取
- ✅ 数据查询 - 向量检索
- ✅ AI对话 - 所有对话功能
- ✅ 工作流 - 完整功能
- ✅ 应用发布 - API/分享链接

### 受限的功能 (⚠️ 显示为空)

- ⚠️ 协作者管理 - 显示为空列表
- ⚠️ 标签管理 - 显示为空列表
- ⚠️ 系统消息 - 不显示通知
- ⚠️ 运营广告 - 不显示广告
- ⚠️ 团队套餐 - 不显示套餐信息

### 注意事项

这些受限功能在开源版本中本来就不应该使用,Mock只是避免错误提示,不会影响实际使用体验。

## 如何验证修改生效

### 1. 重启服务

当前FastGPT正在运行中,需要重启才能应用修改:

```powershell
# 在运行pnpm dev的终端按 Ctrl+C 停止
# 然后重新启动
cd D:\FastGPT\projects\app
pnpm dev
```

### 2. 测试步骤

1. **打开知识库列表页**
   - 访问: http://localhost:3000/dataset/list
   - 检查控制台是否还有404错误

2. **打开知识库详情页**
   - 访问任意知识库详情
   - 检查是否还有商业版API错误

3. **创建Web站点知识库**
   - 点击"新建知识库" → "Web站点"
   - 输入URL: https://example.com
   - 点击"开始同步"
   - 观察是否有错误

4. **检查控制台日志**
   - 应该看到: `[proApi Mock] 返回mock数据: ...`
   - 不应该看到: `[Error] 商业版 API 未配置: ...`

### 3. 预期结果

**浏览器控制台**:
```
GET /api/proApi/core/dataset/tag/getAllTags?datasetId=xxx 200
GET /api/proApi/core/dataset/collaborator/list?datasetId=xxx 200
GET /api/proApi/support/user/inform/getSystemMsgModal 200
```

**服务端日志**:
```
[proApi Mock] 返回mock数据: core/dataset/tag/getAllTags
[proApi Mock] 返回mock数据: core/dataset/collaborator/list  
[proApi Mock] 返回mock数据: support/user/inform/getSystemMsgModal
```

## 如何回滚

如果出现问题,可以恢复原文件:

```powershell
cd D:\FastGPT
Copy-Item "projects\app\src\pages\api\proApi\[...path].ts.backup" `
  "projects\app\src\pages\api\proApi\[...path].ts" -Force
```

然后重启服务即可。

## 后续优化建议

### 1. 添加环境变量开关

可以添加一个环境变量控制是否启用Mock:

```typescript
const enableMock = process.env.ENABLE_PRO_API_MOCK !== 'false'; // 默认启用

if (!FastGPTProUrl && enableMock && mockResponses[apiPath]) {
  return jsonRes(res, mockResponses[apiPath]);
}
```

### 2. 完善Mock数据

根据实际使用情况,添加更多Mock响应:

```typescript
// 示例: 组织管理
'support/user/team/org/list': {
  code: 200,
  data: {
    total: 0,
    list: []
  }
}
```

### 3. 添加日志开关

在生产环境可以关闭Mock日志:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log(`[proApi Mock] 返回mock数据: ${apiPath}`);
}
```

## 相关文档

- [商业版API深度分析](./COMMERCIAL_API_ANALYSIS.md) - 完整的问题分析和其他解决方案
- [原始错误日志](./COMMERCIAL_API_ANALYSIS.md#错误日志) - 修改前的错误情况

## 修改记录

| 日期 | 修改内容 | 修改人 |
|-----|---------|--------|
| 2025-12-19 | 初始实施Mock方案 | GitHub Copilot |
| 2025-12-19 | 创建文档 | GitHub Copilot |

---

**文件状态**: ✅ 已实施  
**测试状态**: ⏳ 待重启验证  
**生产状态**: ⏳ 待确认
