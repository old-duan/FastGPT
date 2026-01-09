# FastGPT 项目架构分析与商业版开发计划

## 📊 项目现状分析

### 1. 项目性质判断

**结论：这是 FastGPT 社区开源版（Community Edition），不包含商业版完整代码**

#### 1.1 证据分析

✅ **开源协议确认**
- 项目遵循 Apache License 2.0 附加条件
- LICENSE 明确说明："FastGPT 社区版将保留核心功能，商业版仅在社区版基础上使用 API 的形式进行扩展"

✅ **代码架构特征**
```
FastGPT 架构模式:
┌─────────────────────────────────────┐
│   前端/开源版 (Community Edition)    │
│                                     │
│  packages/                          │
│  ├── web/       前端组件库          │
│  ├── global/    全局类型定义        │
│  └── service/   核心业务逻辑        │
│                                     │
│  projects/app/  主应用              │
│                                     │
│  ↓ 通过 proApi 代理请求             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   商业版服务 (PRO Edition)           │
│   - 团队协作高级功能                 │
│   - 计费系统                        │
│   - OAuth/SSO                       │
│   - 自定义域名                      │
│   - 等...                           │
└─────────────────────────────────────┘
```

✅ **isPlus 标志位**
- 代码中大量 `feConfigs.isPlus` 检查
- 用于判断是否启用商业版功能
- 默认值: `false`（开源版）

✅ **proApi 代理机制**
```typescript
// projects/app/src/pages/api/proApi/[...path].ts
// 这是商业版API的代理层，不包含实际实现

if (!FastGPTProUrl) {
  // 没有配置商业版URL时，使用Mock数据
  return mockResponse;
}
// 否则转发到真实的商业版服务
```

### 1.2 当前项目包含的内容

✅ **完整包含：**
1. ✅ 核心对话引擎
2. ✅ 知识库管理
3. ✅ 工作流编排
4. ✅ 插件系统
5. ✅ 基础团队管理
6. ✅ 用户认证（用户名密码）
7. ✅ API 接口
8. ✅ 可视化界面

⚠️ **通过Mock实现（无真实逻辑）：**
1. ⚠️ 高级团队协作（组织架构、群组）
2. ⚠️ 计费系统（充值、账单、发票）
3. ⚠️ OAuth/微信登录
4. ⚠️ SSO单点登录
5. ⚠️ 自定义域名
6. ⚠️ 优惠券系统
7. ⚠️ 审计日志
8. ⚠️ 数据统计分析

❌ **完全不包含：**
- ❌ 商业版服务端完整实现
- ❌ 支付系统底层代码
- ❌ 第三方登录集成代码
- ❌ 企业级SSO实现
- ❌ 自定义域名管理系统

---

## 🎯 开发策略建议

### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **方案A：购买官方商业版** | • 即插即用<br>• 官方支持<br>• 持续更新<br>• 功能完整 | • 需要付费<br>• 依赖官方服务 | • 企业级应用<br>• 需要全功能<br>• 预算充足 |
| **方案B：在开源版基础上自行开发** | • 完全掌控<br>• 灵活定制<br>• 无持续费用 | • 开发工作量大<br>• 需要技术团队<br>• 维护成本高 | • 有开发能力<br>• 特殊需求<br>• 长期项目 |
| **方案C：混合模式** | • 核心自研<br>• 非核心外包<br>• 成本可控 | • 架构复杂<br>• 集成难度大 | • 部分功能自研<br>• 其他购买服务 |

### 推荐方案：**方案B + 渐进式开发**

**理由：**
1. ✅ 你已经有完整的开源版代码
2. ✅ 项目架构支持逐步添加功能
3. ✅ Mock层已经定义好接口规范
4. ✅ 可以根据实际需求逐步实现

---

## 📅 详细开发计划

### Phase 1: 基础设施完善（2-3周）

#### 1.1 环境配置和架构理解
**时间：** 3天

**任务：**
- [ ] 深入理解 proApi 代理机制
- [ ] 分析现有 Mock 数据结构
- [ ] 搭建完整的开发环境
- [ ] 配置数据库和 Redis
- [ ] 理解 Monorepo 项目结构

