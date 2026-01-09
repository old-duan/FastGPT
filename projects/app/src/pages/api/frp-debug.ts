import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * FRP调试接口 - 记录所有请求细节
 * URL: /api/frp-debug
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = new Date().toISOString();

  // 详细记录请求信息
  const debugInfo = {
    timestamp,
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    rawBody: typeof req.body,
    query: req.query,
    hasChallenge: !!req.body?.challenge,
    challengeValue: req.body?.challenge || 'NOT_FOUND'
  };

  // 写入日志文件
  const logFile = path.join(process.cwd(), 'frp-debug.log');
  try {
    fs.appendFileSync(logFile, JSON.stringify(debugInfo, null, 2) + '\n---\n');
    console.log('[FRP-DEBUG]', JSON.stringify(debugInfo));
  } catch (e) {
    console.error('Log write error:', e);
  }

  // 设置响应头 - 明确指定
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Debug-Time', timestamp);
  res.setHeader('X-Debug-HasBody', String(!!req.body));
  res.setHeader('X-Debug-HasChallenge', String(!!req.body?.challenge));

  // 如果有challenge，返回它
  if (req.body?.challenge) {
    const response = { challenge: req.body.challenge };
    console.log('[FRP-DEBUG] Responding with challenge:', response);
    res.status(200).end(JSON.stringify(response));
    return;
  }

  // 没有challenge时，返回调试信息
  const response = {
    code: 0,
    msg: 'ok',
    debug: {
      receivedBody: req.body,
      bodyType: typeof req.body,
      hasChallenge: false
    }
  };
  res.status(200).end(JSON.stringify(response));
}

// 确保body被正确解析
export const config = {
  api: {
    bodyParser: true
  }
};
