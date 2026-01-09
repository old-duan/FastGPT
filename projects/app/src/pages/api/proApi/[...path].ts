import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';

import { Agent, request } from 'http';
import { FastGPTProUrl } from '@fastgpt/service/common/system/constants';

// Mock数据定义 - 为开源版本提供商业版功能的fallback
const mockResponses: Record<string, any> = {
  // ==================== 协作者管理 ====================
  'core/dataset/collaborator/list': {
    code: 200,
    data: {
      collaborators: []
    }
  },
  'core/app/collaborator/list': {
    code: 200,
    data: {
      collaborators: []
    }
  },

  // ==================== 标签管理 ====================
  'core/dataset/tag/getAllTags': {
    code: 200,
    data: {
      list: []
    }
  },
  'core/dataset/tag/list': {
    code: 200,
    data: {
      total: 0,
      list: []
    }
  },
  'core/dataset/tag/tagUsage': {
    code: 200,
    data: []
  },
  'core/dataset/tag/create': {
    code: 200,
    data: { tagId: 'mock-tag-id' }
  },
  'core/dataset/tag/update': {
    code: 200,
    data: null
  },
  'core/dataset/tag/delete': {
    code: 200,
    data: null
  },
  'core/dataset/tag/addToCollections': {
    code: 200,
    data: null
  },

  // ==================== 用户通知 ====================
  'support/user/inform/getSystemMsgModal': {
    code: 200,
    data: {
      hasMsg: false,
      message: null
    }
  },
  'support/user/inform/getOperationalAd': {
    code: 200,
    data: {
      hasAd: false,
      ad: null
    }
  },
  'support/user/inform/list': {
    code: 200,
    data: {
      total: 0,
      list: []
    }
  },
  'support/user/inform/read': {
    code: 200,
    data: null
  },
  'support/user/inform/countUnread': {
    code: 200,
    data: { count: 0 }
  },
  'support/user/inform/sendAuthCode': {
    code: 200,
    data: null
  },

  // ==================== 团队管理 ====================
  'support/user/team/list': {
    code: 200,
    data: []
  },
  'support/user/team/create': {
    code: 200,
    data: 'mock-team-id'
  },
  'support/user/team/switch': {
    code: 200,
    data: 'mock-team-id'
  },
  'support/user/team/tag/list': {
    code: 200,
    data: []
  },
  'support/user/team/tag/async': {
    code: 200,
    data: []
  },
  'support/user/team/plan/getTeamPlans': {
    code: 200,
    data: []
  },
  'support/user/team/invoiceAccount/getTeamInvoiceHeader': {
    code: 200,
    data: null
  },
  'support/user/team/invoiceAccount/update': {
    code: 200,
    data: null
  },
  'support/user/team/updateNotificationAccount': {
    code: 200,
    data: null
  },

  // ==================== 团队成员 ====================
  'support/user/team/member/list': {
    code: 200,
    data: {
      total: 0,
      list: []
    }
  },
  'support/user/team/member/count': {
    code: 200,
    data: { count: 1 }
  },
  'support/user/team/member/updateNameByManager': {
    code: 200,
    data: null
  },
  'support/user/team/member/updateName': {
    code: 200,
    data: null
  },
  'support/user/team/member/delete': {
    code: 200,
    data: null
  },
  'support/user/team/member/updateInvite': {
    code: 200,
    data: null
  },
  'support/user/team/member/restore': {
    code: 200,
    data: null
  },
  'support/user/team/member/leave': {
    code: 200,
    data: null
  },
  'support/user/team/member/export': {
    code: 200,
    data: { csv: '' }
  },

  // ==================== 邀请链接 ====================
  'support/user/team/invitationLink/create': {
    code: 200,
    data: 'mock-link-id'
  },
  'support/user/team/invitationLink/list': {
    code: 200,
    data: []
  },
  'support/user/team/invitationLink/accept': {
    code: 200,
    data: 'mock-team-id'
  },
  'support/user/team/invitationLink/info': {
    code: 200,
    data: null
  },
  'support/user/team/invitationLink/forbid': {
    code: 200,
    data: null
  },

  // ==================== 协作者 ====================
  'support/user/team/collaborator/list': {
    code: 200,
    data: {
      collaborators: []
    }
  },
  'support/user/team/collaborator/update': {
    code: 200,
    data: null
  },
  'support/user/team/collaborator/updateOne': {
    code: 200,
    data: null
  },
  'support/user/team/collaborator/delete': {
    code: 200,
    data: null
  },

  // ==================== 组织架构 ====================
  'support/user/team/org/list': {
    code: 200,
    data: []
  },
  'support/user/team/org/create': {
    code: 200,
    data: null
  },
  'support/user/team/org/delete': {
    code: 200,
    data: null
  },
  'support/user/team/org/move': {
    code: 200,
    data: null
  },
  'support/user/team/org/update': {
    code: 200,
    data: null
  },
  'support/user/team/org/updateMembers': {
    code: 200,
    data: null
  },
  'support/user/team/org/members': {
    code: 200,
    data: {
      total: 0,
      list: []
    }
  },
  'support/user/team/org/deleteMember': {
    code: 200,
    data: null
  },

  // ==================== 群组管理 ====================
  'support/user/team/group/list': {
    code: 200,
    data: []
  },
  'support/user/team/group/create': {
    code: 200,
    data: null
  },
  'support/user/team/group/delete': {
    code: 200,
    data: null
  },
  'support/user/team/group/update': {
    code: 200,
    data: null
  },
  'support/user/team/group/members': {
    code: 200,
    data: []
  },
  'support/user/team/group/changeOwner': {
    code: 200,
    data: null
  },

  // ==================== 审计日志 ====================
  'support/user/audit/list': {
    code: 200,
    data: {
      total: 0,
      list: []
    }
  },

  // ==================== 用户搜索和同步 ====================
  'support/user/search': {
    code: 200,
    data: {
      members: [],
      groups: [],
      orgs: []
    }
  },
  'support/user/sync': {
    code: 200,
    data: null
  },

  // ==================== 用户账号 ====================
  'support/user/account/login/oauth': {
    code: 403,
    data: null,
    message: '开源版不支持 OAuth 登录'
  },
  'support/user/account/login/fastLogin': {
    code: 403,
    data: null,
    message: '开源版不支持快速登录'
  },
  'support/user/account/sso': {
    code: 403,
    data: null,
    message: '开源版不支持 SSO'
  },
  'support/user/account/register/emailAndPhone': {
    code: 403,
    data: null,
    message: '开源版不支持邮箱/手机注册，请使用用户名密码登录'
  },
  'support/user/account/password/updateByCode': {
    code: 403,
    data: null,
    message: '开源版不支持验证码修改密码'
  },
  'support/user/account/updateContact': {
    code: 200,
    data: null
  },
  'support/user/account/login/wx/getQR': {
    code: 403,
    data: null,
    message: '开源版不支持微信登录'
  },
  'support/user/account/login/wx/getResult': {
    code: 403,
    data: null,
    message: '开源版不支持微信登录'
  },
  'support/user/account/captcha/getImgCaptcha': {
    code: 200,
    data: { captchaId: '', captchaImage: '' }
  },

  // ==================== 计费相关 ====================
  'support/wallet/usage/createUsage': {
    code: 200,
    data: 'mock-usage-id'
  },
  'support/wallet/usage/concatUsage': {
    code: 200,
    data: null
  },
  'support/wallet/usage/pushUsageItems': {
    code: 200,
    data: null
  },
  'support/wallet/usage/getUsage': {
    code: 200,
    data: {
      total: 0,
      list: []
    }
  },
  'support/wallet/usage/getDashboardData': {
    code: 200,
    data: []
  },

  // ==================== 账单相关 ====================
  'support/wallet/bill/list': {
    code: 200,
    data: {
      total: 0,
      list: []
    }
  },
  'support/wallet/bill/create': {
    code: 403,
    data: null,
    message: '开源版不支持在线充值'
  },
  'support/wallet/bill/pay/checkPayResult': {
    code: 200,
    data: { status: 'SUCCESS' }
  },
  'support/wallet/bill/pay/updatePayment': {
    code: 200,
    data: null
  },
  'support/wallet/bill/balanceConversion': {
    code: 200,
    data: '0'
  },
  'support/wallet/bill/cancel': {
    code: 200,
    data: null
  },
  'support/wallet/bill/detail': {
    code: 200,
    data: null
  },

  // ==================== 发票相关 ====================
  'support/wallet/bill/invoice/unInvoiceList': {
    code: 200,
    data: []
  },
  'support/wallet/bill/invoice/submit': {
    code: 403,
    data: null,
    message: '开源版不支持发票功能'
  },
  'support/wallet/bill/invoice/records': {
    code: 200,
    data: {
      total: 0,
      list: []
    }
  },

  // ==================== 优惠券 ====================
  'support/wallet/coupon/redeem': {
    code: 403,
    data: null,
    message: '开源版不支持优惠券'
  },
  'support/wallet/discountCoupon/list': {
    code: 200,
    data: []
  },

  // ==================== 自定义域名 ====================
  'support/customDomain/list': {
    code: 200,
    data: []
  },
  'support/customDomain/checkDNSResolve': {
    code: 200,
    data: { success: false, message: '开源版不支持自定义域名' }
  },
  'support/customDomain/delete': {
    code: 403,
    data: null,
    message: '开源版不支持自定义域名'
  },
  'support/customDomain/create': {
    code: 403,
    data: null,
    message: '开源版不支持自定义域名'
  },
  'support/customDomain/active': {
    code: 403,
    data: null,
    message: '开源版不支持自定义域名'
  },
  'support/customDomain/updateVerifyFile': {
    code: 403,
    data: null,
    message: '开源版不支持自定义域名'
  },

  // ==================== 活动推广 ====================
  'support/activity/promotion/getPromotionData': {
    code: 200,
    data: {
      promotionBalance: 0,
      historyPromotion: 0
    }
  },
  'support/activity/promotion/getPromotions': {
    code: 200,
    data: {
      total: 0,
      list: []
    }
  },

  // ==================== 对话设置 ====================
  'core/chat/initTeamChat': {
    code: 200,
    data: null
  },
  'core/chat/setting/detail': {
    code: 200,
    data: {
      favourites: [],
      tags: []
    }
  },
  'core/chat/setting/update': {
    code: 200,
    data: null
  },
  'core/chat/setting/favourite/list': {
    code: 200,
    data: []
  },
  'core/chat/setting/favourite/update': {
    code: 200,
    data: []
  },
  'core/chat/setting/favourite/order': {
    code: 200,
    data: null
  },
  'core/chat/setting/favourite/tags': {
    code: 200,
    data: null
  },
  'core/chat/setting/favourite/delete': {
    code: 200,
    data: null
  },

  // ==================== 知识库相关 ====================
  'core/dataset/changeOwner': {
    code: 200,
    data: null
  },
  'core/dataset/collection/create/externalFileUrl': {
    code: 403,
    data: null,
    message: '开源版不支持外部文件URL导入'
  },

  // ==================== 团队应用标签 ====================
  'support/user/team/tag/getAppsByTeamTokens': {
    code: 200,
    data: []
  },

  // ==================== 应用模板分类 ====================
  'core/app/template/getTemplateTypes': {
    code: 200,
    data: [
      {
        id: 'all',
        label: '全部',
        desc: '全部模板',
        order: 0
      },
      {
        id: 'chat',
        label: '对话助手',
        desc: '对话类应用模板',
        order: 1
      },
      {
        id: 'knowledge',
        label: '知识库',
        desc: '知识库类应用模板',
        order: 2
      },
      {
        id: 'workflow',
        label: '工作流',
        desc: '工作流类应用模板',
        order: 3
      },
      {
        id: 'tool',
        label: '工具',
        desc: '工具类应用模板',
        order: 4
      }
    ]
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { path = [], ...query } = req.query as any;
    const requestPath = `/api/${path?.join('/')}?${new URLSearchParams(query).toString()}`;
    const apiPath = path?.join('/');

    if (!requestPath) {
      throw new Error('url is empty');
    }

    // 如果没有配置商业版链接,尝试使用mock数据
    if (!FastGPTProUrl) {
      // 检查是否有mock响应
      if (mockResponses[apiPath]) {
        console.log(`[proApi Mock] 返回mock数据: ${apiPath}`);
        return jsonRes(res, mockResponses[apiPath]);
      }

      // 没有mock数据,返回 404
      console.warn(`[proApi] 商业版 API 未配置且无mock数据: ${apiPath}`);
      return jsonRes(res, {
        code: 404,
        error: {
          message: `商业版 API 未配置: ${apiPath}`,
          path: requestPath,
          tip: '部分高级功能需要商业版支持。如需使用,请配置 FastGPT_PRO_URL 环境变量。'
        }
      });
    }

    // 检查是否会造成循环代理(代理到自己)
    const parsedUrl = new URL(FastGPTProUrl);
    const currentHost = req.headers.host || 'localhost:3000';
    const targetHost = `${parsedUrl.hostname}:${parsedUrl.port || (parsedUrl.protocol === 'https:' ? '443' : '80')}`;

    if (currentHost === targetHost || parsedUrl.href.includes(currentHost)) {
      // 避免循环代理,返回 404
      return jsonRes(res, {
        code: 404,
        error: {
          message: `商业版 API 不可用(循环代理): ${path?.join('/')}`,
          path: requestPath
        }
      });
    }

    delete req.headers?.rootkey;

    const requestResult = request({
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: requestPath,
      method: req.method,
      headers: req.headers,
      agent: new Agent()
    });
    req.pipe(requestResult);

    requestResult.on('response', (response) => {
      Object.keys(response.headers).forEach((key) => {
        // @ts-ignore
        res.setHeader(key, response.headers[key]);
      });
      response.statusCode && res.writeHead(response.statusCode);
      response.pipe(res);
    });

    requestResult.on('error', (e) => {
      jsonRes(res, {
        code: 500,
        error: {
          message: '商业版 API 请求失败',
          details: e.message
        }
      });
    });
  } catch (error) {
    jsonRes(res, {
      code: 500,
      error
    });
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
