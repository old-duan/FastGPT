/**
 * 创建支付订单 API
 * POST /api/payment/create
 * 功能：生成支付宝支付订单，返回支付表单 HTML
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getAlipayService } from '@fastgpt/service/support/wallet/payment/alipay';
import { MongoPaymentOrder } from '@fastgpt/service/support/wallet/schema';
import { MongoOperationLog, OperationAction } from '@fastgpt/service/support/wallet/schema';

// 充值金额预设选项（元）
const RECHARGE_AMOUNTS = [10, 50, 100, 200, 500, 1000];

// 积分兑换比例（1 元 = 100 积分）
const POINTS_PER_YUAN = 100;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return jsonRes(res, {
        code: 405,
        error: '请求方法错误'
      });
    }

    // 身份验证
    const { tmbId, userId, teamId } = await authCert({
      req,
      authToken: true
    });

    // 解析请求参数
    const { amount, paymentMethod } = req.body as {
      amount: number;
      paymentMethod: 'alipay' | 'wechat';
    };

    // 参数验证
    if (!amount || amount <= 0) {
      return jsonRes(res, {
        code: 400,
        error: '充值金额必须大于 0'
      });
    }

    if (amount > 10000) {
      return jsonRes(res, {
        code: 400,
        error: '单次充值金额不能超过 10000 元'
      });
    }

    if (paymentMethod !== 'alipay') {
      return jsonRes(res, {
        code: 400,
        error: '暂时只支持支付宝支付'
      });
    }

    // 生成订单号（格式：FGP + 时间戳 + 随机数）
    const orderId = `FGP${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 计算积分
    const points = Math.floor(amount * POINTS_PER_YUAN);

    // 创建订单记录
    const order = await MongoPaymentOrder.create({
      orderId,
      userId,
      teamId,
      tmbId,
      amount,
      points,
      status: 'pending',
      paymentMethod,
      paymentChannel: 'web',
      paymentParams: JSON.stringify({
        amount,
        paymentMethod,
        userAgent: req.headers['user-agent']
      }),
      createdAt: new Date(),
      expiredAt: new Date(Date.now() + 30 * 60 * 1000), // 30 分钟后过期
      notifyRetryCount: 0
    });

    // 记录操作日志
    await MongoOperationLog.create({
      userId,
      teamId,
      tmbId,
      action: OperationAction.WALLET_RECHARGE,
      module: 'wallet',
      method: 'POST',
      path: '/api/payment/create',
      details: {
        orderId,
        amount,
        points,
        paymentMethod
      },
      success: true,
      ip: req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      createdAt: new Date()
    });

    // 调用支付宝 SDK 生成支付表单
    const alipayService = getAlipayService();

    const paymentForm = await alipayService.createPagePayOrder({
      orderId,
      amount,
      subject: `FastGPT 充值 - ${amount} 元`,
      body: `为账号充值 ${amount} 元（${points} 积分）`,
      returnUrl:
        process.env.ALIPAY_RETURN_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/api/alipay/return`,
      notifyUrl:
        process.env.ALIPAY_NOTIFY_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/api/alipay/notify`
    });

    // 返回支付表单 HTML
    return jsonRes(res, {
      data: {
        orderId,
        amount,
        points,
        paymentForm, // 前端直接渲染这个 HTML 即可跳转支付宝
        expiredAt: order.expiredAt
      }
    });
  } catch (error: any) {
    console.error('创建支付订单失败:', error);

    // 记录失败日志
    try {
      const { userId, teamId, tmbId } = await authCert({
        req,
        authToken: true
      });

      await MongoOperationLog.create({
        userId,
        teamId,
        tmbId,
        action: OperationAction.WALLET_RECHARGE,
        module: 'wallet',
        method: 'POST',
        path: '/api/payment/create',
        details: {
          amount: req.body.amount,
          paymentMethod: req.body.paymentMethod
        },
        success: false,
        errorMsg: error.message,
        ip: req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        createdAt: new Date()
      });
    } catch (logError) {
      console.error('记录操作日志失败:', logError);
    }

    return jsonRes(res, {
      code: 500,
      error: error.message || '创建支付订单失败'
    });
  }
}
