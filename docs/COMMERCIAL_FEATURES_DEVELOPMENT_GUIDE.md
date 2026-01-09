# FastGPT 商业版功能自行开发规划

## 📋 目录
- [1. 概述](#1-概述)
- [2. 当前开源版与商业版的区别](#2-当前开源版与商业版的区别)
- [3. 商业版API架构说明](#3-商业版api架构说明)
- [4. 已实现的Mock数据](#4-已实现的mock数据)
- [5. 自行开发商业版功能路线图](#5-自行开发商业版功能路线图)
- [6. 快速开始：添加新的商业版功能](#6-快速开始添加新的商业版功能)
- [7. 常见问题和解决方案](#7-常见问题和解决方案)

---

## 1. 概述

本文档旨在帮助开发者理解 FastGPT 的商业版功能架构，并提供自行开发商业版功能的完整指南。

### 1.1 什么是商业版功能？

FastGPT 的商业版功能通过 `proApi` 代理机制实现，主要包括：
- 🏢 **团队协作**: 组织架构、群组管理、成员权限
- 💰 **计费系统**: 账单、充值、优惠券、发票
- 🔐 **高级认证**: OAuth、SSO、微信登录
- 📊 **数据分析**: 审计日志、使用统计
- 🎨 **定制化**: 自定义域名、品牌定制
- 🤖 **AI增强**: 高级模板、智能推荐

### 1.2 二次开发的两种方式

**方式一：使用官方商业版（推荐）**
- 配置 `FastGPT_PRO_URL` 环境变量
- 连接到官方或自建的商业版服务
- 无需修改代码，即插即用

**方式二：自行开发（本文档重点）**
- 在开源版基础上自行实现商业版功能
- 完全掌控功能逻辑和数据
- 适合有定制化需求的团队

---

## 2. 当前开源版与商业版的区别

### 2.1 已通过Mock实现的功能（可直接使用）

| 功能模块 | 说明 | Mock状态 |
|---------|------|---------|
| 团队信息 | 基础团队信息获取 | ✅ 已实现 |
| 团队成员 | 成员列表、管理 | ✅ 已实现 |
| 协作者管理 | 协作者列表、权限 | ✅ 已实现 |
| 组织架构 | 部门管理 | ✅ 已实现 |
| 群组管理 | 群组创建、管理 | ✅ 已实现 |
| 知识库标签 | 标签列表、管理 | ✅ 已实现 |
| 对话设置 | 聊天设置、收藏 | ✅ 已实现 |
| 应用模板分类 | 模板类型列表 | ✅ 已实现（新增）|
| 使用统计 | 基础使用数据 | ✅ 已实现 |
| 审计日志 | 操作日志记录 | ✅ 已实现 |

### 2.2 已禁用的功能（需要真实实现）

| 功能模块 | 说明 | 实现难度 |
|---------|------|---------|
| OAuth登录 | 第三方登录集成 | ⭐⭐⭐ 中等 |
| 微信登录 | 微信扫码登录 | ⭐⭐⭐ 中等 |
| SSO单点登录 | 企业SSO集成 | ⭐⭐⭐⭐ 较难 |
| 在线充值 | 支付系统集成 | ⭐⭐⭐⭐ 较难 |
| 发票系统 | 电子发票管理 | ⭐⭐⭐⭐ 较难 |
| 优惠券系统 | 优惠券发放和使用 | ⭐⭐⭐ 中等 |
| 自定义域名 | 域名绑定和SSL | ⭐⭐⭐⭐⭐ 困难 |
| 外部文件导入 | 外部URL文件导入 | ⭐⭐ 简单 |

---

## 3. 商业版API架构说明

### 3.1 代理机制

```
前端请求 → /api/proApi/[...path] → Mock数据 或 真实商业版服务
```

**关键文件：**
- `projects/app/src/pages/api/proApi/[...path].ts` - 商业版API代理
- `projects/app/src/web/core/app/api/template.ts` - 前端API调用

### 3.2 工作流程

```typescript
// 1. 前端发起请求
const templateTypes = await getTemplateTagList();

// 2. 检查是否为Plus版本
if (useSystemStore.getState()?.feConfigs?.isPlus) {
  // 调用商业版API
  return GET('/proApi/core/app/template/getTemplateTypes');
} else {
  // 返回默认数据
  return Promise.resolve(defaultTemplateTypes);
}

// 3. proApi代理处理
if (!FastGPTProUrl) {
  // 检查是否有Mock数据
  if (mockResponses[apiPath]) {
    return mockData; // 返回Mock数据
  }
  // 返回404错误
  return { code: 404, error: '商业版 API 未配置' };
}
```

### 3.3 配置说明

**环境变量：**
```bash
# .env.local 或 docker-compose 环境变量
FastGPT_PRO_URL=http://your-pro-api-server:port

# 示例：
# FastGPT_PRO_URL=https://api.fastgpt.com
# FastGPT_PRO_URL=http://localhost:4000
```

**前端配置检测：**
```typescript
// 通过 feConfigs.isPlus 判断是否启用商业版功能
const { isPlus } = useSystemStore().feConfigs;
```

---

## 4. 已实现的Mock数据

### 4.1 Mock数据位置

文件：`projects/app/src/pages/api/proApi/[...path].ts`

```typescript
const mockResponses: Record<string, any> = {
  // 团队管理
  'support/user/team/list': { code: 200, data: [] },
  'support/user/team/member/list': { code: 200, data: { total: 0, list: [] } },
  
  // 知识库
  'core/dataset/tag/getAllTags': { code: 200, data: [] },
  'core/dataset/collaborator/list': { code: 200, data: { collaborators: [] } },
  
  // 对话设置
  'core/chat/setting/detail': { code: 200, data: { favourites: [], tags: [] } },
  
  // 应用模板分类（新增）
  'core/app/template/getTemplateTypes': {
    code: 200,
    data: [
      { id: 'all', label: '全部', desc: '全部模板', order: 0 },
      { id: 'chat', label: '对话助手', desc: '对话类应用模板', order: 1 },
      { id: 'knowledge', label: '知识库', desc: '知识库类应用模板', order: 2 },
      { id: 'workflow', label: '工作流', desc: '工作流类应用模板', order: 3 },
      { id: 'tool', label: '工具', desc: '工具类应用模板', order: 4 }
    ]
  }
  
  // ... 更多Mock数据
};
```

### 4.2 禁用功能的Mock响应

```typescript
// 明确禁用的功能返回403
'support/user/account/login/oauth': {
  code: 403,
  data: null,
  message: '开源版不支持 OAuth 登录'
},
'support/wallet/bill/create': {
  code: 403,
  data: null,
  message: '开源版不支持在线充值'
}
```

---

## 5. 自行开发商业版功能路线图

### 5.1 初级阶段（1-2周）

**目标：掌握架构，实现基础功能**

#### 5.1.1 学习和准备
- [ ] 阅读本文档，理解商业版架构
- [ ] 研究 `proApi` 代理机制
- [ ] 了解现有 Mock 数据结构
- [ ] 搭建本地开发环境

#### 5.1.2 实现第一个功能：外部文件导入
**难度：⭐⭐ 简单**

```typescript
// 步骤1：创建API路由
// projects/app/src/pages/api/core/dataset/collection/create/externalFileUrl.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { teamId, tmbId } = await authCert({ req, authToken: true });
    const { fileUrl, datasetId, collectionName } = req.body;

    // 下载外部文件
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(response.data);
    
    // 处理文件导入逻辑
    // ... 调用现有的文件处理函数
    
    jsonRes(res, {
      code: 200,
      data: { collectionId: 'new-collection-id' }
    });
  } catch (error) {
    jsonRes(res, {
      code: 500,
      error
    });
  }
}
```

```typescript
// 步骤2：移除Mock中的禁用
// projects/app/src/pages/api/proApi/[...path].ts

// 删除或修改这一行：
'core/dataset/collection/create/externalFileUrl': {
  code: 403,
  data: null,
  message: '开源版不支持外部文件URL导入'
},

// 改为：
'core/dataset/collection/create/externalFileUrl': {
  code: 200,
  data: { collectionId: 'mock-collection-id' }
},
```

### 5.2 中级阶段（2-4周）

**目标：实现OAuth和社交登录**

#### 5.2.1 OAuth登录集成
**难度：⭐⭐⭐ 中等**

**技术选型：**
- 使用 `next-auth` 或 `passport.js`
- 支持 GitHub、Google、GitLab等

**实现步骤：**

```typescript
// 1. 安装依赖
// pnpm add next-auth

// 2. 创建OAuth配置
// projects/app/src/pages/api/auth/[...nextauth].ts

import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 自定义登录逻辑
      // 创建或查找用户
      return true;
    },
    async jwt({ token, user }) {
      // 添加用户信息到token
      return token;
    },
  },
});

// 3. 更新proApi mock
'support/user/account/login/oauth': {
  code: 200,
  data: {
    user: { id: 'user-id', username: 'oauth-user' },
    token: 'jwt-token'
  }
}
```

#### 5.2.2 微信登录
**难度：⭐⭐⭐ 中等**

```typescript
// 1. 获取微信登录二维码
// projects/app/src/pages/api/support/user/account/login/wx/getQR.ts

import { WxLoginManager } from '@/service/support/user/wx/login';

export default async function handler(req, res) {
  const manager = new WxLoginManager();
  const { qrCodeUrl, loginId } = await manager.generateQRCode();
  
  jsonRes(res, {
    code: 200,
    data: { qrCodeUrl, loginId }
  });
}

// 2. 轮询检查登录结果
// projects/app/src/pages/api/support/user/account/login/wx/getResult.ts

export default async function handler(req, res) {
  const { loginId } = req.query;
  const manager = new WxLoginManager();
  const result = await manager.checkLoginStatus(loginId);
  
  jsonRes(res, {
    code: 200,
    data: result
  });
}
```

### 5.3 高级阶段（4-8周）

**目标：实现计费和支付系统**

#### 5.3.1 支付系统集成
**难度：⭐⭐⭐⭐ 较难**

**技术选型：**
- 支付宝支付
- 微信支付
- Stripe（国际支付）

```typescript
// 1. 创建订单
// projects/app/src/pages/api/support/wallet/bill/create.ts

import { AlipayService } from '@/service/support/wallet/alipay';
import { WechatPayService } from '@/service/support/wallet/wechat';

export default async function handler(req, res) {
  const { amount, paymentMethod } = req.body;
  const { teamId } = await authCert({ req, authToken: true });
  
  let paymentUrl;
  
  if (paymentMethod === 'alipay') {
    const alipay = new AlipayService();
    paymentUrl = await alipay.createOrder({ amount, teamId });
  } else if (paymentMethod === 'wechat') {
    const wechat = new WechatPayService();
    paymentUrl = await wechat.createOrder({ amount, teamId });
  }
  
  jsonRes(res, {
    code: 200,
    data: { paymentUrl, orderId: 'order-id' }
  });
}

// 2. 支付回调
// projects/app/src/pages/api/support/wallet/bill/pay/callback.ts

export default async function handler(req, res) {
  const { orderId, status } = req.body;
  
  // 验证支付签名
  // 更新订单状态
  // 充值用户余额
  
  res.status(200).send('success');
}

// 3. 查询支付结果
// projects/app/src/pages/api/support/wallet/bill/pay/checkPayResult.ts

export default async function handler(req, res) {
  const { orderId } = req.query;
  
  // 查询订单状态
  const order = await getOrderById(orderId);
  
  jsonRes(res, {
    code: 200,
    data: { status: order.status }
  });
}
```

#### 5.3.2 发票系统
**难度：⭐⭐⭐⭐ 较难**

```typescript
// 1. 提交发票申请
// projects/app/src/pages/api/support/wallet/bill/invoice/submit.ts

export default async function handler(req, res) {
  const { billIds, invoiceHeader, taxNumber, email } = req.body;
  
  // 生成发票
  const invoice = await generateInvoice({
    billIds,
    invoiceHeader,
    taxNumber
  });
  
  // 发送邮件
  await sendInvoiceEmail(email, invoice);
  
  jsonRes(res, {
    code: 200,
    data: { invoiceId: invoice.id }
  });
}
```

### 5.4 专家阶段（8-12周）

**目标：实现企业级功能**

#### 5.4.1 SSO单点登录
**难度：⭐⭐⭐⭐ 较难**

**支持协议：**
- SAML 2.0
- OAuth 2.0 / OpenID Connect
- CAS

```typescript
// 1. SAML配置
// projects/app/src/service/support/user/sso/saml.ts

import saml2 from 'saml2-js';

export class SAMLService {
  private sp: any;
  
  constructor() {
    this.sp = new saml2.ServiceProvider({
      entity_id: process.env.SAML_ENTITY_ID,
      private_key: process.env.SAML_PRIVATE_KEY,
      certificate: process.env.SAML_CERTIFICATE,
      assert_endpoint: `${process.env.SITE_URL}/api/auth/saml/callback`,
    });
  }
  
  async getLoginUrl(idpUrl: string) {
    const idp = new saml2.IdentityProvider({
      sso_login_url: idpUrl,
      certificates: [process.env.IDP_CERTIFICATE],
    });
    
    return this.sp.create_login_request_url(idp, {});
  }
  
  async handleCallback(samlResponse: string) {
    // 验证SAML响应
    // 提取用户信息
    // 创建或更新用户
    return { user, token };
  }
}
```

#### 5.4.2 自定义域名
**难度：⭐⭐⭐⭐⭐ 困难**

```typescript
// 1. 域名DNS验证
// projects/app/src/pages/api/support/customDomain/checkDNSResolve.ts

import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

export default async function handler(req, res) {
  const { domain, verifyCode } = req.body;
  
  try {
    // 检查DNS TXT记录
    const txtRecords = await resolveTxt(domain);
    const verified = txtRecords.some(record => 
      record.includes(`fastgpt-verify=${verifyCode}`)
    );
    
    if (verified) {
      // 配置SSL证书（使用Let's Encrypt）
      await setupSSL(domain);
    }
    
    jsonRes(res, {
      code: 200,
      data: { verified, message: verified ? '验证成功' : 'DNS记录未找到' }
    });
  } catch (error) {
    jsonRes(res, {
      code: 500,
      error: '域名验证失败'
    });
  }
}

// 2. SSL证书配置
async function setupSSL(domain: string) {
  // 使用acme.js或certbot
  // 自动申请和更新SSL证书
}
```

---

## 6. 快速开始：添加新的商业版功能

### 6.1 标准开发流程

```bash
# 1. 确定功能和API路径
API路径: /proApi/your/feature/path

# 2. 添加Mock数据（用于测试）
编辑: projects/app/src/pages/api/proApi/[...path].ts

# 3. 创建真实API实现
创建: projects/app/src/pages/api/your/feature/path.ts

# 4. 测试功能
测试Mock: 不配置 FastGPT_PRO_URL
测试真实API: 配置 FastGPT_PRO_URL 指向本地

# 5. 部署上线
更新环境变量，重启服务
```

### 6.2 示例：添加"用户偏好设置"功能

```typescript
// 步骤1：添加Mock数据
// projects/app/src/pages/api/proApi/[...path].ts

const mockResponses = {
  // ... 现有mock
  
  'support/user/preference/get': {
    code: 200,
    data: {
      theme: 'light',
      language: 'zh-CN',
      notifications: true
    }
  },
  
  'support/user/preference/update': {
    code: 200,
    data: null
  }
};

// 步骤2：创建API实现
// projects/app/src/pages/api/support/user/preference/get.ts

import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoUserPreference } from '@/service/support/user/preferenceSchema';

export default async function handler(req, res) {
  const { userId } = await authCert({ req, authToken: true });
  
  const preference = await MongoUserPreference.findOne({ userId });
  
  jsonRes(res, {
    code: 200,
    data: preference || { theme: 'light', language: 'zh-CN' }
  });
}

// 步骤3：创建Schema
// projects/app/src/service/support/user/preferenceSchema.ts

import { Schema, model } from 'mongoose';

const UserPreferenceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
  theme: { type: String, default: 'light' },
  language: { type: String, default: 'zh-CN' },
  notifications: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

export const MongoUserPreference = 
  model('user_preference', UserPreferenceSchema);

// 步骤4：前端调用
// projects/app/src/web/support/user/api.ts

export const getUserPreference = () => 
  GET('/proApi/support/user/preference/get');

export const updateUserPreference = (data: any) =>
  POST('/proApi/support/user/preference/update', data);
```

---

## 7. 常见问题和解决方案

### 7.1 "商业版 API 未配置" 错误

**问题：** 访问某个功能时提示"商业版 API 未配置: xxx/xxx/xxx"

**解决方案：**

1. **添加Mock数据（推荐用于开发）**
   ```typescript
   // 编辑 projects/app/src/pages/api/proApi/[...path].ts
   const mockResponses = {
     'your/api/path': {
       code: 200,
       data: { /* 你的mock数据 */ }
     }
   };
   ```

2. **实现真实API**
   ```bash
   # 创建API文件
   projects/app/src/pages/api/your/api/path.ts
   
   # 实现业务逻辑
   export default async function handler(req, res) {
     // 你的实现
   }
   ```

3. **配置商业版URL（临时方案）**
   ```bash
   # .env.local
   FastGPT_PRO_URL=http://localhost:3000
   ```

### 7.2 Mock数据不生效

**检查清单：**
- [ ] Mock路径是否正确（不包含 `/proApi/` 前缀）
- [ ] 是否配置了 `FastGPT_PRO_URL`（配置后会跳过Mock）
- [ ] 是否重启了开发服务器
- [ ] 浏览器是否缓存了旧数据

### 7.3 如何调试商业版API

```typescript
// 在 proApi/[...path].ts 中添加调试日志

export default async function handler(req, res) {
  const apiPath = path?.join('/');
  
  console.log('📝 [proApi Debug]', {
    apiPath,
    hasMock: !!mockResponses[apiPath],
    hasProUrl: !!FastGPTProUrl,
    method: req.method
  });
  
  // 原有逻辑...
}
```

### 7.4 数据库Schema设计建议

```typescript
// 推荐的Schema结构

import { Schema, model } from 'mongoose';

const YourSchema = new Schema({
  // 基础字段
  userId: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    ref: 'user',
    index: true // 添加索引提升查询性能
  },
  teamId: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    ref: 'team',
    index: true
  },
  
  // 业务字段
  name: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'deleted'],
    default: 'active'
  },
  
  // 元数据
  metadata: { type: Schema.Types.Mixed, default: {} },
  
  // 时间戳
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true, // 自动管理 createdAt 和 updatedAt
  versionKey: false
});

// 添加索引
YourSchema.index({ userId: 1, teamId: 1 });

export const MongoYourModel = model('your_collection', YourSchema);
```

### 7.5 性能优化建议

1. **使用数据库索引**
   ```typescript
   Schema.index({ userId: 1, createdAt: -1 });
   ```

2. **实现分页**
   ```typescript
   const page = parseInt(req.query.page) || 1;
   const pageSize = parseInt(req.query.pageSize) || 20;
   
   const list = await Model.find(query)
     .skip((page - 1) * pageSize)
     .limit(pageSize);
   ```

3. **使用缓存**
   ```typescript
   import { redis } from '@/service/common/redis';
   
   const cacheKey = `user:${userId}:preference`;
   const cached = await redis.get(cacheKey);
   
   if (cached) return JSON.parse(cached);
   
   const data = await fetchFromDB();
   await redis.set(cacheKey, JSON.stringify(data), 'EX', 3600);
   ```

---

## 8. 实战案例

### 8.1 案例1：实现简单的优惠券系统

```typescript
// 1. Schema定义
// projects/app/src/service/support/wallet/couponSchema.ts

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['discount', 'fixed'], required: true },
  value: { type: Number, required: true },
  minAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  expiresAt: { type: Date, required: true },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

export const MongoCoupon = model('coupon', CouponSchema);

// 2. 兑换接口
// projects/app/src/pages/api/support/wallet/coupon/redeem.ts

export default async function handler(req, res) {
  const { code } = req.body;
  const { userId } = await authCert({ req, authToken: true });
  
  const coupon = await MongoCoupon.findOne({ 
    code, 
    status: 'active',
    expiresAt: { $gt: new Date() },
    $expr: { $lt: ['$usedCount', '$usageLimit'] }
  });
  
  if (!coupon) {
    return jsonRes(res, {
      code: 400,
      error: '优惠券无效或已过期'
    });
  }
  
  // 创建用户优惠券记录
  await MongoUserCoupon.create({
    userId,
    couponId: coupon._id,
    code: coupon.code,
    value: coupon.value
  });
  
  // 更新使用次数
  coupon.usedCount += 1;
  await coupon.save();
  
  jsonRes(res, {
    code: 200,
    data: { message: '兑换成功', coupon }
  });
}

// 3. 更新Mock
const mockResponses = {
  'support/wallet/coupon/redeem': {
    code: 200,
    data: { 
      message: '兑换成功',
      coupon: { code: 'WELCOME100', value: 100 }
    }
  }
};
```

### 8.2 案例2：实现审计日志

```typescript
// 1. Schema
const AuditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user' },
  teamId: { type: Schema.Types.ObjectId, ref: 'team' },
  action: { type: String, required: true },
  resourceType: { type: String, required: true },
  resourceId: { type: String },
  details: { type: Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
});

export const MongoAuditLog = model('audit_log', AuditLogSchema);

// 2. 日志记录中间件
export async function logAudit(params: {
  userId: string;
  teamId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
  req: NextApiRequest;
}) {
  await MongoAuditLog.create({
    ...params,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent']
  });
}

// 3. 使用示例
export default async function handler(req, res) {
  const { userId, teamId } = await authCert({ req, authToken: true });
  
  // 执行业务逻辑
  const app = await createApp(data);
  
  // 记录日志
  await logAudit({
    userId,
    teamId,
    action: 'app.create',
    resourceType: 'app',
    resourceId: app._id,
    details: { name: app.name },
    req
  });
  
  jsonRes(res, { code: 200, data: app });
}
```

---

## 9. 测试和部署

### 9.1 本地测试

```bash
# 1. 测试Mock数据
unset FastGPT_PRO_URL
pnpm dev

# 2. 测试真实API
export FastGPT_PRO_URL=http://localhost:3000
pnpm dev

# 3. 查看日志
tail -f fastgpt.log | grep proApi
```

### 9.2 生产部署

```bash
# docker-compose.yml

services:
  fastgpt:
    environment:
      # 不配置 PRO_URL，使用自己实现的功能
      # PRO_URL: ""
      
      # 或配置为内部服务
      # PRO_URL: http://fastgpt-pro:4000
      
      MONGODB_URI: mongodb://mongo:27017/fastgpt
      REDIS_URL: redis://redis:6379
```

### 9.3 性能监控

```typescript
// 添加性能监控
import { performance } from 'perf_hooks';

export default async function handler(req, res) {
  const start = performance.now();
  
  try {
    // 业务逻辑
    const result = await businessLogic();
    
    const duration = performance.now() - start;
    console.log(`[Performance] API ${req.url} took ${duration}ms`);
    
    jsonRes(res, { code: 200, data: result });
  } catch (error) {
    console.error(`[Error] API ${req.url} failed:`, error);
    jsonRes(res, { code: 500, error });
  }
}
```

---

## 10. 总结和下一步

### 10.1 开发优先级建议

**第一优先级（核心功能）：**
1. ✅ 外部文件导入
2. ✅ 用户偏好设置
3. ✅ 审计日志
4. ✅ 基础统计

**第二优先级（增强功能）：**
1. OAuth登录
2. 微信登录
3. 优惠券系统
4. 邮件通知

**第三优先级（高级功能）：**
1. 支付系统
2. 发票系统
3. SSO登录
4. 自定义域名

### 10.2 学习资源

- **FastGPT官方文档**: https://doc.fastgpt.in
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction
- **Mongoose文档**: https://mongoosejs.com/docs/
- **支付集成文档**:
  - 支付宝: https://opendocs.alipay.com/
  - 微信支付: https://pay.weixin.qq.com/wiki/doc/api/
  - Stripe: https://stripe.com/docs

### 10.3 社区和支持

- GitHub Issues: 提问和报告Bug
- Discord/Slack: 实时交流
- 技术博客: 分享开发经验

---

## 11. 附录

### 11.1 完整的Mock API列表

详见文件：`projects/app/src/pages/api/proApi/[...path].ts`

目前已实现Mock的API数量：**80+**

### 11.2 数据库Schema规范

```typescript
// 命名规范
集合名: 小写+下划线，如 user_preference
字段名: 驼峰命名，如 userId, createdAt

// 必需字段
- _id: ObjectId（自动生成）
- createdAt: Date
- updatedAt: Date

// 推荐字段
- status: String (active/inactive/deleted)
- metadata: Mixed (扩展字段)
```

### 11.3 API响应格式规范

```typescript
// 成功响应
{
  code: 200,
  data: { /* 业务数据 */ }
}

// 错误响应
{
  code: 400/403/404/500,
  error: '错误信息' | { message: '错误信息', details: {} }
}

// 列表响应
{
  code: 200,
  data: {
    total: 100,
    list: [/* 数据列表 */],
    page: 1,
    pageSize: 20
  }
}
```

---

## 更新日志

- **2026-01-09**: 初始版本，添加模板分类Mock数据
- 后续版本将持续更新...

---

## 贡献

欢迎贡献更多的商业版功能实现案例！

**提交方式：**
1. Fork项目
2. 创建功能分支
3. 提交Pull Request
4. 更新本文档

---

**祝开发顺利！🚀**