**产出：**
- 环境配置文档
- 架构理解文档
- 开发规范文档

#### 1.2 数据库Schema设计
**时间：** 4天

**任务：**
```typescript
// 新增Schema设计

1. 用户偏好设置 (UserPreference)
   - userId: ObjectId
   - theme: String
   - language: String
   - notifications: Boolean
   
2. 审计日志 (AuditLog)
   - userId: ObjectId
   - teamId: ObjectId
   - action: String
   - resourceType: String
   - resourceId: String
   - details: Mixed
   - ip: String
   - userAgent: String
   - createdAt: Date

3. 第三方登录绑定 (OAuthBinding)
   - userId: ObjectId
   - provider: String (github/google/wechat)
   - providerId: String
   - providerData: Mixed
   
4. 优惠券 (Coupon)
   - code: String
   - type: String (discount/fixed)
   - value: Number
   - expiresAt: Date
   - usageLimit: Number
   - usedCount: Number

5. 用户优惠券 (UserCoupon)
   - userId: ObjectId
   - couponId: ObjectId
   - usedAt: Date
   - orderId: String
```

**产出：**
- 完整的数据库Schema定义
- Migration脚本
- Schema测试代码

#### 1.3 API接口规划
**时间：** 3天

**任务：**
- [ ] 梳理所有需要实现的API（80+接口）
- [ ] 设计RESTful API规范
- [ ] 定义请求/响应格式
- [ ] 制定错误码规范
- [ ] 编写API文档

**产出：**
- API接口文档（Swagger/OpenAPI）
- 接口优先级列表
- 开发任务拆分

---

### Phase 2: 核心功能实现（4-6周）

#### 2.1 用户偏好和基础功能（1周）
**优先级：P0 - 必须**

**功能列表：**
1. ✅ 用户偏好设置
   - 主题切换（亮/暗）
   - 语言设置
   - 通知设置
   
2. ✅ 审计日志
   - 操作记录
   - 日志查询
   - 日志导出

**技术实现：**
```typescript
// 1. API实现
projects/app/src/pages/api/support/user/preference/
├── get.ts        // GET /api/support/user/preference/get
├── update.ts     // POST /api/support/user/preference/update

// 2. Schema
packages/service/support/user/preference/
├── schema.ts     // Mongoose Schema
├── controller.ts // 业务逻辑

// 3. 前端集成
packages/web/support/user/
├── api.ts        // API调用
├── hooks.ts      // React Hooks
```

**验收标准：**
- [ ] 用户可以切换主题并保存
- [ ] 偏好设置在刷新后保持
- [ ] 所有操作都有审计日志
- [ ] 日志可以查询和导出

#### 2.2 OAuth社交登录（2周）
**优先级：P1 - 重要**

**支持平台：**
1. GitHub OAuth
2. Google OAuth
3. GitLab OAuth

**技术栈：**
- `next-auth` 或 `passport.js`
- OAuth 2.0 协议

**实现步骤：**
```typescript
// Week 1: GitHub登录
1. 安装依赖: pnpm add next-auth
2. 配置OAuth Provider
3. 实现回调处理
4. 用户绑定逻辑
5. 测试和调试

// Week 2: Google和GitLab
1. 添加更多Provider
2. 统一回调处理
3. 前端UI优化
4. 完整测试
```

**代码示例：**
```typescript
// projects/app/src/pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 查找或创建用户
      const existingUser = await findUserByOAuth(
        account.provider, 
        account.providerAccountId
      );
      
      if (existingUser) {
        return true;
      }
      
      // 创建新用户
      await createUserFromOAuth(user, account, profile);
      return true;
    },
  },
});
```

**验收标准：**
- [ ] 支持GitHub/Google登录
- [ ] 首次登录自动创建账号
- [ ] 已有账号可以绑定OAuth
- [ ] 支持解绑功能
- [ ] 错误处理完善

#### 2.3 优惠券系统（1周）
**优先级：P2 - 可选**

**功能模块：**
1. 优惠券创建和管理
2. 优惠券兑换
3. 优惠券使用
4. 使用记录查询

