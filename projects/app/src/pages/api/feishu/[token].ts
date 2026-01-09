import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { MongoOutLink } from '@fastgpt/service/support/outLink/schema';
import { MongoApp } from '@fastgpt/service/core/app/schema';
import { addLog } from '@fastgpt/service/common/system/log';
import { dispatchWorkFlow } from '@fastgpt/service/core/workflow/dispatch';
import { getAppLatestVersion } from '@fastgpt/service/core/app/version/controller';
import {
  getWorkflowEntryNodeIds,
  storeEdges2RuntimeEdges,
  storeNodes2RuntimeNodes
} from '@fastgpt/global/core/workflow/runtime/utils';
import { getRunningUserInfoByTmbId } from '@fastgpt/service/support/user/team/utils';
import { UsageSourceEnum } from '@fastgpt/global/support/wallet/usage/constants';
import { ChatItemValueTypeEnum } from '@fastgpt/global/core/chat/constants';
import type { UserChatItemValueItemType } from '@fastgpt/global/core/chat/type';

const FEISHU_API_URL = 'https://open.feishu.cn';

// 已处理的事件ID缓存（防止重复处理）
const processedEvents = new Set<string>();

// 移除引用标记（用于外部渠道如飞书、API等）
// 匹配格式: [xxxx](CITE) 或 [xxxx](CITE)
function removeAICiteMark(text: string): string {
  // 移除 [id](CITE) 格式的引用标记
  return text.replace(/\[[a-f0-9]+\]\(CITE\)/gi, '').trim();
}

