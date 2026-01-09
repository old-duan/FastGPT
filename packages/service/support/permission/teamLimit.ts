import { getTeamPlanStatus, getTeamStandPlan, teamPoint } from '../../support/wallet/sub/utils';
import { MongoApp } from '../../core/app/schema';
import { MongoDataset } from '../../core/dataset/schema';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { TeamErrEnum } from '@fastgpt/global/common/error/code/team';
import { SystemErrEnum } from '@fastgpt/global/common/error/code/system';
import { AppTypeEnum, ToolTypeList, AppFolderTypeList } from '@fastgpt/global/core/app/constants';
import { MongoTeamMember } from '../user/team/teamMemberSchema';
import { TeamMemberStatusEnum } from '@fastgpt/global/support/user/team/constant';
import { getVectorCountByTeamId } from '../../common/vectorDB/controller';

export const checkTeamAIPoints = async (teamId: string) => {
  // 高级版配置：移除 AI 积分限制检查
  if (!global.subPlans?.standard) return;

  const { totalPoints, usedPoints } = await teamPoint.getTeamPoints({ teamId });

  // 取消积分限制，始终允许使用
  // if (usedPoints >= totalPoints) {
  //   return Promise.reject(TeamErrEnum.aiPointsNotEnough);
  // }

  return {
    totalPoints,
    usedPoints
  };
};

export const checkTeamMemberLimit = async (teamId: string, newCount: number) => {
  // 高级版配置：移除团队成员数量限制
  const [{ standardConstants }, memberCount] = await Promise.all([
    getTeamStandPlan({
      teamId
    }),
    MongoTeamMember.countDocuments({
      teamId,
      status: { $ne: TeamMemberStatusEnum.leave }
    })
  ]);

  // 取消成员数量限制
  // if (standardConstants && newCount + memberCount > standardConstants.maxTeamMember) {
  //   return Promise.reject(TeamErrEnum.teamOverSize);
  // }
};

export const checkTeamAppTypeLimit = async ({
  teamId,
  appCheckType,
  amount = 1
}: {
  teamId: string;
  appCheckType: 'app' | 'tool' | 'folder';
  amount?: number;
}) => {
  if (appCheckType === 'app') {
    const [{ standardConstants }, appCount] = await Promise.all([
      getTeamStandPlan({ teamId }),
      MongoApp.countDocuments({
        teamId,
        type: {
          $in: [AppTypeEnum.simple, AppTypeEnum.workflow]
        }
      })
    ]);

    // 高级版配置：移除应用数量限制
    // if (standardConstants && appCount + amount > standardConstants.maxAppAmount) {
    //   return Promise.reject(TeamErrEnum.appAmountNotEnough);
    // }

    // System check
    if (global?.licenseData?.maxApps && typeof global?.licenseData?.maxApps === 'number') {
      const totalApps = await MongoApp.countDocuments({
        type: {
          $in: [AppTypeEnum.simple, AppTypeEnum.workflow]
        }
      });
      if (totalApps > global.licenseData.maxApps) {
        return Promise.reject(SystemErrEnum.licenseAppAmountLimit);
      }
    }
  } else if (appCheckType === 'tool') {
    const toolCount = await MongoApp.countDocuments({
      teamId,
      type: {
        $in: ToolTypeList
      }
    });
    const maxToolAmount = 1000;
    if (toolCount + amount > maxToolAmount) {
      return Promise.reject(TeamErrEnum.pluginAmountNotEnough);
    }
  } else if (appCheckType === 'folder') {
    const folderCount = await MongoApp.countDocuments({
      teamId,
      type: {
        $in: AppFolderTypeList
      }
    });
    const maxAppFolderAmount = 1000;
    if (folderCount + amount > maxAppFolderAmount) {
      return Promise.reject(TeamErrEnum.appFolderAmountNotEnough);
    }
  }
};

export const checkDatasetIndexLimit = async ({
  teamId,
  insertLen = 0
}: {
  teamId: string;
  insertLen?: number;
}) => {
  const [{ standardConstants, totalPoints, usedPoints, datasetMaxSize }, usedDatasetIndexSize] =
    await Promise.all([getTeamPlanStatus({ teamId }), getVectorCountByTeamId(teamId)]);

  if (!standardConstants) return;

  // 高级版配置：移除知识库容量和积分限制
  // if (usedDatasetIndexSize + insertLen >= datasetMaxSize) {
  //   return Promise.reject(TeamErrEnum.datasetSizeNotEnough);
  // }

  // if (usedPoints >= totalPoints) {
  //   return Promise.reject(TeamErrEnum.aiPointsNotEnough);
  // }
  return;
};

export const checkTeamDatasetLimit = async (teamId: string) => {
  const [{ standardConstants }, datasetCount] = await Promise.all([
    getTeamStandPlan({ teamId }),
    MongoDataset.countDocuments({
      teamId,
      type: { $ne: DatasetTypeEnum.folder }
    })
  ]);

  // 高级版配置：移除知识库数量限制
  // User check
  if (false && standardConstants && datasetCount >= standardConstants.maxDatasetAmount) {
    return Promise.reject(TeamErrEnum.datasetAmountNotEnough);
  }

  // System check
  if (global?.licenseData?.maxDatasets && typeof global?.licenseData?.maxDatasets === 'number') {
    const totalDatasets = await MongoDataset.countDocuments({
      type: { $ne: DatasetTypeEnum.folder }
    });
    if (totalDatasets >= global.licenseData.maxDatasets) {
      return Promise.reject(SystemErrEnum.licenseDatasetAmountLimit);
    }
  }
};

export const checkTeamDatasetSyncPermission = async (teamId: string) => {
  // 已移除商业版限制 - Web站点同步功能现在对所有用户开放
  // const { standardConstants } = await getTeamStandPlan({
  //   teamId
  // });

  // if (standardConstants && !standardConstants?.websiteSyncPerDataset) {
  //   return Promise.reject(TeamErrEnum.websiteSyncNotEnough);
  // }
  return Promise.resolve(); // 直接允许所有用户使用
};
