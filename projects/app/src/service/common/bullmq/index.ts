import { addLog } from '@fastgpt/service/common/system/log';
import { initS3MQWorker } from '@fastgpt/service/common/s3';
import { initDatasetDeleteWorker } from '@fastgpt/service/core/dataset/delete';
import { getDatasetSyncWorker } from '@fastgpt/service/core/dataset/datasetSync';
import { datasetSyncProcessor } from '@fastgpt/service/core/dataset/datasetSync/processor';

export const initBullMQWorkers = () => {
  addLog.info('Init BullMQ Workers...');
  initS3MQWorker();
  initDatasetDeleteWorker();

  // Init Dataset Sync Worker
  addLog.info('Init Dataset Sync Worker...');
  getDatasetSyncWorker(datasetSyncProcessor);
};