**实现重点：**
```typescript
// 优惠券验证逻辑
async function validateCoupon(code: string, userId: string) {
  const coupon = await MongoCoupon.findOne({
    code,
    status: 'active',
    expiresAt: { $gt: new Date() },
    $expr: { $lt: ['$usedCount', '$usageLimit'] }
  });
  
  if (!coupon) {
    throw new Error('优惠券无效或已过期');
  }
  
  // 检查用户是否已使用
  const used = await MongoUserCoupon.exists({
    userId,
    couponId: coupon._id
  });
  
  if (used) {
    throw new Error('优惠券已使用');
  }
  
  return coupon;
}
```

**验收标准：**
- [ ] 管理员可以创建优惠券
- [ ] 用户可以兑换优惠券
- [ ] 支付时自动应用优惠券
- [ ] 完整的使用记录

---

### Phase 3: 高级功能开发（6-8周）

#### 3.1 支付系统集成（3周）
**优先级：P1 - 重要**

**支付方式：**
1. ✅ 支付宝（推荐 - 国内主流）
2. ✅ 微信支付（推荐 - 国内主流）
3. ⭐ Stripe（可选 - 国际支付）

**Week 1-2: 支付宝集成**

```typescript
// 技术选型
- SDK: alipay-sdk
- 支付方式: 扫码支付、H5支付

// 实现步骤
1. 申请支付宝商户
2. 配置支付参数
3. 实现支付接口
4. 实现回调验证
5. 充值余额处理

// 核心代码
import AlipaySdk from 'alipay-sdk';

class AlipayService {
  private sdk: AlipaySdk;
  
  constructor() {
    this.sdk = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
    });
  }
  
  async createOrder(params: {
    amount: number;
    orderId: string;
    subject: string;
  }) {
    const result = await this.sdk.exec('alipay.trade.page.pay', {
      bizContent: {
        out_trade_no: params.orderId,
        total_amount: params.amount,
        subject: params.subject,
        product_code: 'FAST_INSTANT_TRADE_PAY',
      },
      returnUrl: `${process.env.SITE_URL}/payment/return`,
      notifyUrl: `${process.env.SITE_URL}/api/payment/alipay/callback`,
    });
    
    return result;
  }
  
  async verifyCallback(params: any): Promise<boolean> {
    return this.sdk.checkNotifySign(params);
  }
}
```

**Week 3: 微信支付集成**

```typescript
// 技术选型
- SDK: wechatpay-axios-plugin
- 支付方式: Native扫码、JSAPI

// 实现步骤
1. 申请微信商户
2. 配置商户证书
3. 实现统一下单接口
4. 实现支付回调
5. 生成二维码

// 核心代码
import { Wechatpay } from 'wechatpay-axios-plugin';

class WechatPayService {
  private pay: Wechatpay;
  
  constructor() {
    this.pay = new Wechatpay({
      mchid: process.env.WECHAT_MCH_ID,
      serial: process.env.WECHAT_SERIAL,
      privateKey: fs.readFileSync(process.env.WECHAT_KEY_PATH),
      certs: {
        [process.env.WECHAT_SERIAL]: fs.readFileSync(
          process.env.WECHAT_CERT_PATH
        ),
      },
    });
  }
  
  async createNativeOrder(params: {
    amount: number;
    orderId: string;
    description: string;
  }) {
    const result = await this.pay.v3.pay.transactions.native.post({
      appid: process.env.WECHAT_APP_ID,
      mchid: process.env.WECHAT_MCH_ID,
      out_trade_no: params.orderId,
      description: params.description,
      notify_url: `${process.env.SITE_URL}/api/payment/wechat/callback`,
      amount: {
        total: Math.floor(params.amount * 100), // 分为单位
        currency: 'CNY',
      },
    });
    
    return result.data.code_url; // 返回支付二维码URL
  }
}
```

**数据库设计：**
```typescript
// 订单表
const OrderSchema = new Schema({
  orderId: { type: String, unique: true, required: true },
  userId: { type: ObjectId, ref: 'user', required: true },
  teamId: { type: ObjectId, ref: 'team', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['alipay', 'wechat', 'stripe'],
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentData: { type: Schema.Types.Mixed },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
```

