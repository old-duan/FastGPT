# FastGPT 个人/小企业版 MVP 开发计划

## 🎯 核心定位

**目标用户：** 个人开发者、小型团队（5-20人）、初创企业  
**核心诉求：** 轻量实用、成本可控、易部署维护、核心功能闭环  
**关键词：** 做减法、快速上线、用户验证、迭代优化

---

## 📊 功能优先级矩阵

### P0 级别 - 必须实现（核心闭环）

| 功能模块 | 具体功能 | 开源版状态 | 开发工作量 | 用户价值 |
|---------|---------|-----------|-----------|---------|
| **核心生产力** | 对话引擎 | ✅ 已有 | 🔧 优化稳定性 | ⭐⭐⭐⭐⭐ |
| | 知识库管理 | ✅ 已有 | 🔧 修复已知Bug | ⭐⭐⭐⭐⭐ |
| | 工作流编排 | ✅ 已有 | 🔧 简化操作 | ⭐⭐⭐⭐ |
| | API 接口 | ✅ 已有 | 🔧 补充文档 | ⭐⭐⭐⭐ |
| **用户管理** | 用户名密码登录 | ✅ 已有 | ✅ 无需开发 | ⭐⭐⭐⭐⭐ |
| | 基础团队管理 | ✅ 已有 | 🔧 简化界面 | ⭐⭐⭐⭐ |
| | 角色权限（管理员/成员）| ✅ 已有 | ✅ 无需开发 | ⭐⭐⭐⭐ |
| **商业化** | 余额充值（支付宝/微信）| ❌ Mock | 🆕 实现 | ⭐⭐⭐⭐⭐ |
| | Token 扣费 | ✅ 已有 | 🔧 优化计费逻辑 | ⭐⭐⭐⭐⭐ |
| | 余额查询 | ✅ 已有 | ✅ 无需开发 | ⭐⭐⭐⭐ |
| **基础安全** | 操作日志（登录/充值）| ❌ Mock | 🆕 实现 | ⭐⭐⭐⭐ |
| | 敏感数据脱敏 | ⚠️ 部分 | 🔧 完善 | ⭐⭐⭐ |

### P1 级别 - 建议实现（体验优化）

| 功能模块 | 具体功能 | 投入时间 | 用户价值 |
|---------|---------|---------|---------|
| **体验优化** | 社交登录（GitHub/微信）| 1周 | ⭐⭐⭐⭐ |
| | 用户偏好（主题/语言）| 2天 | ⭐⭐⭐ |
| | 账单明细查询 | 2天 | ⭐⭐⭐⭐ |
| **轻量商业化** | 简易优惠券（固定金额）| 3天 | ⭐⭐⭐ |
| | 简单套餐（月包/次包）| 3天 | ⭐⭐⭐ |
| **基础统计** | 使用量统计 | 2天 | ⭐⭐⭐ |
| | 7/30天趋势图 | 2天 | ⭐⭐⭐ |

### P2/P3 级别 - 暂不实现（避免过度设计）

❌ **明确不做的功能：**
- 发票系统（自动生成/PDF/邮件）
- SSO 单点登录（SAML/CAS）
- 自定义域名（DNS/SSL管理）
- 组织架构（多层级部门）
- Webhook 事件订阅
- 成本预测/高级数据分析
- 多租户隔离
- 退款流程
- 复杂套餐规则（阶梯定价）

---

## 🚀 MVP 开发路线图

### 阶段 1：夯实基础（2周）

**目标：** 开源版核心功能稳定可用，部署简单

#### Week 1: 问题修复与优化

**Day 1-2: 问题排查**
```bash
任务清单：
✅ 1. 清理无用的 Mock 代码
   - 移除 proApi 中不需要的商业版 Mock
   - 保留必要的接口结构（充值/计费相关）
   
✅ 2. 修复已知 Bug
   - DOM 插入错误（已修复）
   - quickAppList undefined（已修复）
   - 其他影响核心使用的问题
   
✅ 3. 核心功能测试
   - 对话引擎稳定性测试
   - 知识库同步测试
   - 工作流执行测试
```

