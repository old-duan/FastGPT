import type { Job, Processor } from 'bullmq';
import type { DatasetSyncJobData } from './index';
import { MongoDataset } from '../schema';
import { MongoDatasetCollection } from '../collection/schema';
import { syncCollection } from '../collection/utils';
import { addLog } from '../../../common/system/log';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { DatasetCollectionTypeEnum } from '@fastgpt/global/core/dataset/constants';

/**
 * Dataset Sync Processor
 * 处理 Web 站点数据集的同步任务
 *
 * 工作流程:
 * 1. 获取数据集信息
 * 2. 如果是Web站点且没有collections,从根URL创建初始collection
 * 3. 对每个集合调用 syncCollection 进行同步
 */
export const datasetSyncProcessor: Processor<DatasetSyncJobData> = async (
  job: Job<DatasetSyncJobData>
) => {
  const { datasetId } = job.data;

  try {
    addLog.info(`[DatasetSync] Start syncing dataset: ${datasetId}`);

    // 1. 获取数据集信息
    const dataset = await MongoDataset.findById(datasetId);
    if (!dataset) {
      throw new Error(`Dataset not found: ${datasetId}`);
    }

    // 2. 获取该数据集的所有集合
    let collections = await MongoDatasetCollection.find({
      datasetId: dataset._id
    })
      .populate('dataset')
      .lean();

    addLog.info(`[DatasetSync] Found ${collections.length} collections for dataset ${datasetId}`);

    // 3. 如果是Web站点数据集且没有collections,创建初始collection
    if (dataset.type === DatasetTypeEnum.websiteDataset && collections.length === 0) {
      if (!dataset.websiteConfig?.url) {
        throw new Error(`Website dataset ${datasetId} has no URL configured`);
      }

      addLog.info(
        `[DatasetSync] Creating initial collection for website: ${dataset.websiteConfig.url}`
      );

      const newCollection = await MongoDatasetCollection.create({
        datasetId: dataset._id,
        teamId: dataset.teamId,
        tmbId: dataset.tmbId,
        parentId: null,
        name: 'Root Page',
        type: DatasetCollectionTypeEnum.link,
        metadata: {
          webPageSelector: dataset.websiteConfig.selector || 'body'
        },
        rawLink: dataset.websiteConfig.url,
        trainingType: dataset.chunkSettings?.trainingType,
        chunkSize: dataset.chunkSettings?.chunkSize || 512,
        chunkSplitter: dataset.chunkSettings?.chunkSplitter,
        qaPrompt: dataset.chunkSettings?.qaPrompt,
        imageIndex: dataset.chunkSettings?.imageIndex,
        autoIndexes: dataset.chunkSettings?.autoIndexes,
        chunkSetting: dataset.chunkSettings
      });

      addLog.info(`[DatasetSync] Created initial collection: ${newCollection._id}`);

      // Reload collections
      collections = await MongoDatasetCollection.find({
        datasetId: dataset._id
      })
        .populate('dataset')
        .lean();
    }

    // 3. 同步每个集合
    const results = [];
    for (const collection of collections) {
      try {
        addLog.info(`[DatasetSync] Syncing collection: ${collection._id}`);
        const result = await syncCollection(collection as any);
        results.push({ collectionId: collection._id, result });
        addLog.info(`[DatasetSync] Collection ${collection._id} synced successfully`);
      } catch (error: any) {
        addLog.error(`[DatasetSync] Failed to sync collection ${collection._id}:`, error);
        results.push({ collectionId: collection._id, error: error.message });
        // 继续处理其他集合,不中断整个任务
      }
    }

    addLog.info(`[DatasetSync] Dataset ${datasetId} sync completed. Results:`, results);

    return {
      success: true,
      datasetId,
      collectionsProcessed: collections.length,
      results
    };
  } catch (error: any) {
    addLog.error(`[DatasetSync] Error syncing dataset ${datasetId}:`, error);
    throw error;
  }
};
