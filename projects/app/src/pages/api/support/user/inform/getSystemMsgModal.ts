import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authCert } from '@fastgpt/service/support/permission/auth/common';

/**
 * 开源版 - 获取系统消息弹窗
 * 商业版功能的开源替代实现
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // 验证用户登录
    await authCert({ req, authToken: true });

    // 开源版默认返回空消息
    jsonRes(res, {
      data: null
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