**Day 3-5: 部署优化**
```bash
任务清单：
✅ 1. 简化 Docker 部署
   - 编写一键部署脚本（docker-compose-simple.yml）
   - 移除不必要的服务（商业版依赖）
   - 优化环境变量配置
   
✅ 2. 编写部署文档
   - 适配 Windows/macOS/Linux
   - 提供常见问题解决方案
   - 最小化硬件要求说明
   
✅ 3. 本地开发环境优化
   - 简化启动流程
   - 减少依赖安装时间
```

#### Week 2: 环境准备与设计

**Day 1-3: 数据库设计（最小化）**
```typescript
// 仅新增必要的 Schema

1. 支付订单 (PaymentOrder) - P0
   - orderId: String (唯一订单号)
   - userId: ObjectId
   - amount: Number (充值金额)
   - paymentMethod: String (alipay/wechat)
   - status: String (pending/paid/failed)
   - tradeNo: String (第三方交易号)
   - paidAt: Date
   - createdAt: Date

2. 操作日志 (OperationLog) - P0
   - userId: ObjectId
   - action: String (login/recharge/knowledge_edit)
   - details: Mixed (简单JSON)
   - ip: String
   - createdAt: Date

3. 用户优惠券 (UserCoupon) - P1
   - userId: ObjectId
   - code: String
   - amount: Number (固定金额)
   - status: String (unused/used)
   - usedAt: Date
   - expiresAt: Date

// 不需要的 Schema（避免过度设计）
❌ 发票相关
❌ OAuth 绑定（P1 阶段实现）
❌ 组织架构
❌ Webhook 配置
```

**Day 4-5: API 接口规划**
```typescript
// 第一期仅实现核心 API

// 支付相关（P0）
POST /api/support/wallet/pay/create        // 创建支付订单
POST /api/support/wallet/pay/callback      // 支付回调
GET  /api/support/wallet/pay/status        // 查询支付状态
GET  /api/support/wallet/bill/list         // 账单列表

// 日志相关（P0）
POST /api/support/log/create               // 创建日志
GET  /api/support/log/list                 // 查询日志（简化）

// 优惠券相关（P1）
POST /api/support/coupon/redeem            // 兑换优惠券
GET  /api/support/coupon/list              // 我的优惠券

// 统计相关（P1）
GET  /api/support/stat/usage               // 使用量统计
```

---

### 阶段 2：核心商业化（3周）

**目标：** 实现充值→使用→扣费闭环

#### Week 3: 支付系统（极简版）

**核心原则：** 
- ✅ 仅支持个人商户扫码支付
- ✅ 无需企业资质认证
- ✅ 充值后直接增加余额
- ❌ 不做分账、结算、对账

**技术选型：**
```typescript
// 方案 1：支付宝当面付（推荐，个人可用）
- 申请条件：个人支付宝账号 + 实名认证
- 费率：0.6%
- 到账：T+1
- 适用场景：扫码支付

// 方案 2：微信收款商业版（备选）
- 申请条件：个人微信 + 身份证
- 费率：0.6%
- 到账：T+1
- 适用场景：扫码支付
```

**实现步骤：**
```typescript
// Day 1-2: 支付宝集成
import AlipaySdk from 'alipay-sdk';

class SimpleAlipayService {
  // 极简配置，无需复杂参数
  private sdk = new AlipaySdk({
    appId: process.env.ALIPAY_APP_ID,
    privateKey: process.env.ALIPAY_PRIVATE_KEY,
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
    gateway: 'https://openapi.alipay.com/gateway.do',
  });

  // 创建订单（仅核心参数）
  async createOrder(amount: number, userId: string) {
    const orderId = `FG${Date.now()}${userId.slice(-6)}`;
    
    // 保存订单到数据库
    await MongoPaymentOrder.create({
      orderId,
      userId,
      amount,
      paymentMethod: 'alipay',
      status: 'pending',
    });
    
    // 生成支付二维码
    const result = await this.sdk.exec('alipay.trade.precreate', {
      bizContent: {
        out_trade_no: orderId,
        total_amount: amount.toFixed(2),
        subject: 'FastGPT 余额充值',
      },
      notifyUrl: `${process.env.SITE_URL}/api/support/wallet/pay/callback`,
    });
    
    return {
      orderId,
      qrCode: result.qr_code, // 返回二维码URL
    };
  }

  // 支付回调（极简处理）
  async handleCallback(params: any) {
    // 1. 验证签名
    const valid = this.sdk.checkNotifySign(params);
    if (!valid) {
      throw new Error('签名验证失败');
    }
    
    // 2. 检查订单状态
    if (params.trade_status !== 'TRADE_SUCCESS') {
      return;
    }
    
    // 3. 更新订单
    const order = await MongoPaymentOrder.findOne({
      orderId: params.out_trade_no,
      status: 'pending',
    });
    
    if (!order) {
      return; // 防止重复回调
    }
    
    // 4. 增加用户余额（关键步骤）
    await MongoTeam.updateOne(
      { _id: order.userId },
      { $inc: { balance: order.amount * 100000 } } // 转换为积分
    );
    
    // 5. 更新订单状态
    order.status = 'paid';
    order.tradeNo = params.trade_no;
    order.paidAt = new Date();
    await order.save();
    
    // 6. 记录日志
    await MongoOperationLog.create({
      userId: order.userId,
      action: 'recharge',
      details: { amount: order.amount, orderId: order.orderId },
    });
  }
}
```

