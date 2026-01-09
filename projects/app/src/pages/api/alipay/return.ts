/**
 * 支付宝同步返回 API
 * GET /api/alipay/return
 * 功能：处理支付宝支付成功后的同步跳转，重定向到余额页面
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAlipayService } from '@fastgpt/service/support/wallet/payment/alipay';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.redirect('/account/balance?error=invalid_method');
    }

    console.log('收到支付宝同步返回:', req.query);

    // 解析支付宝回调参数
    const alipayService = getAlipayService();
    const params = req.query as Record<string, string>;

    // 验证签名
    const isValid = await alipayService.verifyNotify(params);
    if (!isValid) {
      console.error('支付宝签名验证失败');
      return res.redirect('/account/balance?error=invalid_sign');
    }

    // 提取订单号
    const { out_trade_no: orderId, trade_status: tradeStatus } = params;

    // 根据支付状态跳转
    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      // 支付成功，跳转到余额页面
      console.log('支付成功，重定向到余额页面:', orderId);
      return res.redirect(`/account/balance?success=true&orderId=${orderId}`);
    } else {
      // 支付失败或其他状态
      console.log('支付未完成:', tradeStatus);
      return res.redirect(`/account/balance?error=payment_failed&orderId=${orderId}`);
    }
  } catch (error: any) {
    console.error('处理支付宝同步返回失败:', error);
    return res.redirect('/account/balance?error=unknown');
  }
}
