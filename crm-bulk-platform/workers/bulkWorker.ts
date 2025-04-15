// src/workers/bulkWorker.ts
import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { processBulkUpdateBatch } from '../consumer/bulkUpdateConsumer';
const jobStartTimes = new Map<string, number>();
dotenv.config();

console.log('👷 Starting Bulk Contact Worker...');

const worker = new Worker(
  'bulk-contact-queue',
  async (job) => {
    const { jobId, contacts } = job.data;
    console.log(`📥 Received batch for Job ID: ${jobId}`);
    await processBulkUpdateBatch(jobId, contacts);
    console.log(`✅ Finished processing batch for Job ID: ${jobId}`);
  },
  {
    connection: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      maxRetriesPerRequest: null,
    },
    concurrency: 5
  }
);

worker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('🚨 Worker error:', err.message);
});

console.log('✅ Worker is running and waiting for jobs...');