**Day 3-4: 微信支付集成（可选）**
```typescript
// 使用 wechatpay-node-v3（简化版）
import { Payment } from 'wechatpay-node-v3';

class SimpleWechatPayService {
  private payment = new Payment({
    appid: process.env.WECHAT_APP_ID,
    mchid: process.env.WECHAT_MCH_ID,
    private_key: fs.readFileSync(process.env.WECHAT_KEY_PATH),
    serial_no: process.env.WECHAT_SERIAL,
  });

  async createOrder(amount: number, userId: string) {
    const orderId = `FG${Date.now()}${userId.slice(-6)}`;
    
    // 保存订单
    await MongoPaymentOrder.create({
      orderId,
      userId,
      amount,
      paymentMethod: 'wechat',
      status: 'pending',
    });
    
    // 创建 Native 支付（扫码）
    const result = await this.payment.native({
      description: 'FastGPT 余额充值',
      out_trade_no: orderId,
      amount: {
        total: Math.floor(amount * 100), // 分为单位
      },
      notify_url: `${process.env.SITE_URL}/api/support/wallet/pay/callback`,
    });
    
    return {
      orderId,
      qrCode: result.code_url,
    };
  }

  // 回调处理逻辑类似支付宝
}
```

**Day 5: 前端集成**
```typescript
// 充值页面（极简设计）
export default function RechargePage() {
  const [amount, setAmount] = useState<number>(10);
  const [qrCode, setQrCode] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');

  // 创建订单
  const handleCreateOrder = async () => {
    const res = await createPaymentOrder({ amount });
    setQrCode(res.qrCode);
    setOrderId(res.orderId);
    
    // 轮询支付状态（简单实现）
    checkPaymentStatus(res.orderId);
  };

  // 轮询支付状态
  const checkPaymentStatus = (orderId: string) => {
    const timer = setInterval(async () => {
      const status = await getPaymentStatus({ orderId });
      if (status.status === 'paid') {
        clearInterval(timer);
        toast.success('充值成功！');
        router.push('/account/billing');
      }
    }, 2000);
  };

  return (
    <Box>
      <Heading>余额充值</Heading>
      
      {/* 金额选择 */}
      <HStack>
        {[10, 50, 100, 200].map(v => (
          <Button
            key={v}
            variant={amount === v ? 'solid' : 'outline'}
            onClick={() => setAmount(v)}
          >
            ¥{v}
          </Button>
        ))}
      </HStack>
      
      {/* 自定义金额 */}
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        min={1}
        max={10000}
      />
      
      {/* 支付按钮 */}
      <Button onClick={handleCreateOrder}>
        生成支付二维码
      </Button>
      
      {/* 二维码展示 */}
      {qrCode && (
        <Box>
          <QRCode value={qrCode} size={200} />
          <Text>请使用支付宝/微信扫码支付</Text>
          <Text fontSize="sm" color="gray.500">
            支付后自动到账，请勿关闭页面
          </Text>
        </Box>
      )}
    </Box>
  );
}
```

