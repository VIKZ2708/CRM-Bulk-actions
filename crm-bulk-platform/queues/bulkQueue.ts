// src/queues/bulkQueue.ts
import { Queue } from 'bullmq';
import { RedisOptions } from 'ioredis';

const connectionOptions: RedisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
};

export const bulkQueue = new Queue('bulk-contact-queue', {
  connection: connectionOptions,
});

/* 
Field	Meaning
active	Jobs currently being processed by workers.
completed	Jobs that have successfully finished execution.
failed	Jobs that threw an error or failed during execution.
delayed	Jobs scheduled to run in the future (not ready to process yet).
paused	Queue is paused — no new jobs are being processed until resumed.
prioritized	(BullMQ v4+) Jobs with higher priority than others (rarely used).
waiting	Jobs that are ready to be processed but haven't started yet.
waiting-children	Jobs that are waiting for child jobs to finish before continuing.

*/