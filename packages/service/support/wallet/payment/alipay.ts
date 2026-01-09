/**
 * 支付宝支付工具类
 * 封装支付宝 SDK，实现签名、验签、创建订单等功能
 */

import AlipaySdk from 'alipay-sdk';
import AlipayFormData from 'alipay-sdk/lib/form';

// 支付宝配置接口
interface AlipayConfig {
  appId: string;
  privateKey: string;
  alipayPublicKey: string;
  gateway?: string;
  charset?: string;
  signType?: string;
}

// 创建订单参数
export interface CreateOrderParams {
  orderId: string; // 商户订单号
  amount: number; // 支付金额（元）
  subject: string; // 订单标题
  body?: string; // 订单描述
  returnUrl?: string; // 同步回调地址
  notifyUrl?: string; // 异步通知地址
}

// 订单查询参数
export interface QueryOrderParams {
  orderId?: string; // 商户订单号
  tradeNo?: string; // 支付宝交易号
}

// 订单查询响应
export interface OrderQueryResponse {
  tradeNo: string; // 支付宝交易号
  orderId: string; // 商户订单号
  amount: string; // 交易金额
  tradeStatus: string; // 交易状态
  buyerLogonId?: string; // 买家支付宝账号
  buyerUserId?: string; // 买家用户 ID
  gmtPayment?: string; // 交易付款时间
}

/**
 * 支付宝支付服务类
 */
export class AlipayService {
  private alipaySdk: AlipaySdk;
  private config: AlipayConfig;

  constructor(config?: Partial<AlipayConfig>) {
    // 从环境变量读取配置
    this.config = {
      appId: config?.appId || process.env.ALIPAY_APP_ID || '',
      privateKey: config?.privateKey || process.env.ALIPAY_PRIVATE_KEY || '',
      alipayPublicKey: config?.alipayPublicKey || process.env.ALIPAY_PUBLIC_KEY || '',
      gateway:
        config?.gateway || process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
      charset: config?.charset || 'utf-8',
      signType: config?.signType || 'RSA2'
    };

    // 验证必要配置
    if (!this.config.appId || !this.config.privateKey || !this.config.alipayPublicKey) {
      throw new Error(
        '支付宝配置不完整，请检查环境变量 ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY'
      );
    }

    // 初始化支付宝 SDK
    this.alipaySdk = new AlipaySdk({
      appId: this.config.appId,
      privateKey: this.formatKey(this.config.privateKey, 'PRIVATE'),
      alipayPublicKey: this.formatKey(this.config.alipayPublicKey, 'PUBLIC'),
      gateway: this.config.gateway,
      charset: this.config.charset,
      signType: this.config.signType as 'RSA2'
    });
  }

  /**
   * 格式化密钥（添加头尾标记）
   */
  private formatKey(key: string, type: 'PRIVATE' | 'PUBLIC'): string {
    // 去除空格和换行符
    const cleanKey = key.replace(/\s/g, '');

    // 如果已经有头尾标记，直接返回
    if (cleanKey.includes('-----BEGIN')) {
      return cleanKey;
    }

    // 添加头尾标记
    const header =
      type === 'PRIVATE' ? '-----BEGIN RSA PRIVATE KEY-----' : '-----BEGIN PUBLIC KEY-----';
    const footer =
      type === 'PRIVATE' ? '-----END RSA PRIVATE KEY-----' : '-----END PUBLIC KEY-----';

    // 每 64 个字符换行
    const formattedKey = cleanKey.match(/.{1,64}/g)?.join('\n') || cleanKey;

    return `${header}\n${formattedKey}\n${footer}`;
  }

  /**
   * 创建支付订单（网页支付）
   * 返回 HTML 表单字符串，前端直接渲染即可跳转支付宝
   */
  async createPagePayOrder(params: CreateOrderParams): Promise<string> {
    const formData = new AlipayFormData();

    // 设置请求参数
    formData.setMethod('get'); // 使用 GET 方式，生成支付 URL

    // 设置业务参数
    formData.addField('bizContent', {
      out_trade_no: params.orderId, // 商户订单号
      product_code: 'FAST_INSTANT_TRADE_PAY', // 产品码（固定值）
      total_amount: params.amount.toFixed(2), // 交易金额（保留两位小数）
      subject: params.subject, // 订单标题
      body: params.body || params.subject // 订单描述
    });

    // 设置回调地址
    if (params.returnUrl) {
      formData.addField('returnUrl', params.returnUrl);
    }
    if (params.notifyUrl) {
      formData.addField('notifyUrl', params.notifyUrl);
    }

    try {
      // 调用 SDK 生成支付表单
      const result = await this.alipaySdk.exec('alipay.trade.page.pay', {}, { formData });

      return result;
    } catch (error: any) {
      console.error('创建支付宝订单失败:', error);
      throw new Error(`创建支付宝订单失败: ${error.message || '未知错误'}`);
    }
  }