**验收标准：**
- [ ] 用户可以输入充值金额（最小1元）
- [ ] 生成支付二维码（支付宝）
- [ ] 扫码支付后自动到账
- [ ] 余额正确增加
- [ ] 订单状态正确更新
- [ ] 记录操作日志

#### Week 4: 计费优化与日志

**Day 1-2: 计费逻辑优化**
```typescript
// 优化现有的 Token 扣费逻辑

class BillingService {
  // 统一扣费入口
  async deductBalance(params: {
    teamId: string;
    amount: number;
    type: 'chat' | 'knowledge' | 'workflow';
    details: any;
  }) {
    // 1. 检查余额
    const team = await MongoTeam.findById(params.teamId);
    if (team.balance < params.amount) {
      throw new Error('余额不足，请充值');
    }
    
    // 2. 扣除余额
    await MongoTeam.updateOne(
      { _id: params.teamId },
      { $inc: { balance: -params.amount } }
    );
    
    // 3. 记录消费日志
    await MongoBillRecord.create({
      teamId: params.teamId,
      amount: params.amount,
      type: params.type,
      details: params.details,
      createdAt: new Date(),
    });
    
    // 4. 余额预警（低于10元发送通知）
    if (team.balance - params.amount < 1000000) { // 10元
      await this.sendLowBalanceAlert(params.teamId);
    }
  }

  // 余额不足预警
  async sendLowBalanceAlert(teamId: string) {
    // 简单实现：仅在页面显示提示
    // P1 阶段可以加邮件通知
  }
}
```

**Day 3-4: 操作日志**
```typescript
// 极简日志记录（仅关键操作）

class LogService {
  private IMPORTANT_ACTIONS = [
    'login',           // 登录
    'recharge',        // 充值
    'knowledge_create',// 创建知识库
    'knowledge_delete',// 删除知识库
    'large_expense',   // 大额消费（单次 >10元）
  ];

  async log(params: {
    userId: string;
    action: string;
    details?: any;
    ip?: string;
  }) {
    // 仅记录重要操作
    if (!this.IMPORTANT_ACTIONS.includes(params.action)) {
      return;
    }
    
    await MongoOperationLog.create({
      userId: params.userId,
      action: params.action,
      details: params.details || {},
      ip: params.ip || '',
      createdAt: new Date(),
    });
  }

  // 简单查询（仅支持分页+按操作类型筛选）
  async list(params: {
    userId: string;
    action?: string;
    page: number;
    pageSize: number;
  }) {
    const query: any = { userId: params.userId };
    if (params.action) {
      query.action = params.action;
    }
    
    return await MongoOperationLog.find(query)
      .sort({ createdAt: -1 })
      .skip((params.page - 1) * params.pageSize)
      .limit(params.pageSize);
  }
}
```

**Day 5: 账单页面**
```tsx
// 极简账单页面
export default function BillingPage() {
  const { data: bills } = useQuery(['bills'], getBillList);
  const { data: balance } = useQuery(['balance'], getTeamBalance);

  return (
    <Box>
      {/* 余额展示 */}
      <Card>
        <Stat>
          <StatLabel>当前余额</StatLabel>
          <StatNumber>¥{(balance / 100000).toFixed(2)}</StatNumber>
          <StatHelpText>
            <Button size="sm" onClick={() => router.push('/account/recharge')}>
              立即充值
            </Button>
          </StatHelpText>
        </Stat>
      </Card>

      {/* 账单列表 */}
      <Table>
        <Thead>
          <Tr>
            <Th>时间</Th>
            <Th>类型</Th>
            <Th>金额</Th>
            <Th>余额</Th>
          </Tr>
        </Thead>
        <Tbody>
          {bills.map(bill => (
            <Tr key={bill._id}>
              <Td>{formatDate(bill.createdAt)}</Td>
              <Td>
                {bill.type === 'recharge' ? '充值' : '消费'}
              </Td>
              <Td color={bill.type === 'recharge' ? 'green.500' : 'red.500'}>
                {bill.type === 'recharge' ? '+' : '-'}
                ¥{(bill.amount / 100000).toFixed(2)}
              </Td>
              <Td>¥{(bill.afterBalance / 100000).toFixed(2)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
```