**验收标准：**
- [ ] 支持支付宝扫码支付
- [ ] 支持微信扫码支付
- [ ] 支付回调正确处理
- [ ] 充值自动到账
- [ ] 订单状态正确更新
- [ ] 支持退款功能

#### 3.2 发票系统（1周）
**优先级：P2 - 可选**

**功能需求：**
1. 发票抬头管理
2. 发票申请
3. 发票生成（PDF）
4. 发票邮件发送

**技术实现：**
```typescript
// 发票生成
import PDFDocument from 'pdfkit';

async function generateInvoicePDF(invoiceData: {
  invoiceNo: string;
  companyName: string;
  taxNumber: string;
  amount: number;
  items: Array<{ name: string; amount: number }>;
}) {
  const doc = new PDFDocument();
  
  // 添加标题
  doc.fontSize(20).text('增值税普通发票', { align: 'center' });
  
  // 添加发票信息
  doc.fontSize(12)
     .text(`发票号码: ${invoiceData.invoiceNo}`)
     .text(`购买方: ${invoiceData.companyName}`)
     .text(`纳税人识别号: ${invoiceData.taxNumber}`);
  
  // 添加明细
  doc.text('\n发票明细：');
  invoiceData.items.forEach(item => {
    doc.text(`${item.name}: ¥${item.amount}`);
  });
  
  // 添加总计
  doc.fontSize(14)
     .text(`\n总计: ¥${invoiceData.amount}`, { align: 'right' });
  
  doc.end();
  return doc;
}

// 发票邮件发送
import nodemailer from 'nodemailer';

async function sendInvoiceEmail(
  email: string,
  invoicePDF: Buffer,
  invoiceNo: string
) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `FastGPT 发票 - ${invoiceNo}`,
    text: '您好，附件是您申请的发票，请查收。',
    attachments: [{
      filename: `invoice_${invoiceNo}.pdf`,
      content: invoicePDF,
    }],
  });
}
```

**验收标准：**
- [ ] 用户可以添加发票抬头
- [ ] 可以选择订单申请发票
- [ ] 自动生成PDF发票
- [ ] 发票通过邮件发送
- [ ] 发票记录可查询

#### 3.3 微信登录（2周）
**优先级：P2 - 可选**

**实现方式：**
1. 微信开放平台网站应用
2. 扫码登录
3. 轮询检查登录状态

**技术实现：**
```typescript
// 1. 生成登录二维码
class WxLoginManager {
  async generateQRCode() {
    const loginId = generateUniqueId();
    const state = encodeState({ loginId, timestamp: Date.now() });
    
    const qrCodeUrl = `https://open.weixin.qq.com/connect/qrconnect?` +
      `appid=${process.env.WX_APP_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.WX_CALLBACK_URL)}&` +
      `response_type=code&` +
      `scope=snsapi_login&` +
      `state=${state}#wechat_redirect`;
    
    // 保存登录状态到Redis（5分钟有效）
    await redis.setex(
      `wx_login:${loginId}`,
      300,
      JSON.stringify({ status: 'pending' })
    );
    
    return { qrCodeUrl, loginId };
  }
  
  // 2. 处理回调
  async handleCallback(code: string, state: string) {
    const { loginId } = decodeState(state);
    
    // 获取access_token
    const tokenRes = await axios.get(
      'https://api.weixin.qq.com/sns/oauth2/access_token',
      {
        params: {
          appid: process.env.WX_APP_ID,
          secret: process.env.WX_APP_SECRET,
          code,
          grant_type: 'authorization_code',
        },
      }
    );
    
    const { access_token, openid } = tokenRes.data;
    
    // 获取用户信息
    const userRes = await axios.get(
      'https://api.weixin.qq.com/sns/userinfo',
      {
        params: { access_token, openid },
      }
    );
    
    // 查找或创建用户
    const user = await findOrCreateWxUser(userRes.data);
    
    // 更新登录状态
    await redis.setex(
      `wx_login:${loginId}`,
      60,
      JSON.stringify({
        status: 'success',
        userId: user._id,
        token: generateJWT(user),
      })
    );
  }
  
  // 3. 检查登录状态（前端轮询）
  async checkLoginStatus(loginId: string) {
    const data = await redis.get(`wx_login:${loginId}`);
    if (!data) {
      return { status: 'expired' };
    }
    return JSON.parse(data);
  }
}
```

**验收标准：**
- [ ] 显示微信登录二维码
- [ ] 扫码后自动登录
- [ ] 支持绑定已有账号
- [ ] 支持解绑功能

#### 3.4 SSO单点登录（2周）
**优先级：P3 - 可选**

**支持协议：**
1. SAML 2.0
2. OAuth 2.0 / OpenID Connect
3. CAS

**实现步骤（以SAML为例）：**
```typescript
// Week 1: SAML基础实现
import saml2 from 'saml2-js';

