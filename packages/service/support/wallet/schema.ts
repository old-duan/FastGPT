/**
 * 支付订单表（PaymentOrder）
 * 用于记录用户的充值订单信息
 */

import type { Model } from 'mongoose';
import { Schema, model, models } from 'mongoose';

export interface PaymentOrderSchemaType {
  _id: string;
  
  // 订单信息
  orderId: string;           // 订单号（系统生成，唯一）
  tradeNo?: string;          // 第三方支付交易号（支付宝/微信流水号）
  
  // 用户信息
  userId: string;            // 用户 ID（关联 User 表）
  teamId: string;            // 团队 ID（关联 Team 表）
  tmbId: string;             // 团队成员 ID（关联 TeamMember 表）
  
  // 金额信息
  amount: number;            // 支付金额（单位：元）
  points: number;            // 充值积分（单位：积分，1元=100积分）
  
  // 订单状态
  status: 'pending' | 'success' | 'failed' | 'refund' | 'closed';
  // pending: 待支付
  // success: 支付成功
  // failed: 支付失败
  // refund: 已退款
  // closed: 已关闭（超时未支付）
  
  // 支付方式
  paymentMethod: 'alipay' | 'wechat' | 'balance' | 'manual';
  // alipay: 支付宝
  // wechat: 微信支付
  // balance: 余额支付
  // manual: 人工充值
  
  // 支付信息
  paymentChannel?: string;   // 支付渠道（web/mobile/app）
  paymentParams?: string;    // 支付参数（JSON 字符串，存储支付请求参数）
  
  // 回调信息
  notifyData?: string;       // 回调通知数据（JSON 字符串）
  notifyTime?: Date;         // 回调通知时间
  notifyRetryCount: number;  // 回调重试次数
  
  // 时间信息
  createdAt: Date;           // 创建时间
  paidAt?: Date;             // 支付完成时间
  expiredAt?: Date;          // 过期时间（默认 30 分钟）
  
  // 附加信息
  remark?: string;           // 备注
  metadata?: Record<string, any>; // 元数据（扩展字段）
}

const PaymentOrderSchema = new Schema({
  // 订单信息
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  tradeNo: {
    type: String,
    index: true,
  },
  
  // 用户信息
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true,
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'team',
    required: true,
    index: true,
  },
  tmbId: {
    type: Schema.Types.ObjectId,
    ref: 'team_member',
    required: true,
  },
  
  // 金额信息
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  points: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // 订单状态
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refund', 'closed'],
    default: 'pending',
    required: true,
    index: true,
  },
  
  // 支付方式
  paymentMethod: {
    type: String,
    enum: ['alipay', 'wechat', 'balance', 'manual'],
    required: true,
    index: true,
  },
  
  // 支付信息
  paymentChannel: {
    type: String,
  },
  paymentParams: {
    type: String,
  },
  
  // 回调信息
  notifyData: {
    type: String,
  },
  notifyTime: {
    type: Date,
  },
  notifyRetryCount: {
    type: Number,
    default: 0,
  },
  
  // 时间信息
  createdAt: {
    type: Date,
    default: () => new Date(),
    index: true,
  },
  paidAt: {
    type: Date,
  },
  expiredAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000), // 默认 30 分钟后过期
    index: true,
  },
  
  // 附加信息
  remark: {
    type: String,
  },
  metadata: {
    type: Object,
    default: {},
  },
});

// 复合索引：查询用户的订单列表（按创建时间降序）
PaymentOrderSchema.index({ userId: 1, createdAt: -1 });
PaymentOrderSchema.index({ teamId: 1, createdAt: -1 });

// 复合索引：查询待支付订单（用于定时任务关闭过期订单）
PaymentOrderSchema.index({ status: 1, expiredAt: 1 });

export const MongoPaymentOrder = (models['payment_order'] ||
  model('payment_order', PaymentOrderSchema)) as Model<PaymentOrderSchemaType>;


/**
 * 操作日志表（OperationLog）
 * 用于记录用户的操作行为（登录、充值、消费等）
 */

export interface OperationLogSchemaType {
  _id: string;
  
  // 用户信息
  userId?: string;           // 用户 ID（可选，游客操作无 userId）
  teamId?: string;           // 团队 ID（可选）
  tmbId?: string;            // 团队成员 ID（可选）
  
  // 操作信息
  action: string;            // 操作类型（见下方枚举）
  module: string;            // 操作模块（user/wallet/chat/app/dataset等）
  method: string;            // 请求方法（GET/POST/PUT/DELETE）
  path: string;              // 请求路径
  
