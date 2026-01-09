import type { NextApiRequest, NextApiResponse } from 'next';
import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoUsage } from '@fastgpt/service/support/wallet/usage/schema';
import type { GetUsageProps } from '@fastgpt/global/support/wallet/usage/api.d';
import type { UsageListItemType } from '@fastgpt/global/support/wallet/usage/type';
import type { PaginationProps, PaginationResponse } from '@fastgpt/web/common/fetch/type';
import { TeamMemberStatusEnum } from '@fastgpt/global/support/user/team/constant';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginationResponse<UsageListItemType>>
): Promise<PaginationResponse<UsageListItemType>> {
  const { teamId, tmbId } = await authCert({ req, authToken: true });

  const {
    dateStart,
    dateEnd,
    sources,
    teamMemberIds,
    projectName,
    pageNum = 1,
    pageSize = 20
  } = req.body as PaginationProps<GetUsageProps>;

  const pageNumInt = Number(pageNum) || 1;
  const pageSizeInt = Number(pageSize) || 20;

  // Build query
  const query: Record<string, any> = {
    teamId,
    time: {
      $gte: new Date(dateStart),
      $lte: new Date(dateEnd)
    }
  };

  if (sources && sources.length > 0) {
    query.source = { $in: sources };
  }

  if (teamMemberIds && teamMemberIds.length > 0) {
    query.tmbId = { $in: teamMemberIds };
  }

  if (projectName) {
    query.appName = { $regex: projectName, $options: 'i' };
  }

  // Get total count
  const total = await MongoUsage.countDocuments(query);

  // Get paginated data with team member info
  const list = await MongoUsage.find(query)
    .populate('usageItems')
    .populate({
      path: 'tmbId',
      select: 'name avatar status'
    })
    .sort({ time: -1 })
    .skip((pageNumInt - 1) * pageSizeInt)
    .limit(pageSizeInt)
    .lean();

  // Format response
  const formattedList: UsageListItemType[] = list.map((item) => {
    const tmbInfo = item.tmbId as any;
    return {
      id: String(item._id),
      time: item.time,
      appName: item.appName || '',
      totalPoints: item.totalPoints,
      source: item.source,
      list: ((item as any).usageItems || item.list || []).map((usageItem: any) => ({
        moduleName: usageItem.name || usageItem.moduleName || '',
        amount: usageItem.amount || 0,
        model: usageItem.model,
        inputTokens: usageItem.inputTokens,
        outputTokens: usageItem.outputTokens,
        charsLength: usageItem.charsLength,
        duration: usageItem.duration,
        pages: usageItem.pages,
        count: usageItem.count
      })),
      sourceMember:
        tmbInfo && typeof tmbInfo === 'object' && tmbInfo.name
          ? {
              name: tmbInfo.name || '',
              avatar: tmbInfo.avatar || '',
              status: tmbInfo.status || TeamMemberStatusEnum.active
            }
          : {
              name: 'Unknown',
              avatar: '',
              status: TeamMemberStatusEnum.active
            }
    };
  });

  return {
    total,
    list: formattedList
  };
}

export default NextAPI(handler);
