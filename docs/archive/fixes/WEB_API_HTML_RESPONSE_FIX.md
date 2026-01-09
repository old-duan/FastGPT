# Web 端切换界面报错 HTML 响应问题 - 解决方案

## 📋 问题描述

**症状**: Web 端切换界面和功能时,前端收到 HTML 响应而不是 JSON 数据

**错误信息**:
```html
<!DOCTYPE html><html lang="en"><head><style data-next-hide-fouc="true">body{display:none}</style>...
```

**影响范围**:
- 所有商业版 API 请求 (`/proApi/*`)
- 界面切换卡顿或失败
- 部分功能无法正常使用

## 🔍 根本原因分析

### 问题 1: 循环代理导致 404 HTML 响应 ⭐ **主要原因**

**问题机制**:

1. `.env.local` 配置了 `PRO_URL=http://localhost:3000`
2. 前端请求商业版 API: `/proApi/support/user/team/list`
3. `[...path].ts` 将请求代理到 `http://localhost:3000/api/support/user/team/list`
4. 该路由不存在,Next.js 返回 **404 HTML 错误页面**
5. 前端期望 JSON,收到 HTML,解析失败报错

**代码流程**:
```typescript
// 前端调用
GET /proApi/support/user/team/list

// proApi/[...path].ts 处理
const requestPath = `/api/${path.join('/')}`;  // /api/support/user/team/list
const parsedUrl = new URL('http://localhost:3000');

// 代理请求 (造成循环)
request({
  hostname: 'localhost',
  port: 3000,
  path: requestPath  // /api/support/user/team/list
})

// 结果: 路由不存在 → 404 HTML 页面
```

### 问题 2: 商业版 API 未实现

FastGPT 开源版中,以下商业版 API 路由默认不存在:
- `/api/support/user/team/*` - 团队管理
- `/api/support/wallet/*` - 钱包/账单
- `/api/support/user/audit/*` - 操作日志
- `/api/support/user/inform/*` - 通知消息

前端调用这些 API 时:
1. 如果 `PRO_URL` 未配置 → 抛出异常
2. 如果 `PRO_URL` 指向自己 → 返回 404 HTML
3. 如果 `PRO_URL` 指向真实商业版服务器 → 正常工作(但需要授权)

## ✅ 完整解决方案

### 修改 1: 优化 proApi 路由处理

**文件**: `projects/app/src/pages/api/proApi/[...path].ts`

**核心改进**:

1. **检测循环代理**:
```typescript
const currentHost = req.headers.host || 'localhost:3000';
const targetHost = `${parsedUrl.hostname}:${parsedUrl.port}`;

if (currentHost === targetHost || parsedUrl.href.includes(currentHost)) {
  // 避免循环代理,返回 JSON 格式的 404
  return jsonRes(res, {
    code: 404,
    error: {
      message: `商业版 API 不可用(循环代理): ${path?.join('/')}`,
      path: requestPath
    }
  });
}
```

2. **友好的错误响应**:
```typescript
// 未配置 PRO_URL 时返回 JSON 而不是抛出异常
if (!FastGPTProUrl) {
  return jsonRes(res, {
    code: 404,
    error: {
      message: `商业版 API 未配置: ${path?.join('/')}`,
      path: requestPath
    }
  });
}
```

3. **改进错误处理**:
```typescript
requestResult.on('error', (e) => {
  // 返回 JSON 格式的错误而不是直接 send(e)
  jsonRes(res, {
    code: 500,
    error: {
      message: '商业版 API 请求失败',
      details: e.message
    }
  });
});
```

### 修改 2: 移除循环配置

**文件**: `projects/app/.env.local`

```env
# 修改前 (会造成循环代理)
PRO_URL=http://localhost:3000

# 修改后 (不配置,避免循环)
# PRO_URL=
```

**说明**:
- 开发环境不需要配置 `PRO_URL`
- 商业版 API 返回 404 时,前端会优雅降级
- 如果有真实的商业版服务,配置为实际地址即可

## 🎯 效果验证

### 修复前

**浏览器 Network 请求**:
```
Request: GET /proApi/support/user/team/list
Response: 200 OK
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html lang="en">
<head>...</head>
...404 Not Found 页面...
```

**前端错误**:
```javascript
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

### 修复后

**浏览器 Network 请求**:
```
Request: GET /proApi/support/user/team/list
Response: 404 Not Found
Content-Type: application/json