// 发送飞书消息
async function sendFeishuMessage(params: {
  appId: string;
  appSecret: string;
  openId: string;
  content: string;
}) {
  const { appId, appSecret, openId, content } = params;

  // 获取 token
  const tokenRes = await axios.post(
    `${FEISHU_API_URL}/open-apis/auth/v3/tenant_access_token/internal`,
    {
      app_id: appId,
      app_secret: appSecret
    }
  );

  if (tokenRes.data.code !== 0) {
    throw new Error(`获取token失败: ${tokenRes.data.msg}`);
  }

  // 发送消息
  const msgRes = await axios.post(
    `${FEISHU_API_URL}/open-apis/im/v1/messages?receive_id_type=open_id`,
    {
      receive_id: openId,
      msg_type: 'text',
      content: JSON.stringify({ text: content })
    },
    {
      headers: {
        Authorization: `Bearer ${tokenRes.data.tenant_access_token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return msgRes.data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;
  const body = req.body;

  console.log('\n[Feishu] Request received:', JSON.stringify(body, null, 2));

  try {
    // 1. URL验证
    if (body?.challenge) {
      console.log('[Feishu] Challenge verification');
      return res.status(200).json({ challenge: body.challenge });
    }

    // 2. 处理消息事件
    if (body?.header?.event_type === 'im.message.receive_v1') {
      const eventId = body.header.event_id;

      // 防止重复处理
      if (processedEvents.has(eventId)) {
        console.log('[Feishu] Duplicate event, skipping:', eventId);
        return res.status(200).json({ code: 0, msg: 'ok' });
      }
      processedEvents.add(eventId);

      // 清理旧事件（保留最近1000个）
      if (processedEvents.size > 1000) {
        const arr = Array.from(processedEvents);
        arr.slice(0, 500).forEach((id) => processedEvents.delete(id));
      }

      const event = body.event;
      const message = event.message;
      const senderOpenId = event.sender.sender_id.open_id;

      console.log('[Feishu] Message from:', senderOpenId);
      console.log('[Feishu] Content:', message.content);

      // 只处理文本消息
      if (message.message_type !== 'text') {
        console.log('[Feishu] Not a text message, skipping');
        return res.status(200).json({ code: 0, msg: 'ok' });
      }

      // 获取outLink配置
      const outLink = await MongoOutLink.findOne({ shareId: token }).lean();
      if (!outLink) {
        console.log('[Feishu] OutLink not found:', token);
        return res.status(200).json({ code: 0, msg: 'ok' });
      }

      // 获取飞书配置
      const feishuAppId = (outLink as any).app?.appId || process.env.FEISHU_APP_ID;
      const feishuAppSecret = (outLink as any).app?.appSecret || process.env.FEISHU_APP_SECRET;

      if (!feishuAppId || !feishuAppSecret) {
        console.log('[Feishu] Missing appId or appSecret');
        return res.status(200).json({ code: 0, msg: 'ok' });
      }

      // 解析用户消息
      const messageContent = JSON.parse(message.content);
      const userMessage = messageContent.text || '';

      console.log('[Feishu] User message:', userMessage);

      // 立即返回响应，防止飞书超时
      res.status(200).json({ code: 0, msg: 'ok' });

      // 异步处理消息并回复
      (async () => {
        try {
          // 获取应用信息
          const app = await MongoApp.findById(outLink.appId).lean();
          if (!app) {
            console.log('[Feishu] App not found:', outLink.appId);
            return;
          }
          console.log('[Feishu] App:', app.name);

          // 获取应用的最新版本（包含节点和边配置）
          const { nodes, edges, chatConfig } = await getAppLatestVersion(app._id, app);

          console.log('[Feishu] Got app version, nodes:', nodes.length, 'edges:', edges.length);

          // 将节点和边转换为运行时格式
          const runtimeNodes = storeNodes2RuntimeNodes(nodes, getWorkflowEntryNodeIds(nodes));
          const runtimeEdges = storeEdges2RuntimeEdges(edges);

          // 获取用户运行信息
          const runningUserInfo = await getRunningUserInfoByTmbId(app.tmbId);

          // 构建用户问题
          const query: UserChatItemValueItemType[] = [
            {
              type: ChatItemValueTypeEnum.text,
              text: {
                content: userMessage
              }
            }
          ];

          console.log('[Feishu] Calling dispatchWorkFlow...');

          // 直接调用工作流，绕过商业版接口
          const { flowResponses, assistantResponses } = await dispatchWorkFlow({
            mode: 'chat',
            usageSource: UsageSourceEnum.share,
            runningAppInfo: {
              id: String(app._id),
              name: app.name,
              teamId: String(app.teamId),
              tmbId: String(app.tmbId)
            },
            runningUserInfo,
            uid: senderOpenId,
            chatId: `feishu_${senderOpenId}`,
            runtimeNodes,
            runtimeEdges,
            variables: {},
            query,
            chatConfig,
            histories: [],
            stream: false,
            maxRunTimes: 200
          });

          console.log('[Feishu] Workflow completed, flowResponses:', flowResponses?.length || 0);

          // 从响应中提取AI回复文本
          let replyText = '';
          if (assistantResponses && Array.isArray(assistantResponses)) {
            for (const item of assistantResponses) {
              if (item.type === ChatItemValueTypeEnum.text && item.text?.content) {
                replyText += item.text.content;
              }
            }
          }

          // 如果没有从 assistantResponses 获取到，尝试从 flowResponses 获取
          if (!replyText && flowResponses && Array.isArray(flowResponses)) {
            for (const item of flowResponses) {
              if (item.moduleType === 'chatNode' && item.textOutput) {
                replyText += item.textOutput;
              }
            }
          }

          if (!replyText) {
            replyText = '抱歉，我没有获取到有效的回复。';
          }

          // 移除引用标记（外部渠道不需要显示）
          replyText = removeAICiteMark(replyText);

          console.log('[Feishu] Reply:', replyText.substring(0, 100) + '...');

          // 发送回复
          await sendFeishuMessage({
            appId: feishuAppId,
            appSecret: feishuAppSecret,
            openId: senderOpenId,
            content: replyText
          });

          console.log('[Feishu] Reply sent successfully');
        } catch (error: any) {
          console.error('[Feishu] Error processing message:', error.message);
          console.error('[Feishu] Error stack:', error.stack);

          // 发送错误消息
          try {
            await sendFeishuMessage({
              appId: feishuAppId,
              appSecret: feishuAppSecret,
              openId: senderOpenId,
              content: `抱歉，处理您的消息时出现了错误: ${error.message}`
            });
          } catch (e) {
            console.error('[Feishu] Failed to send error message:', e);
          }
        }
      })();

      return; // 已经发送了响应
    }

    // 其他事件
    return res.status(200).json({ code: 0, msg: 'ok' });
  } catch (error: any) {
    console.error('[Feishu] Handler error:', error.message);
    return res.status(200).json({ code: 0, msg: 'ok' });
  }
}
