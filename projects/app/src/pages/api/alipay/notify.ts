/**
 * 支付宝异步通知回调 API
 * POST /api/alipay/notify
 * 功能：接收支付宝支付成功后的异步通知，更新订单状态和用户余额
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getAlipayService,
  AlipayTradeStatus
} from '@fastgpt/service/support/wallet/payment/alipay';
import { MongoPaymentOrder } from '@fastgpt/service/support/wallet/schema';
import { MongoOperationLog, OperationAction } from '@fastgpt/service/support/wallet/schema';
import { MongoTeam } from '@fastgpt/service/support/user/team/teamSchema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    console.log('收到支付宝回调通知:', req.body);

    // 解析支付宝回调参数
    const alipayService = getAlipayService();
    const params = alipayService.parseNotifyParams(req.body);

    // 验证签名
    const isValid = await alipayService.verifyNotify(params);
    if (!isValid) {
      console.error('支付宝签名验证失败');
      return res.status(400).send('fail');
    }

    // 提取关键信息
    const {
      out_trade_no: orderId, // 商户订单号
      trade_no: tradeNo, // 支付宝交易号
      trade_status: tradeStatus, // 交易状态
      total_amount: totalAmount, // 交易金额
      buyer_logon_id: buyerLogonId, // 买家支付宝账号
      buyer_id: buyerId, // 买家用户 ID
      gmt_payment: gmtPayment // 交易付款时间
    } = params;

    // 查询订单
    const order = await MongoPaymentOrder.findOne({ orderId });
    if (!order) {
      console.error('订单不存在:', orderId);
      return res.status(404).send('fail');
    }

    // 验证金额是否一致
    if (parseFloat(totalAmount) !== order.amount) {
      console.error('订单金额不一致:', { expected: order.amount, actual: totalAmount });
      return res.status(400).send('fail');
    }

    // 处理不同的交易状态
    if (
      tradeStatus === AlipayTradeStatus.TRADE_SUCCESS ||
      tradeStatus === AlipayTradeStatus.TRADE_FINISHED
    ) {
      // 支付成功，更新订单状态
      if (order.status === 'pending') {
        // 更新订单状态
        await MongoPaymentOrder.updateOne(
          { _id: order._id },
          {
            $set: {
              status: 'success',
              tradeNo,
              notifyData: JSON.stringify(params),
              notifyTime: new Date(),
              paidAt: new Date(gmtPayment)
            },
            $inc: {
              notifyRetryCount: 1
            }
          }
        );

        // 更新团队余额（积分）
        await MongoTeam.updateOne(
          { _id: order.teamId },
          {
            $inc: {
              balance: order.points // 增加积分
            }
          }
        );

        // 记录操作日志
        await MongoOperationLog.create({
          userId: order.userId,
          teamId: order.teamId,
          tmbId: order.tmbId,
          action: OperationAction.WALLET_RECHARGE,
          module: 'wallet',
          method: 'POST',
          path: '/api/alipay/notify',
          details: {
            orderId,
            tradeNo,
            amount: order.amount,
            points: order.points,
            tradeStatus,
            buyerLogonId
          },
          success: true,
          ip:
            req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          createdAt: new Date()
        });

        console.log('支付成功，已更新订单和余额:', {
          orderId,
          tradeNo,
          amount: order.amount,
          points: order.points
        });
      } else {
        console.log('订单已处理过，跳过:', orderId);
      }

      // 返回 success 告诉支付宝处理成功
      return res.status(200).send('success');
    } else if (tradeStatus === AlipayTradeStatus.TRADE_CLOSED) {
      // 交易关闭
      await MongoPaymentOrder.updateOne(
        { _id: order._id },
        {
          $set: {
            status: 'closed',
            tradeNo,
            notifyData: JSON.stringify(params),
            notifyTime: new Date()
          },
          $inc: {
            notifyRetryCount: 1
          }
        }
      );

      console.log('订单已关闭:', orderId);
      return res.status(200).send('success');
    } else {
      // 其他状态，暂不处理
      console.log('收到其他状态的通知:', tradeStatus);
      return res.status(200).send('success');
    }
  } catch (error: any) {
    console.error('处理支付宝回调失败:', error);

    // 返回 fail，支付宝会重试
    return res.status(500).send('fail');
  }
}

// 禁用 Next.js 的 body parser，因为需要原始 body 验证签名
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};
