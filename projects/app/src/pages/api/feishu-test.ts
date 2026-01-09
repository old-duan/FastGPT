/**
 * 最简飞书测试接口 - 不使用任何中间件
 */
export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req: any, res: any) {
  const timestamp = new Date().toISOString();

  // 记录所有请求
  console.log(`\n[${timestamp}] ===== FEISHU TEST =====`);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('=================================\n');

  // 如果是 challenge 验证
  if (req.body?.challenge) {
    console.log('Challenge detected, returning:', req.body.challenge);
    return res.status(200).json({ challenge: req.body.challenge });
  }

  // 如果是消息事件
  if (req.body?.header?.event_type === 'im.message.receive_v1') {
    console.log('MESSAGE RECEIVED!');
    console.log('Sender:', req.body.event?.sender?.sender_id);
    console.log('Message:', req.body.event?.message);
  }

  return res.status(200).json({ code: 0, msg: 'ok' });
}
