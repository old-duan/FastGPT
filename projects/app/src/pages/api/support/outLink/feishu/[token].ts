import type { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { POST } from '@fastgpt/service/common/api/plusRequest';
import { NextAPI } from '@/service/middleware/entry';
import { FastGPTProUrl } from '@fastgpt/service/common/system/constants';
import { addLog } from '@fastgpt/service/common/system/log';
import { authOutLinkInit } from '@/service/support/permission/auth/outLink';
import { pushChatUsage } from '@/service/support/wallet/usage/push';
import { getUserChatInfoAndAuthTeamPoints } from '@/service/support/permission/auth/team';
import { createChatMessages, getChatMessages } from '@fastgpt/service/core/chat/controller';
import { MongoOutLink } from '@fastgpt/service/support/outLink/schema';
import { ChatRoleEnum, ChatSourceEnum } from '@fastgpt/global/core/chat/constants';
import { dispatchWorkFlow } from '@fastgpt/service/core/workflow/dispatch';
import { ChatItemType } from '@fastgpt/global/core/chat/type';
import { getAppLatestVersion } from '@fastgpt/service/core/app/version/controller';
import axios from 'axios';

export type OutLinkFeishuQuery = {
  token: string;
};
export type OutLinkFeishuBody = any;
export type OutLinkFeishuResponse = any;

/**
 * 飞书机器人Webhook处理
 *
 * 处理流程：
 * 1. URL验证（challenge）- 飞书配置Webhook时的验证
 * 2. 消息事件处理 - 本地处理或转发到商业版
 *
 * 文档参考:
 * - https://open.feishu.cn/document/server-docs/event-subscription-guide/event-subscription-configure-/request-url-configuration-case
 * - https://doc.fastgpt.io/docs/use-cases/external-integration/feishu
 */

// 飞书API基础地址
const FEISHU_API_URL = process.env.FEISHU_API_URL || 'https://open.feishu.cn';

// 发送飞书消息
async function sendFeishuMessage(params: {
  appId: string;
  appSecret: string;
  messageType: 'text' | 'post' | 'image';
  receiveIdType: 'open_id' | 'user_id' | 'union_id' | 'email' | 'chat_id';
  receiveId: string;
  content: string;
}) {
  const { appId, appSecret, messageType, receiveIdType, receiveId, content } = params;

  try {
    // 1. 获取 tenant_access_token
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

    const accessToken = tokenRes.data.tenant_access_token;

    // 2. 发送消息
    const msgRes = await axios.post(
      `${FEISHU_API_URL}/open-apis/im/v1/messages`,
      {
        receive_id: receiveId,
        msg_type: messageType,
        content: JSON.stringify({ text: content })
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          receive_id_type: receiveIdType
        }
      }
    );

    if (msgRes.data.code !== 0) {
      throw new Error(`发送消息失败: ${msgRes.data.msg}`);
    }

    return msgRes.data;
  } catch (error: any) {
    addLog.error('[Feishu] Send message error', error);
    throw error;
  }
}