class SAMLService {
  private sp: any;
  
  constructor() {
    this.sp = new saml2.ServiceProvider({
      entity_id: `${process.env.SITE_URL}/saml/metadata`,
      private_key: fs.readFileSync(process.env.SAML_PRIVATE_KEY),
      certificate: fs.readFileSync(process.env.SAML_CERTIFICATE),
      assert_endpoint: `${process.env.SITE_URL}/api/auth/saml/callback`,
    });
  }
  
  async getLoginUrl(idpMetadataUrl: string) {
    const idp = await this.createIdpFromMetadata(idpMetadataUrl);
    return new Promise((resolve, reject) => {
      this.sp.create_login_request_url(idp, {}, (err, login_url) => {
        if (err) reject(err);
        else resolve(login_url);
      });
    });
  }
  
  async handleCallback(samlResponse: string) {
    const idp = await this.getConfiguredIdp();
    
    return new Promise((resolve, reject) => {
      this.sp.post_assert(idp, { SAMLResponse: samlResponse }, 
        async (err, saml_response) => {
          if (err) {
            reject(err);
            return;
          }
          
          // 提取用户信息
          const userInfo = {
            email: saml_response.user.email,
            name: saml_response.user.name,
            nameId: saml_response.user.name_id,
          };
          
          // 查找或创建用户
          const user = await findOrCreateSAMLUser(userInfo);
          resolve(user);
        }
      );
    });
  }
}

// Week 2: 管理界面和测试
// 实现SAML配置管理界面
// 支持多租户SAML配置
// 完整测试流程
```

**验收标准：**
- [ ] 支持SAML 2.0协议
- [ ] 企业可以配置自己的IdP
- [ ] 支持属性映射
- [ ] 支持登出功能

---

### Phase 4: 企业级功能（8-12周）

#### 4.1 自定义域名（3周）
**优先级：P3 - 可选**
**技术难度：⭐⭐⭐⭐⭐**

**功能需求：**
1. 域名绑定
2. DNS验证
3. SSL证书自动申请
4. 反向代理配置

**技术栈：**
- Let's Encrypt (免费SSL)
- acme.js / certbot
- Nginx动态配置
- DNS验证

**实现架构：**
```
用户域名 (custom.example.com)
        ↓ DNS CNAME
反向代理 (Nginx/Caddy)
        ↓ SSL终止
FastGPT应用服务器
```

**核心实现：**
```typescript
// 1. DNS验证
import dns from 'dns/promises';

async function verifyDNS(domain: string, expectedValue: string) {
  try {
    const records = await dns.resolveTxt(domain);
    return records.some(record => 
      record.includes(expectedValue)
    );
  } catch (error) {
    return false;
  }
}

// 2. SSL证书申请
import acme from 'acme-client';

async function requestSSLCertificate(domain: string) {
  const client = new acme.Client({
    directoryUrl: acme.directory.letsencrypt.production,
    accountKey: await acme.forge.createPrivateKey(),
  });
  
  const [key, csr] = await acme.forge.createCsr({
    commonName: domain,
  });
  
  const cert = await client.auto({
    csr,
    email: process.env.ADMIN_EMAIL,
    termsOfServiceAgreed: true,
    challengePriority: ['dns-01'],
    challengeCreateFn: async (authz, challenge, keyAuthorization) => {
      // 创建DNS TXT记录
      console.log('Add TXT record:', {
        name: `_acme-challenge.${domain}`,
        value: keyAuthorization,
      });
    },
    challengeRemoveFn: async () => {
      // 删除DNS TXT记录
    },
  });
  
  return { key, cert };
}

