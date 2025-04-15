import { PubSub } from '@google-cloud/pubsub';
import { processBulkUpdateBatch } from '../controllers/bulkActionController';

const subscriptionName = 'bulk-contact-updates-sub';
const pubsub = new PubSub();

async function startWorker() {
  const subscription = pubsub.subscription(subscriptionName);

  console.log(`👷 Worker listening to subscription: ${subscriptionName}`);

  const messageHandler = async (message: any) => {
    console.log(`📥 Received message ${message.id}:`);
    try {
      const data = JSON.parse(message.data.toString());
      const { jobId, contacts } = data;

      console.log(`🔧 Processing jobId: ${jobId} with ${contacts.length} contacts...`);
      await processBulkUpdateBatch(jobId, contacts);

      message.ack();
      console.log(`✅ Job ${jobId} processed and message acknowledged.`);
    } catch (error: any) {
      console.error(`❌ Failed to process message ${message.id}:`, error.message);
      message.nack(); // Retry later
    }
  };

  subscription.on('message', messageHandler);

  subscription.on('error', (error) => {
    console.error('🚨 Subscription error:', error);
  });
}

startWorker().catch(err => {
  console.error('Failed to start worker:', err);
});
