import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 飞书Webhook - 兼容所有情况
 * URL: /api/feishu-webhook
 *
 * 处理各种可能的请求格式
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 记录原始请求
  console.log('[FEISHU-WEBHOOK] ===== New Request =====');
  console.log('[FEISHU-WEBHOOK] Method:', req.method);
  console.log('[FEISHU-WEBHOOK] Content-Type:', req.headers['content-type']);
  console.log('[FEISHU-WEBHOOK] Body type:', typeof req.body);
  console.log('[FEISHU-WEBHOOK] Body:', JSON.stringify(req.body));

  // 设置响应头
  res.setHeader('Content-Type', 'application/json');

  let body = req.body;

  // 如果body是字符串，尝试解析
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
      console.log('[FEISHU-WEBHOOK] Parsed string body:', body);
    } catch (e) {
      console.log('[FEISHU-WEBHOOK] Failed to parse body as JSON');
    }
  }

  // 检查各种可能的challenge位置
  let challenge = null;

  // 1. 直接在body中
  if (body?.challenge) {
    challenge = body.challenge;
    console.log('[FEISHU-WEBHOOK] Found challenge in body:', challenge);
  }

  // 2. 可能在嵌套结构中
  if (!challenge && body?.event?.challenge) {
    challenge = body.event.challenge;
    console.log('[FEISHU-WEBHOOK] Found challenge in body.event:', challenge);
  }

  // 3. 检查是否是加密的请求
  if (body?.encrypt) {
    console.log('[FEISHU-WEBHOOK] Encrypted request detected');
    // 加密请求需要解密，这里先返回错误提示
    res.status(200).json({
      code: -1,
      msg: '请在飞书后台关闭"Encrypt Key"加密配置后重试'
    });
    return;
  }

  // 如果找到challenge，返回它
  if (challenge) {
    console.log('[FEISHU-WEBHOOK] Returning challenge:', challenge);
    res.status(200).json({ challenge: challenge });
    return;
  }

  // 处理事件回调
  if (body?.header?.event_type) {
    console.log('[FEISHU-WEBHOOK] Event received:', body.header.event_type);
    res.status(200).json({ code: 0, msg: 'success' });
    return;
  }

  // 默认响应
  console.log('[FEISHU-WEBHOOK] Unknown request, returning ok');
  res.status(200).json({
    code: 0,
    msg: 'ok',
    received: body
  });
}

// 配置
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};
