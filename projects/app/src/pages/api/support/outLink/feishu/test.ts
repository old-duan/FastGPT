import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 飞书Webhook测试接口 - 最简化版本
 * URL: /api/support/outLink/feishu/test
 *
 * 绕过所有中间件，直接处理飞书challenge验证
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 记录请求信息
  console.log('[Feishu Test] Request received:', {
    method: req.method,
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    }
  });

  const body = req.body;

  // 飞书URL验证 - 直接返回challenge
  if (body?.challenge) {
    console.log('[Feishu Test] Challenge received:', body.challenge);

    // 直接返回，不做任何包装
    res.status(200).json({
      challenge: body.challenge
    });
    return;
  }

  // 其他请求返回成功
  res.status(200).json({
    code: 0,
    msg: 'ok'
  });
}