  /**
   * 验证支付宝回调签名
   * @param params 支付宝回调参数（POST 或 GET）
   * @returns 验证是否通过
   */
  async verifyNotify(params: Record<string, any>): Promise<boolean> {
    try {
      // 使用 SDK 验证签名
      const result = this.alipaySdk.checkNotifySign(params);
      return result;
    } catch (error: any) {
      console.error('验证支付宝签名失败:', error);
      return false;
    }
  }

  /**
   * 查询订单状态
   */
  async queryOrder(params: QueryOrderParams): Promise<OrderQueryResponse | null> {
    if (!params.orderId && !params.tradeNo) {
      throw new Error('订单号（orderId）或支付宝交易号（tradeNo）至少提供一个');
    }

    try {
      const result = await this.alipaySdk.exec('alipay.trade.query', {
        bizContent: {
          out_trade_no: params.orderId, // 商户订单号
          trade_no: params.tradeNo // 支付宝交易号
        }
      });

      // 解析响应
      const response = JSON.parse(result);
      const data = response.alipay_trade_query_response;

      if (data.code === '10000') {
        // 查询成功
        return {
          tradeNo: data.trade_no,
          orderId: data.out_trade_no,
          amount: data.total_amount,
          tradeStatus: data.trade_status,
          buyerLogonId: data.buyer_logon_id,
          buyerUserId: data.buyer_user_id,
          gmtPayment: data.gmt_payment
        };
      } else if (data.code === '40004') {
        // 订单不存在
        return null;
      } else {
        throw new Error(`查询订单失败: ${data.sub_msg || data.msg}`);
      }
    } catch (error: any) {
      console.error('查询支付宝订单失败:', error);
      throw new Error(`查询支付宝订单失败: ${error.message || '未知错误'}`);
    }
  }

  /**
   * 关闭订单（取消未支付订单）
   */
  async closeOrder(params: QueryOrderParams): Promise<boolean> {
    if (!params.orderId && !params.tradeNo) {
      throw new Error('订单号（orderId）或支付宝交易号（tradeNo）至少提供一个');
    }

    try {
      const result = await this.alipaySdk.exec('alipay.trade.close', {
        bizContent: {
          out_trade_no: params.orderId,
          trade_no: params.tradeNo
        }
      });

      const response = JSON.parse(result);
      const data = response.alipay_trade_close_response;

      return data.code === '10000';
    } catch (error: any) {
      console.error('关闭支付宝订单失败:', error);
      return false;
    }
  }

  /**
   * 解析支付宝回调参数（POST 表单）
   */
  parseNotifyParams(body: any): Record<string, string> {
    const params: Record<string, string> = {};

    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        params[key] = String(body[key]);
      }
    }

    return params;
  }

  /**
   * 获取支付宝配置信息（用于前端）
   */
  getPublicConfig() {
    return {
      appId: this.config.appId,
      gateway: this.config.gateway,
      charset: this.config.charset,
      signType: this.config.signType
    };
  }
}

/**
 * 创建支付宝服务实例（单例模式）
 */
let alipayServiceInstance: AlipayService | null = null;

export function getAlipayService(): AlipayService {
  if (!alipayServiceInstance) {
    alipayServiceInstance = new AlipayService();
  }
  return alipayServiceInstance;
}

/**
 * 支付宝交易状态枚举
 */
export enum AlipayTradeStatus {
  WAIT_BUYER_PAY = 'WAIT_BUYER_PAY', // 交易创建，等待买家付款
  TRADE_CLOSED = 'TRADE_CLOSED', // 未付款交易超时关闭，或支付完成后全额退款
  TRADE_SUCCESS = 'TRADE_SUCCESS', // 交易支付成功
  TRADE_FINISHED = 'TRADE_FINISHED' // 交易结束，不可退款
}
