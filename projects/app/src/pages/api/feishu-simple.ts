import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * 飞书最简化测试接口
 * URL: /api/feishu-simple
 *
 * 完全独立，无任何依赖
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 记录到文件
  const logFile = path.join(process.cwd(), 'feishu-requests.log');
  const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url}\nHeaders: ${JSON.stringify(req.headers, null, 2)}\nBody: ${JSON.stringify(req.body, null, 2)}\n${'='.repeat(50)}\n`;

  try {
    fs.appendFileSync(logFile, logEntry);
  } catch (e) {
    console.error('Failed to write log:', e);
  }

  console.log('[FEISHU-SIMPLE] Request:', req.method, req.body);

  // 设置响应头
  res.setHeader('Content-Type', 'application/json');

  // 直接检查body中的challenge
  const challenge = req.body?.challenge;

  if (challenge) {
    console.log('[FEISHU-SIMPLE] Returning challenge:', challenge);
    // 最直接的返回方式
    res.status(200).send(JSON.stringify({ challenge: challenge }));
    return;
  }

  // 默认响应
  res.status(200).send(JSON.stringify({ code: 0, msg: 'ok' }));
}

// 禁用body解析限制
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};