// 3. Nginx配置更新
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function updateNginxConfig(domain: string, certPath: string, keyPath: string) {
  const config = `
server {
    listen 443 ssl http2;
    server_name ${domain};
    
    ssl_certificate ${certPath};
    ssl_certificate_key ${keyPath};
    ssl_protocols TLSv1.2 TLSv1.3;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
  `;
  
  // 写入配置文件
  await fs.promises.writeFile(
    `/etc/nginx/sites-available/${domain}`,
    config
  );
  
  // 创建软链接
  await execAsync(
    `ln -sf /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/${domain}`
  );
  
  // 测试配置
  await execAsync('nginx -t');
  
  // 重载Nginx
  await execAsync('nginx -s reload');
}
```

**验收标准：**
- [ ] 用户可以添加自定义域名
- [ ] 自动验证DNS配置
- [ ] 自动申请SSL证书
- [ ] 域名可以正常访问
- [ ] 支持证书自动续期

#### 4.2 高级团队协作（2周）
**优先级：P2 - 可选**

**功能模块：**
1. 组织架构管理
2. 群组管理
3. 权限继承
4. 成员批量操作

**实现重点：**
```typescript
// 组织架构树形结构
const OrganizationSchema = new Schema({
  teamId: { type: ObjectId, ref: 'team', required: true },
  name: { type: String, required: true },
  parentId: { type: ObjectId, ref: 'organization' },
  path: { type: String }, // 如: /root/dept1/dept2
  level: { type: Number },
  memberIds: [{ type: ObjectId, ref: 'user' }],
  managerId: { type: ObjectId, ref: 'user' },
  metadata: { type: Schema.Types.Mixed },
});

