/**
 * 手动初始化BullMQ Workers
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { initBullMQWorkers } from '@/service/common/bullmq';
import { addLog } from '@fastgpt/service/common/system/log';

let initialized = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (initialized) {
      return jsonRes(res, {
        data: {
          message: 'Workers already initialized',
          status: 'already_running'
        }
      });
    }

    addLog.info('[Manual Init] Initializing BullMQ Workers...');
    initBullMQWorkers();
    initialized = true;
    addLog.info('[Manual Init] Workers initialized successfully');

    return jsonRes(res, {
      data: {
        message: 'Workers initialized successfully',
        status: 'initialized'
      }
    });
  } catch (error: any) {
    addLog.error('[Manual Init] Failed to initialize workers:', error);
    return jsonRes(res, {
      code: 500,
      error: {
        message: error.message || 'Failed to initialize workers'
      }
    });
  }
}
