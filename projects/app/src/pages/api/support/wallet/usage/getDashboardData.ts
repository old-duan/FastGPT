import type { NextApiRequest, NextApiResponse } from 'next';
import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoUsage } from '@fastgpt/service/support/wallet/usage/schema';
import type {
  GetUsageDashboardProps,
  GetUsageDashboardResponseItem
} from '@fastgpt/global/support/wallet/usage/api.d';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetUsageDashboardResponseItem[]>
): Promise<GetUsageDashboardResponseItem[]> {
  const { teamId } = await authCert({ req, authToken: true });

  const {
    dateStart,
    dateEnd,
    sources,
    teamMemberIds,
    unit = 'day'
  } = req.body as GetUsageDashboardProps;

  // Build match stage
  const matchStage: Record<string, any> = {
    teamId,
    time: {
      $gte: new Date(dateStart),
      $lte: new Date(dateEnd)
    }
  };

  if (sources && sources.length > 0) {
    matchStage.source = { $in: sources };
  }

  if (teamMemberIds && teamMemberIds.length > 0) {
    matchStage.tmbId = { $in: teamMemberIds };
  }

  // Build date grouping format
  const dateFormat = unit === 'month' ? '%Y-%m-01' : '%Y-%m-%d';

  // Aggregate by date
  const result = await MongoUsage.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: {
            format: dateFormat,
            date: '$time'
          }
        },
        totalPoints: { $sum: '$totalPoints' }
      }
    },
    {
      $project: {
        _id: 0,
        date: { $dateFromString: { dateString: '$_id' } },
        totalPoints: 1
      }
    },
    { $sort: { date: 1 } }
  ]);

  return result;
}

export default NextAPI(handler);