**验收标准：**
- [ ] 余额不足时阻止对话
- [ ] 对话/知识库操作正确扣费
- [ ] 账单列表展示正确
- [ ] 余额低于10元时显示预警
- [ ] 操作日志正确记录

#### Week 5: 测试与修复

**全流程测试：**
```bash
测试场景 1：新用户注册充值流程
1. 注册新账号
2. 登录系统
3. 查看余额（应为 0）
4. 进入充值页面
5. 选择金额（如 50 元）
6. 生成二维码
7. 扫码支付
8. 等待到账（2-5秒）
9. 余额更新为 50 元
10. 查看账单记录

测试场景 2：使用扣费流程
1. 创建新对话
2. 发送消息（消耗 Token）
3. 余额正确扣除
4. 账单记录生成
5. 继续对话直到余额不足
6. 系统提示充值

测试场景 3：日志记录
1. 查看操作日志
2. 验证登录记录
3. 验证充值记录
4. 验证知识库操作记录
```

---

### 阶段 3：体验优化（2周）

**目标：** 提升用户体验，增加便利性功能

#### Week 6: 社交登录（GitHub + 微信）

**技术方案：**
```typescript
// 使用 NextAuth.js（快速集成）
import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

// Day 1-3: GitHub 登录
export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 查找或创建用户
      let existingUser = await MongoUser.findOne({
        'oauthBindings.github': account.providerAccountId,
      });
      
      if (!existingUser) {
        // 首次登录，创建新用户
        existingUser = await MongoUser.create({
          username: user.email?.split('@')[0] || `github_${account.providerAccountId}`,
          email: user.email,
          avatar: user.image,
          oauthBindings: {
            github: account.providerAccountId,
          },
        });
        
        // 创建默认团队
        await MongoTeam.create({
          name: `${user.name} 的团队`,
          ownerId: existingUser._id,
          balance: 0,
        });
      }
      
      return true;
    },
  },
});

// Day 4-5: 微信登录（扫码）
// 使用微信开放平台网站应用
// 实现逻辑类似 GitHub，详见之前文档
```

**验收标准：**
- [ ] 支持 GitHub 一键登录
- [ ] 首次登录自动创建账号
- [ ] 支持绑定到已有账号
- [ ] （可选）支持微信扫码登录

#### Week 7: 轻量功能补充

**Day 1-2: 简易优惠券**
```typescript
// 超级简化版优惠券
class CouponService {
  // 管理员生成优惠券码
  async generateCode(amount: number, count: number = 1) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = `FG${randomString(8).toUpperCase()}`;
      await MongoCoupon.create({
        code,
        amount: amount * 100000, // 转换为积分
        status: 'unused',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天
      });
      codes.push(code);
    }
    return codes;
  }

  // 用户兑换优惠券
  async redeem(code: string, userId: string) {
    const coupon = await MongoCoupon.findOne({
      code,
      status: 'unused',
      expiresAt: { $gt: new Date() },
    });
    
    if (!coupon) {
      throw new Error('优惠券无效或已过期');
    }
    
    // 增加余额
    await MongoTeam.updateOne(
      { ownerId: userId },
      { $inc: { balance: coupon.amount } }
    );
    
    // 更新优惠券状态
    coupon.status = 'used';
    coupon.usedBy = userId;
    coupon.usedAt = new Date();
    await coupon.save();
    
    return { amount: coupon.amount / 100000 };
  }
}
```

**Day 3-4: 用户偏好设置**
```typescript
// 仅支持基础偏好
const UserPreferenceSchema = new Schema({
  userId: { type: ObjectId, ref: 'user', required: true },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  language: { type: String, enum: ['zh', 'en'], default: 'zh' },
  notifications: { type: Boolean, default: true },
});

// 前端实现
export default function PreferencePage() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('zh');

  return (
    <Box>
      <FormControl>
        <FormLabel>主题</FormLabel>
        <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>语言</FormLabel>
        <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="zh">简体中文</option>
          <option value="en">English</option>
        </Select>
      </FormControl>

      <Button onClick={handleSave}>保存设置</Button>
    </Box>
  );
}
```

