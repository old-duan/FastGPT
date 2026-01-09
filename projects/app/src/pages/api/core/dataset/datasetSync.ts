import type { NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authDataset } from '@fastgpt/service/support/permission/dataset/auth';
import { ReadPermissionVal } from '@fastgpt/global/support/permission/constant';
import { addDatasetSyncJob } from '@fastgpt/service/core/dataset/datasetSync';
import { NextAPI } from '@/service/middleware/entry';
import type { ApiRequestProps } from '@fastgpt/service/type/next';

export type PostDatasetSyncParams = {
  datasetId: string;
};

/**
 * 开源版本的 Dataset 同步 API
 * 用于触发 Web 站点同步任务
 */
async function handler(
  req: ApiRequestProps<PostDatasetSyncParams>,
  res: NextApiResponse
): Promise<void> {
  try {
    const { datasetId } = req.body;

    if (!datasetId) {
      return jsonRes(res, {
        code: 400,
        error: { message: 'datasetId is required' }
      });
    }

    // 验证数据集权限
    const { dataset } = await authDataset({
      req,
      authToken: true,
      datasetId,
      per: ReadPermissionVal
    });

    // 添加同步任务到队列
    await addDatasetSyncJob({ datasetId: String(dataset._id) });

    return jsonRes(res, {
      code: 200,
      data: {
        message: 'Dataset sync job added successfully'
      }
    });
  } catch (error: any) {
    console.error('[datasetSync] Error:', error);
    return jsonRes(res, {
      code: 500,
      error: {
        message: error?.message || 'Failed to sync dataset'
      }
    });
  }
}

export default NextAPI(handler);
