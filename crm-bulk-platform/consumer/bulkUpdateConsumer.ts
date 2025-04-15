import { Contact } from '../models/Contact';
import { BulkJob } from '../models/BulkJob';
import { actionHandlers } from '../services';

const BATCH_SIZE = 1000; 
const MAX_RETRIES = 3; 
const RETRY_DELAY = 1000;
const EXPONENTIAL_BACKOFF_FACTOR = 2;

export const processBulkUpdateBatch = async (
  jobId: string,
  contacts: any[]
): Promise<void> => {
  const start = Date.now();
  let successCount = 0;
  let failureCount = 0;

  try {
    const job = await BulkJob.findByPk(jobId);
    if (!job) throw new Error(`Job with ID ${jobId} not found`);

    const key = `${job.entity_type.toLowerCase()}.${job.action_type.toLowerCase()}`;
    const handler = actionHandlers[key];
    if (!handler) throw new Error(`No handler registered for action ${key}`);
    
    await job.update({ status: 'processing' });

    const totalContacts = contacts.length;
    for (let i = 0; i < totalContacts; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);

      let attempt = 0;
      let batchSuccess = 0;
      let batchFailure = 0;
      let retryDelay = RETRY_DELAY;

      while (attempt <= MAX_RETRIES) {
        const transaction = await Contact.sequelize?.transaction();
        if (!transaction) throw new Error('Failed to start transaction');

        try {
          const result = await handler(jobId, batch, transaction);
          batchSuccess = result.successCount;
          batchFailure = result.failureCount;

          await transaction.commit();
          console.log(`[Job ${jobId}] ✅ Batch ${i / BATCH_SIZE + 1} committed successfully.`);
          break;
        } catch (err: any) {
          await transaction.rollback();
          attempt++;

          console.error(`[Job ${jobId}] ❌ Batch ${i / BATCH_SIZE + 1} failed (Attempt ${attempt}): ${err.message}`);

          if (attempt > MAX_RETRIES) {
            failureCount += batch.length;
            break;
          } else {
            console.log(`[Job ${jobId}] 🔄 Retrying in ${retryDelay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            retryDelay *= EXPONENTIAL_BACKOFF_FACTOR;
          }
        }
      }

      successCount += batchSuccess;
      failureCount += batchFailure;
    }

    await BulkJob.increment(
  {
    success_count: successCount,
    failure_count: failureCount,
  },
  { where: { id: jobId } }
  );

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`[Job ${jobId}] ✅ Processing completed in ${duration}s – Success: ${successCount}, Failure: ${failureCount}`);
  } catch (err: any) {
    await BulkJob.update({ status: 'failed' }, { where: { id: jobId } });
    console.error(`[Job ${jobId}] ❌ Job failed: ${err.message}`);
    throw err;
  }
};