**Day 5: 基础统计**
```typescript
// 极简统计（仅展示数字）
export default function StatsPage() {
  const { data } = useQuery(['stats'], getUsageStats);

  return (
    <SimpleGrid columns={4} spacing={4}>
      <Stat>
        <StatLabel>累计对话</StatLabel>
        <StatNumber>{data.totalChats}</StatNumber>
      </Stat>
      
      <Stat>
        <StatLabel>累计消费</StatLabel>
        <StatNumber>¥{data.totalSpent}</StatNumber>
      </Stat>
      
      <Stat>
        <StatLabel>本月使用量</StatLabel>
        <StatNumber>{data.monthlyUsage}</StatNumber>
      </Stat>
      
      <Stat>
        <StatLabel>知识库数量</StatLabel>
        <StatNumber>{data.knowledgeCount}</StatNumber>
      </Stat>
    </SimpleGrid>
  );
}
```

---

### 阶段 4：测试与上线（1周）

#### Week 8: 全面测试与文档

**Day 1-3: 功能测试**
```bash
核心流程测试清单：
✅ 注册/登录流程
  - 用户名密码注册
  - 邮箱验证
  - 登录成功
  - GitHub 登录（可选）

✅ 充值流程
  - 金额输入
  - 二维码生成
  - 扫码支付
  - 余额到账
  - 账单记录

✅ 使用流程
  - 创建对话
  - 发送消息
  - 余额扣除
  - 余额不足提示

✅ 知识库流程
  - 创建知识库
  - 上传文档
  - 向量化处理
  - 知识库对话

✅ 团队协作
  - 邀请成员
  - 权限设置
  - 共享知识库

✅ 优惠券流程
  - 兑换优惠券
  - 余额增加
  - 优惠券状态更新
```

**Day 4-5: 文档编写**
```markdown
1. 部署文档（deploy/README.md）
   - 环境要求（Node.js 18+, Docker, MongoDB）
   - 一键部署脚本
   - 环境变量配置
   - 常见问题

2. 用户手册（docs/USER_GUIDE.md）
   - 快速开始
   - 充值教程
   - 对话使用
   - 知识库管理
   - 团队协作

3. API 文档（docs/API.md）
   - 认证方式
   - 核心接口
   - 错误码
   - 示例代码
```

---

## 📊 开发成本估算（调整后）

### 时间成本

| 阶段 | 时间 | 人力 | 说明 |
|-----|------|------|------|
| 阶段1：夯实基础 | 2周 | 1-2人 | 修复Bug、优化部署 |
| 阶段2：核心商业化 | 3周 | 2-3人 | 支付、计费、日志 |
| 阶段3：体验优化 | 2周 | 1-2人 | 社交登录、优惠券 |
| 阶段4：测试上线 | 1周 | 2-3人 | 测试、文档 |
| **总计** | **8周** | **2-3人** | **约2个月** |

### 资金成本

**开发成本（人月）：**
- 按初级工程师 ¥10,000/人周
- 总成本：8周 × 2.5人 × ¥10,000 = **¥200,000**

**运营成本（年）：**
| 项目 | 费用 | 说明 |
|-----|------|------|
| 服务器 | ¥6,000 | 云服务器 4核8G |
| 数据库 | ¥4,000 | MongoDB 云数据库 |
| CDN | ¥2,000 | 静态资源加速 |
| 短信 | ¥1,000 | 验证码服务 |
| 支付手续费 | 0.6% | 按实际交易额 |
| **总计** | **¥13,000/年** | **约¥1,100/月** |

**总成本对比：**
```
方案对比：

开源版自研（MVP）：
- 开发成本：¥200,000（一次性）
- 运营成本：¥13,000/年
- 第一年总成本：¥213,000

官方商业版（假设）：
- 授权费：¥50,000/年
- 运营成本：¥20,000/年
- 第一年总成本：¥70,000

结论：
- 如果只用1年，购买官方版更划算
- 如果用2年以上，自研更划算（第二年仅¥13,000）
- 自研的优势是完全可控，可持续优化
```

---

## 🎯 里程碑与交付物

### M1: 基础稳定（Week 2）
**交付物：**
- ✅ 修复所有已知 Bug
- ✅ Docker 一键部署脚本
- ✅ 部署文档
- ✅ 数据库 Schema 设计

**验收标准：**
- [ ] 核心功能无报错
- [ ] 本地开发环境可启动
- [ ] 生产环境可部署

