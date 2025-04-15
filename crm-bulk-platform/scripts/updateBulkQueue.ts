import fs from 'fs';
import chunk from 'lodash/chunk';
import { bulkQueue } from '../queues/bulkQueue';
import { v4 as uuidv4 } from 'uuid';
import { BulkJob } from '../models';

const BATCH_SIZE = 10000;
const FILE_PATH = 'bulk-request-1million.json';

(async () => {
  try {
    console.log(`🔍 Reading file: ${FILE_PATH}`);

    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    console.log(`📥 File loaded. Parsing JSON...`);

    const parsed = JSON.parse(raw);

    console.log('📦 Parsed data:', parsed);
    const { entityType, actionType, contacts } = parsed;

    if (!entityType || !actionType) {
      throw new Error('Entity Type or Action Type is missing');
    }

    console.log(`✅ Entity Type: ${entityType}, Action Type: ${actionType}`);

    if (!Array.isArray(contacts)) {
      throw new Error('Invalid format: contacts must be an array');
    }
    
    console.log(`📊 Contacts found: ${contacts.length}`);

    const bulkJob = await BulkJob.create({
      entity_type: entityType,
      action_type: actionType,
      total_count: contacts.length,
      success_count: 0,
      failure_count: 0,
      status: 'queued',
    });

    console.log(`✅ Bulk job created with ID: ${bulkJob.id}`);

    const contactChunks = chunk(contacts, BATCH_SIZE);
    console.log(`📦 Split contacts into ${contactChunks.length} batches`);

    for (const batch of contactChunks) {
      console.log(`📝 Enqueuing batch of size ${batch.length} for Job ID: ${bulkJob.id}`);
      
      await bulkQueue.add('process-batch', {
        jobId: bulkJob.id,
        contacts: batch,
      });

      console.log(`✅ Batch enqueued for Job ID: ${bulkJob.id}`);
    }

    console.log(`✅ Enqueued ${contactChunks.length} batches to BullMQ for job ${bulkJob.id}`);
  } catch (err: any) {
    console.error('❌ Failed to queue bulk update:', err.message);
    console.error('Stack trace:', err.stack);
  }
})();