async function handler(
  req: ApiRequestProps<OutLinkFeishuBody, OutLinkFeishuQuery>,
  res: ApiResponseType<any>
): Promise<any> {
  const { token } = req.query;
  const body = req.body;

  // 记录所有收到的请求
  console.log('\n========== FEISHU REQUEST ==========');
  console.log('Token:', token);
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(body, null, 2));
  console.log('=====================================\n');

  addLog.info('[Feishu] Request received', {
    token,
    method: req.method,
    hasBody: !!body,
    bodyKeys: body ? Object.keys(body) : [],
    eventType: body?.header?.event_type
  });

  try {
    // 1. 处理飞书URL验证请求
    if (body?.challenge) {
      addLog.info('[Feishu] URL verification challenge received', {
        token,
        challenge: body.challenge
      });

      res.status(200).json({
        challenge: body.challenge
      });
      return;
    }

    // 2. 处理加密事件（如果配置了Encrypt Key）
    if (body?.encrypt) {
      addLog.info('[Feishu] Encrypted event received', { token });
      if (FastGPTProUrl) {
        const result = await POST<any>(`/support/outLink/feishu/${token}`, body, {
          headers: req.headers as any
        });
        return result;
      } else {
        addLog.warn('[Feishu] Encrypted events not supported without pro API');
        return { code: 0, msg: 'ok' };
      }
    }

    // 3. 处理接收消息事件 (im.message.receive_v1)
    if (body?.header?.event_type === 'im.message.receive_v1') {
      const event = body.event;
      const message = event.message;

      addLog.info('[Feishu] Message received', {
        token,
        messageId: message.message_id,
        messageType: message.message_type,
        chatType: message.chat_type
      });

      // 如果有商业版API，转发处理
      if (FastGPTProUrl) {
        try {
          const result = await POST<any>(`/support/outLink/feishu/${token}`, body, {
            headers: req.headers as any
          });
          return result;
        } catch (error) {
          addLog.error('[Feishu] Pro API error, fallback to local processing', error);
        }
      }

      // 本地处理消息
      try {
        // 获取外链配置
        const outLink = await MongoOutLink.findOne({ shareId: token });
        if (!outLink) {
          addLog.error('[Feishu] OutLink not found', { token });
          return { code: 0, msg: 'ok' };
        }

        // 获取飞书配置 (优先使用outLink.app，其次使用环境变量)
        let appId = outLink.app?.appId || process.env.FEISHU_APP_ID;
        let appSecret = outLink.app?.appSecret || process.env.FEISHU_APP_SECRET;

        if (!appId || !appSecret) {
          addLog.error('[Feishu] Missing appId or appSecret', {
            token,
            hasOutLinkApp: !!outLink.app,
            hasEnvAppId: !!process.env.FEISHU_APP_ID,
            hasEnvAppSecret: !!process.env.FEISHU_APP_SECRET
          });
          return { code: 0, msg: 'ok' };
        }

        // 只处理文本消息
        if (message.message_type !== 'text') {
          await sendFeishuMessage({
            appId,
            appSecret,
            messageType: 'text',
            receiveIdType: 'open_id',
            receiveId: event.sender.sender_id.open_id,
            content: '抱歉，我目前只能处理文本消息'
          });
          return { code: 0, msg: 'ok' };
        }

        // 解析消息内容
        const messageContent = JSON.parse(message.content);
        const userMessage = messageContent.text || '';

        addLog.info('[Feishu] Processing user message', {
          token,
          message: userMessage.substring(0, 100)
        });

        // 获取应用信息
        const { app } = await authOutLinkInit({
          outLinkUid: event.sender.sender_id.open_id,
          shareId: token,
          ip: req.headers['x-real-ip'] as string
        });

        // 获取应用版本
        const { nodes } = await getAppLatestVersion(app._id, app);

        // 调用 FastGPT 获取回复
        const { responseData } = await dispatchWorkFlow({
          res,
          appId: app._id,
          chatId: event.sender.sender_id.open_id, // 使用 open_id 作为 chatId
          teamId: app.teamId,
          tmbId: app.tmbId,
          user: await getUserChatInfoAndAuthTeamPoints(app.tmbId),
          histories: [],
          variables: {},
          stream: false,
          detail: false,
          maxRunTimes: 200,
          appType: app.type,
          chatConfig: undefined,
          appName: app.name,
          systemParams: {
            userMessages: [{ content: userMessage, role: ChatRoleEnum.Human }]
          },
          startParams: {}
        });

        // 提取AI回复
        let replyText = '';
        for (const item of responseData) {
          if (item.moduleType === 'chatNode' && item.textOutput) {
            replyText += item.textOutput;
          }
        }

        if (!replyText) {
          replyText = '抱歉，我没有获取到有效的回复';
        }

        // 发送回复到飞书
        await sendFeishuMessage({
          appId,
          appSecret,
          messageType: 'text',
          receiveIdType: 'open_id',
          receiveId: event.sender.sender_id.open_id,
          content: replyText
        });

        addLog.info('[Feishu] Reply sent successfully', {
          token,
          replyLength: replyText.length
        });

        return { code: 0, msg: 'ok' };
      } catch (error: any) {
        addLog.error('[Feishu] Message processing error', {
          token,
          error: error.message,
          stack: error.stack
        });
        return { code: 0, msg: 'ok' };
      }
    }

    // 4. 其他事件类型
    if (body?.header?.event_type) {
      addLog.info('[Feishu] Other event received', {
        token,
        eventType: body.header.event_type
      });
    }

    return { code: 0, msg: 'ok' };
  } catch (error) {
    addLog.error('[Feishu] Request handling error', {
      token,
      error: error instanceof Error ? error.message : String(error)
    });

    throw error;
  }
}

export default NextAPI(handler);