### M2: 支付上线（Week 5）
**交付物：**
- ✅ 支付宝充值功能
- ✅ 微信充值功能（可选）
- ✅ 计费系统优化
- ✅ 账单页面
- ✅ 操作日志

**验收标准：**
- [ ] 充值流程完整可用
- [ ] 余额正确到账
- [ ] 扣费逻辑正确
- [ ] 日志正确记录

### M3: 体验优化（Week 7）
**交付物：**
- ✅ GitHub 登录
- ✅ 微信登录（可选）
- ✅ 简易优惠券
- ✅ 用户偏好
- ✅ 基础统计

**验收标准：**
- [ ] 社交登录可用
- [ ] 优惠券可兑换
- [ ] 偏好设置生效
- [ ] 统计数据正确

### M4: 正式发布（Week 8）
**交付物：**
- ✅ 全功能测试通过
- ✅ 用户手册
- ✅ API 文档
- ✅ 部署文档

**验收标准：**
- [ ] 所有功能测试通过
- [ ] 文档完整可用
- [ ] 可以公开发布

---

## 🚀 快速开始（第一周任务）

### Day 1: 环境搭建

```bash
# 1. 克隆项目
git clone <your-repo>
cd FastGPT

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填写必要配置

# 4. 启动数据库
docker-compose -f deploy/dev/docker-compose.yml up -d

# 5. 初始化数据
pnpm run init

# 6. 启动开发服务器
pnpm dev
```

### Day 2-3: 代码清理

```bash
任务清单：
✅ 1. 移除不必要的商业版 Mock
   文件：projects/app/src/pages/api/proApi/[...path].ts
   保留：充值、计费相关接口
   移除：发票、SSO、自定义域名等

✅ 2. 简化团队管理界面
   文件：projects/app/src/pages/team/index.tsx
   移除：组织架构、群组等复杂功能

✅ 3. 优化设置页面
   文件：projects/app/src/pages/account/index.tsx
   保留：基础信息、偏好设置、账单
   移除：企业级配置项
```

### Day 4-5: 支付环境准备

```bash
任务清单：
✅ 1. 申请支付宝当面付
   - 访问：https://open.alipay.com
   - 创建应用
   - 获取 APP_ID、私钥、公钥

✅ 2. 配置支付参数
   # .env
   ALIPAY_APP_ID=你的APP_ID
   ALIPAY_PRIVATE_KEY=你的私钥
   ALIPAY_PUBLIC_KEY=支付宝公钥
   SITE_URL=http://localhost:3000

✅ 3. 测试支付宝沙箱环境
   - 使用沙箱账号测试
   - 验证签名算法
   - 测试回调接口
```

---

## 📋 功能取舍对照表

| 功能 | 企业版 | MVP版 | 说明 |
|-----|-------|------|------|
| **核心功能** |
| 对话引擎 | ✅ | ✅ | 保留 |
| 知识库 | ✅ | ✅ | 保留 |
| 工作流 | ✅ | ✅ | 保留 |
| 插件系统 | ✅ | ✅ | 保留 |
| **用户管理** |
| 用户名密码登录 | ✅ | ✅ | 保留 |
| GitHub 登录 | ✅ | ✅ | 实现 |
| 微信登录 | ✅ | 🟡 | 可选 |
| Google 登录 | ✅ | ❌ | 不做 |
| SSO | ✅ | ❌ | 不做 |
| **团队协作** |
| 基础团队 | ✅ | ✅ | 保留 |
| 成员管理 | ✅ | ✅ | 保留 |
| 角色权限 | ✅ | ✅ | 保留 |
| 组织架构 | ✅ | ❌ | 不做 |
| 群组管理 | ✅ | ❌ | 不做 |
| **商业化** |
| 余额充值 | ✅ | ✅ | 实现 |
| Token 扣费 | ✅ | ✅ | 保留 |
| 简易优惠券 | ✅ | ✅ | 实现 |
| 套餐系统 | ✅ | ❌ | 不做 |
| 发票系统 | ✅ | ❌ | 不做 |
| 退款流程 | ✅ | ❌ | 不做 |
| **安全审计** |
| 操作日志 | ✅ | ✅ | 简化实现 |
| 日志查询 | ✅ | ✅ | 基础查询 |
| 日志导出 | ✅ | ❌ | 不做 |
| 审计报表 | ✅ | ❌ | 不做 |
| **企业集成** |
| Webhook | ✅ | ❌ | 不做 |
| 自定义域名 | ✅ | ❌ | 不做 |
| 多租户 | ✅ | ❌ | 不做 |
| **数据分析** |
| 基础统计 | ✅ | ✅ | 简化实现 |
| 趋势图 | ✅ | 🟡 | 可选 |
| 成本预测 | ✅ | ❌ | 不做 |
| 自定义报表 | ✅ | ❌ | 不做 |

