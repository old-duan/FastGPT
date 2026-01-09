import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * 飞书调试接口 - 记录所有收到的请求
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query
  };

  // 打印到控制台
  console.log('\n========== FEISHU DEBUG ==========');
  console.log(JSON.stringify(logData, null, 2));
  console.log('===================================\n');

  // 写入日志文件
  const logPath = path.join(process.cwd(), 'feishu-debug.log');
  fs.appendFileSync(logPath, JSON.stringify(logData, null, 2) + '\n\n');

  // 处理 challenge 验证
  if (req.body?.challenge) {
    return res.status(200).json({ challenge: req.body.challenge });
  }

  // 返回成功
  return res.status(200).json({ code: 0, msg: 'ok' });
}