  // 操作详情
  details?: Record<string, any>; // 操作详情（JSON 对象）
  params?: Record<string, any>;  // 请求参数
  response?: Record<string, any>; // 响应结果（敏感信息脱敏）
  
  // 结果信息
  success: boolean;          // 操作是否成功
  errorMsg?: string;         // 错误信息（失败时记录）
  duration?: number;         // 操作耗时（毫秒）
  
  // 请求信息
  ip?: string;               // 客户端 IP 地址
  userAgent?: string;        // User-Agent
  referer?: string;          // 来源页面
  
  // 时间信息
  createdAt: Date;           // 创建时间
  
  // 附加信息
  metadata?: Record<string, any>; // 元数据（扩展字段）
}

/**
 * 操作类型枚举
 */
export enum OperationAction {
  // 用户操作
  USER_LOGIN = 'user:login',               // 用户登录
  USER_LOGOUT = 'user:logout',             // 用户登出
  USER_REGISTER = 'user:register',         // 用户注册
  USER_UPDATE = 'user:update',             // 更新用户信息
  USER_DELETE = 'user:delete',             // 删除用户
  
  // 钱包操作
  WALLET_RECHARGE = 'wallet:recharge',     // 充值
  WALLET_CONSUME = 'wallet:consume',       // 消费
  WALLET_REFUND = 'wallet:refund',         // 退款
  WALLET_TRANSFER = 'wallet:transfer',     // 转账
  
  // 对话操作
  CHAT_CREATE = 'chat:create',             // 创建对话
  CHAT_UPDATE = 'chat:update',             // 更新对话
  CHAT_DELETE = 'chat:delete',             // 删除对话
  CHAT_MESSAGE = 'chat:message',           // 发送消息
  
  // 应用操作
  APP_CREATE = 'app:create',               // 创建应用
  APP_UPDATE = 'app:update',               // 更新应用
  APP_DELETE = 'app:delete',               // 删除应用
  APP_PUBLISH = 'app:publish',             // 发布应用
  
  // 知识库操作
  DATASET_CREATE = 'dataset:create',       // 创建知识库
  DATASET_UPDATE = 'dataset:update',       // 更新知识库
  DATASET_DELETE = 'dataset:delete',       // 删除知识库
  DATASET_IMPORT = 'dataset:import',       // 导入数据
  
  // 团队操作
  TEAM_CREATE = 'team:create',             // 创建团队
  TEAM_UPDATE = 'team:update',             // 更新团队
  TEAM_DELETE = 'team:delete',             // 删除团队
  TEAM_MEMBER_ADD = 'team:member:add',     // 添加成员
  TEAM_MEMBER_REMOVE = 'team:member:remove', // 移除成员
  
  // 系统操作
  SYSTEM_CONFIG = 'system:config',         // 系统配置
  SYSTEM_BACKUP = 'system:backup',         // 系统备份
  SYSTEM_ERROR = 'system:error',           // 系统错误
}

const OperationLogSchema = new Schema({
  // 用户信息
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    index: true,
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'team',
    index: true,
  },
  tmbId: {
    type: Schema.Types.ObjectId,
    ref: 'team_member',
  },
  
  // 操作信息
  action: {
    type: String,
    required: true,
    index: true,
  },
  module: {
    type: String,
    required: true,
    index: true,
  },
  method: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  
  // 操作详情
  details: {
    type: Object,
    default: {},
  },
  params: {
    type: Object,
  },
  response: {
    type: Object,
  },
  
  // 结果信息
  success: {
    type: Boolean,
    required: true,
    default: true,
    index: true,
  },
  errorMsg: {
    type: String,
  },
  duration: {
    type: Number,
  },
  
  // 请求信息
  ip: {
    type: String,
    index: true,
  },
  userAgent: {
    type: String,
  },
  referer: {
    type: String,
  },
  
  // 时间信息
  createdAt: {
    type: Date,
    default: () => new Date(),
    index: true,
  },
  
  // 附加信息
  metadata: {
    type: Object,
    default: {},
  },
});

// 复合索引：查询用户的操作日志（按时间降序）
OperationLogSchema.index({ userId: 1, createdAt: -1 });
OperationLogSchema.index({ teamId: 1, createdAt: -1 });

// 复合索引：按模块和操作类型查询
OperationLogSchema.index({ module: 1, action: 1, createdAt: -1 });

// 复合索引：查询失败的操作
OperationLogSchema.index({ success: 1, createdAt: -1 });

// TTL 索引：自动清理 90 天前的日志（可选）
// OperationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const MongoOperationLog = (models['operation_log'] ||
  model('operation_log', OperationLogSchema)) as Model<OperationLogSchemaType>;