**图例：**
- ✅ 必做/已有
- 🟡 可选
- ❌ 不做

---

## 💡 关键原则与建议

### 1. 做减法，聚焦核心

```
好的例子：
✅ 仅支持支付宝/微信扫码（覆盖95%用户）
✅ 仅记录关键操作日志（减少存储成本）
✅ 仅展示基础统计数据（避免复杂计算）

坏的例子：
❌ 支持10种支付方式（维护成本高）
❌ 记录所有操作日志（存储成本高）
❌ 实现复杂数据分析（开发成本高）
```

### 2. 优先验证，再投入

```
MVP 发布后的验证指标：
1. 用户是否愿意充值？（商业化可行性）
2. 哪些功能使用频率最高？（功能优先级）
3. 用户反馈最多的问题？（优化方向）

根据数据决定下一步：
- 如果充值转化率低 → 优化充值流程/价格策略
- 如果某功能使用率低 → 考虑移除或简化
- 如果用户需求某功能 → 评估后加入 P1 计划
```

### 3. 技术债务管理

```
允许的技术债务（可以后续优化）：
✅ 支付回调用轮询而非 Webhook（简单可靠）
✅ 日志查询用简单分页（性能够用）
✅ 统计数据实时计算（用户量小时够用）

不允许的技术债务（必须现在做好）：
❌ 支付金额计算错误（严重）
❌ 余额扣费逻辑错误（严重）
❌ 用户敏感数据未加密（安全风险）
```

### 4. 部署与运维

```bash
# 简化的生产环境部署（单机版）

# docker-compose-prod.yml
version: '3'
services:
  fastgpt:
    image: fastgpt:latest
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/fastgpt
      - REDIS_URI=redis://redis:6379
      - ALIPAY_APP_ID=${ALIPAY_APP_ID}
    depends_on:
      - mongo
      - redis
  
  mongo:
    image: mongo:6.0
    volumes:
      - mongo_data:/data/db
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:

# 一键部署命令
docker-compose -f docker-compose-prod.yml up -d
```

---

## 📚 参考资源（精简版）

### 必读文档
1. FastGPT 官方文档：https://doc.fastgpt.in
2. 支付宝当面付文档：https://opendocs.alipay.com/open/194/106078
3. NextAuth.js 文档：https://next-auth.js.org

### 推荐工具
1. **开发：** VS Code + GitHub Copilot
2. **测试：** Postman（API测试）
3. **监控：** Sentry（错误监控，免费版够用）
4. **部署：** Docker + Docker Compose

### 技术社区
1. FastGPT GitHub Issues（遇到问题先搜索）
2. FastGPT 微信群（快速反馈）

---

## ✅ 下一步行动

### 立即开始（今天）
1. ✅ 搭建开发环境
2. ✅ 运行项目并验证
3. ✅ 阅读代码，理解架构

### 本周完成（Week 1）
1. 修复所有已知 Bug
2. 清理无用代码
3. 简化部署流程
4. 申请支付宝商户

### 本月目标（Week 4）
1. 完成支付系统
2. 完成计费优化
3. 完成操作日志
4. 开始内测

### 两月目标（Week 8）
1. 完成所有 P0 功能
2. 完成文档编写
3. 正式发布 MVP
4. 收集用户反馈

---

**文档版本：** v2.0 (MVP Edition)  
**创建时间：** 2026-01-09  
**目标用户：** 个人/小型企业  
**预计完成：** 2026-03-09（2个月）

**核心目标：** 快速上线，验证市场，迭代优化 🚀