// 权限继承逻辑
async function checkPermission(
  userId: string,
  resourceId: string,
  action: string
) {
  // 1. 检查直接权限
  const direct = await checkDirectPermission(userId, resourceId, action);
  if (direct) return true;
  
  // 2. 检查群组权限
  const groups = await getUserGroups(userId);
  for (const group of groups) {
    const groupPerm = await checkGroupPermission(group._id, resourceId, action);
    if (groupPerm) return true;
  }
  
  // 3. 检查组织架构权限
  const orgs = await getUserOrganizations(userId);
  for (const org of orgs) {
    const orgPerm = await checkOrgPermission(org._id, resourceId, action);
    if (orgPerm) return true;
  }
  
  return false;
}
```

#### 4.3 数据分析和报表（2周）
**优先级：P2 - 可选**

**功能需求：**
1. 使用量统计
2. 成本分析
3. 用户行为分析
4. 自定义报表

**技术实现：**
```typescript
// 时序数据聚合
async function getUsageStats(params: {
  teamId: string;
  startDate: Date;
  endDate: Date;
  groupBy: 'hour' | 'day' | 'month';
}) {
  const pipeline = [
    {
      $match: {
        teamId: new ObjectId(params.teamId),
        createdAt: {
          $gte: params.startDate,
          $lte: params.endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateTrunc: {
            date: '$createdAt',
            unit: params.groupBy,
          },
        },
        totalTokens: { $sum: '$tokens' },
        totalCost: { $sum: '$cost' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ];
  
  return await MongoUsage.aggregate(pipeline);
}

// 成本预测
async function predictCost(teamId: string) {
  const last30Days = await getUsageStats({
    teamId,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    groupBy: 'day',
  });
  
  const avgDailyCost = last30Days.reduce((sum, day) => 
    sum + day.totalCost, 0
  ) / 30;
  
  return {
    predictedMonthly: avgDailyCost * 30,
    predictedQuarterly: avgDailyCost * 90,
    predictedYearly: avgDailyCost * 365,
  };
}
```

#### 4.4 高级API和Webhook（1周）
**优先级：P2 - 可选**

**功能需求：**
1. Webhook配置
2. 事件订阅
3. 重试机制
4. Webhook签名验证

**实现示例：**
```typescript
// Webhook管理
class WebhookService {
  async trigger(event: string, data: any, teamId: string) {
    const webhooks = await MongoWebhook.find({
      teamId,
      events: event,
      status: 'active',
    });
    
    for (const webhook of webhooks) {
      await this.sendWebhook(webhook, event, data);
    }
  }
  
  async sendWebhook(
    webhook: any,
    event: string,
    data: any,
    attempt: number = 1
  ) {
    const payload = {
      event,
      data,
      timestamp: Date.now(),
    };
    
    const signature = this.generateSignature(
      payload,
      webhook.secret
    );
    
    try {
      await axios.post(webhook.url, payload, {
        headers: {
          'X-FastGPT-Signature': signature,
          'X-FastGPT-Event': event,
        },
        timeout: 10000,
      });
      
      // 记录成功
      await MongoWebhookLog.create({
        webhookId: webhook._id,
        event,
        status: 'success',
        attempt,
      });
    } catch (error) {
      // 记录失败
      await MongoWebhookLog.create({
        webhookId: webhook._id,
        event,
        status: 'failed',
        attempt,
        error: error.message,
      });
      
      // 重试机制（最多3次）
      if (attempt < 3) {
        setTimeout(() => {
          this.sendWebhook(webhook, event, data, attempt + 1);
        }, attempt * 5000); // 指数退避
      }
    }
  }
  
  private generateSignature(payload: any, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }
}
```

---

### Phase 5: 优化和完善（4-6周）

#### 5.1 性能优化
**任务：**
- [ ] 数据库查询优化
- [ ] Redis缓存策略
- [ ] API响应时间优化
- [ ] 前端性能优化

#### 5.2 安全加固
**任务：**
- [ ] SQL注入防护
- [ ] XSS防护
- [ ] CSRF防护
- [ ] 敏感数据加密
- [ ] API限流

#### 5.3 监控和告警
**任务：**
- [ ] 错误监控（Sentry）
- [ ] 性能监控（APM）
- [ ] 日志收集（ELK）
- [ ] 告警系统

#### 5.4 文档和测试
**任务：**
- [ ] API文档完善
- [ ] 单元测试覆盖
- [ ] 集成测试
- [ ] E2E测试
- [ ] 用户手册

---

## 📊 项目管理

### 团队配置建议

**最小团队（3-4人）：**
- 1x 全栈工程师（技术负责人）
- 1x 后端工程师
- 1x 前端工程师
- 1x 测试工程师（兼职）

**理想团队（6-8人）：**
- 1x 技术负责人
- 2x 后端工程师
- 2x 前端工程师
- 1x DevOps工程师
- 1x 测试工程师
- 1x 产品经理

### 技术栈要求

**必备技能：**
- ✅ Node.js / TypeScript
- ✅ Next.js / React
- ✅ MongoDB / Mongoose
- ✅ Redis
- ✅ Docker

**加分技能：**
- ⭐ 支付系统集成经验
- ⭐ OAuth/SAML实现经验
- ⭐ Nginx配置经验
- ⭐ SSL证书管理经验

### 开发工具

**必备工具：**
- VS Code / WebStorm
- Git / GitHub
- Docker Desktop
- Postman / Insomnia
- MongoDB Compass

**推荐工具：**
- Sentry（错误监控）
- Grafana（可视化监控）
- Swagger（API文档）
- Jest（测试框架）

---

## 💰 成本估算

### 开发成本

| 阶段 | 时间 | 人力成本 | 说明 |
|-----|------|---------|------|
| Phase 1 | 3周 | ¥30,000 | 基础设施 |
| Phase 2 | 6周 | ¥60,000 | 核心功能 |
| Phase 3 | 8周 | ¥80,000 | 高级功能 |
| Phase 4 | 12周 | ¥120,000 | 企业级功能 |
| Phase 5 | 6周 | ¥60,000 | 优化完善 |
| **总计** | **35周** | **¥350,000** | **约8-9个月** |

*备注：按照初级工程师平均¥10,000/人周计算*

### 运营成本（年）

| 项目 | 费用 | 说明 |
|-----|------|------|
| 服务器 | ¥12,000 | 云服务器ECS |
| 数据库 | ¥8,000 | MongoDB云数据库 |
| CDN | ¥6,000 | 静态资源加速 |
| 短信 | ¥3,000 | 验证码服务 |
| 邮件 | ¥2,000 | 邮件发送服务 |
| SSL证书 | ¥2,000 | 多域名证书 |
| 监控 | ¥5,000 | Sentry等服务 |
| **总计** | **¥38,000/年** | **约¥3,200/月** |

---

## 🎯 里程碑

### M1: 基础功能可用（Week 3）
- ✅ 环境搭建完成
- ✅ 数据库Schema设计完成
- ✅ 用户偏好功能上线
- ✅ 审计日志功能上线

### M2: 社交登录上线（Week 9）
- ✅ GitHub/Google登录可用
- ✅ 优惠券系统上线
- ✅ 基础功能稳定运行

### M3: 支付系统上线（Week 17）
- ✅ 支付宝/微信支付集成
- ✅ 发票系统上线
- ✅ 微信登录上线

### M4: 企业级功能完善（Week 29）
- ✅ 自定义域名支持
- ✅ 高级团队协作
- ✅ 数据分析报表

### M5: 正式发布（Week 35）
- ✅ 所有功能测试通过
- ✅ 文档完善
- ✅ 性能优化完成
- ✅ 安全审计通过

---

## 🚀 快速开始

### 第一周任务清单

**Day 1-2: 环境准备**
- [ ] 克隆项目并安装依赖
- [ ] 配置本地开发环境
- [ ] 启动项目并验证
- [ ] 阅读现有代码和文档

**Day 3-4: 架构理解**
- [ ] 深入理解proApi机制
- [ ] 分析Mock数据结构
- [ ] 梳理需要实现的API
- [ ] 制定详细技术方案

**Day 5: 数据库设计**
- [ ] 设计第一批Schema
- [ ] 编写Migration脚本
- [ ] 创建测试数据

### 第一个功能：用户偏好设置

```bash
# 1. 创建Schema
mkdir -p packages/service/support/user/preference
touch packages/service/support/user/preference/schema.ts

# 2. 创建API
mkdir -p projects/app/src/pages/api/support/user/preference
touch projects/app/src/pages/api/support/user/preference/get.ts
touch projects/app/src/pages/api/support/user/preference/update.ts

# 3. 创建前端API
touch packages/web/support/user/api/preference.ts

# 4. 测试
pnpm test
```

---

## 📚 参考资源

### 官方文档
- FastGPT官方文档: https://doc.fastgpt.in
- Next.js文档: https://nextjs.org/docs
- Mongoose文档: https://mongoosejs.com

### 第三方集成
- 支付宝开放平台: https://opendocs.alipay.com
- 微信支付文档: https://pay.weixin.qq.com/wiki/doc/api/
- NextAuth.js: https://next-auth.js.org
- Let's Encrypt: https://letsencrypt.org

### 最佳实践
- Node.js最佳实践: https://github.com/goldbergyoni/nodebestpractices
- TypeScript最佳实践: https://github.com/typescript-cheatsheets/react

---

## 📋 总结

### 关键发现

1. **这是开源版，不是商业版完整代码**
   - 包含完整的核心功能
   - 商业版功能通过API代理实现
   - Mock层已经定义好接口规范

2. **开发策略建议：在开源版基础上自行开发**
   - 架构支持渐进式添加功能
   - Mock数据提供了清晰的接口定义
   - 可以根据实际需求选择实现哪些功能

3. **投资回报分析**
   - 开发周期: 8-9个月
   - 开发成本: 约¥35万
   - 运营成本: 约¥3,200/月
   - 长期来看比购买商业版更经济

### 下一步行动

1. **立即开始：**
   - 搭建开发环境
   - 实现第一个功能（用户偏好）
   - 验证开发流程

2. **短期目标（3个月）：**
   - 完成基础功能
   - 完成社交登录
   - 完成优惠券系统

3. **长期目标（9个月）：**
   - 完成所有核心功能
   - 通过安全审计
   - 正式上线运营

---

**创建时间：** 2026-01-09  
**版本：** v1.0  
**维护者：** FastGPT开发团队