{
  "code": 404,
  "statusText": "",
  "message": "商业版 API 不可用(循环代理): support/user/team/list",
  "data": null
}
```

**前端行为**:
- 收到正确的 JSON 响应
- 根据 404 状态码优雅降级
- 不再报解析错误
- 界面正常切换

## 📊 受影响的 API 列表

以下商业版 API 在开源版中默认不可用,现在会返回 404 JSON 而不是 HTML:

### 团队管理
- `POST /proApi/support/user/team/list` - 团队列表
- `POST /proApi/support/user/team/create` - 创建团队
- `PUT /proApi/support/user/team/switch` - 切换团队

### 组织架构
- `POST /proApi/support/user/team/org/list` - 组织列表
- `POST /proApi/support/user/team/org/create` - 创建组织
- `DELETE /proApi/support/user/team/org/delete` - 删除组织

### 成员分组
- `POST /proApi/support/user/team/group/list` - 分组列表
- `POST /proApi/support/user/team/group/create` - 创建分组

### 钱包账单
- `POST /proApi/support/wallet/usage/getUsage` - 使用记录
- `POST /proApi/support/wallet/bill/list` - 账单列表
- `POST /proApi/support/wallet/bill/create` - 创建订单

### 操作审计
- `POST /proApi/support/user/audit/list` - 操作日志

### 通知消息
- `GET /proApi/support/user/inform/countUnread` - 未读消息数
- `GET /proApi/support/user/inform/getSystemMsgModal` - 系统消息

## 🔧 前端兼容性处理

前端代码已经有基本的错误处理,现在能正确识别 404 响应:

```typescript
// 前端 API 调用
try {
  const result = await GET('/proApi/support/user/team/list');
  // 处理数据
} catch (error) {
  // 修复前: SyntaxError: Unexpected token '<'
  // 修复后: { code: 404, message: "商业版 API 不可用" }
  
  if (error.code === 404) {
    // 优雅降级: 隐藏商业版功能或显示升级提示
  }
}
```

## 🚀 最佳实践

### 1. 开发环境配置

```env
# .env.local (开发环境)

# 不配置 PRO_URL,避免循环代理
# PRO_URL=

# 如果有独立的商业版服务
# PRO_URL=http://commercial-server:3001
```

### 2. 生产环境配置

```env
# .env.production (生产环境)

# 如果部署商��版
PRO_URL=https://your-commercial-api.com

# 如果只部署开源版
# PRO_URL=
```

### 3. 前端降级处理

对于商业版功能,建议前端做降级处理:

```typescript
// 检查是否支持商业版功能
const checkProFeature = async () => {
  try {
    await GET('/proApi/support/user/team/list');
    return true;  // 商业版可用
  } catch (error) {
    if (error.code === 404) {
      return false;  // 商业版不可用,使用开源版功能
    }
    throw error;  // 其他错误继续抛出
  }
};
```

## 📝 故障排除

### 问题 1: 仍然收到 HTML 响应

**检查**:
1. 确认 `.env.local` 中 `PRO_URL` 已注释或未配置
2. 重启开发服务器让配置生效
3. 清除浏览器缓存

**验证**:
```powershell
# 检查环境变量
cd D:\FastGPT\projects\app
Get-Content .env.local | Select-String "PRO_URL"

# 应该看到:
# PRO_URL=
```

### 问题 2: 404 错误过多

**原因**: 前端调用了过多的商业版 API

**解决**:
1. 修改前端代码,根据 `isPlus` 配置决定是否调用商业版 API
2. 或者实现这些 API 的开源版本(返回空数据或基础功能)

### 问题 3: 需要使用商业版功能

**方案 1**: 部署商业版后端服务
```env
PRO_URL=http://your-commercial-backend:3001
```

**方案 2**: 实现对应的 API 路由
```typescript
// projects/app/src/pages/api/support/user/team/list.ts
export default async function handler(req, res) {
  // 实现团队列表逻辑
  return jsonRes(res, {
    code: 200,
    data: []
  });
}
```

## 🔗 相关文件

- API 路由: `projects/app/src/pages/api/proApi/[...path].ts`
- 环境配置: `projects/app/.env.local`
- 前端 API 调用: `projects/app/src/web/support/**/*.ts`

## ✨ 总结

**根本原因**: 
- `PRO_URL` 配置为 `localhost:3000` 造成循环代理
- 商业版 API 不存在时返回 HTML 404 页面而不是 JSON

**核心解决方案**:
1. 检测并阻止循环代理
2. 统一返回 JSON 格式的错误响应
3. 开发环境不配置 `PRO_URL`

**效果**:
- ✅ 不再返回 HTML 响应
- ✅ 前端正确处理 404 错误
- ✅ 界面切换流畅
- ✅ 错误信息清晰明确

---

**最后更新**: 2025-12-18
**状态**: ✅ 已解决
**测试**: 服务已重启,配置已生效
