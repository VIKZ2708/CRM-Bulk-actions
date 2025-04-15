import { Contact, BulkJobLog } from '../models';
import { bulkQueue } from '../queues/bulkQueue';

export const updateContactService = async (jobId: string, contacts: any[], transaction: any) => {
  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  const insertContacts: any[] = [];
  const updateTasks = contacts.map(async ({ id, updates }) => {

    const existing = await Contact.findByPk(id, { transaction });

    if (existing) {

      const fieldsToCompare = ['name', 'email', 'phone'];

      const isIdentical = fieldsToCompare.every((key) => {
        const existingValue = (existing as any)[key];
        const updateValue = updates[key];
        return String(existingValue) === String(updateValue);
      });
      if (isIdentical) {
        skippedCount++;
        await BulkJobLog.create({
          job_id: Number(jobId),
          entity_id: id,
          status: 'skipped',
          message: 'No changes detected',
        }, { transaction });
        return;
      }

      try {
        await existing.update(updates, { transaction });
        successCount++;
        await BulkJobLog.create({
          job_id: Number(jobId),
          entity_id: id,
          status: 'success',
          message: 'Updated successfully',
        }, { transaction });
      } catch (err: any) {
        failureCount++;

        console.error(`Error updating contact ${id}:`, err.message);
        await BulkJobLog.create({
          job_id: Number(jobId),
          entity_id: id,
          status: 'failure',
          message: err.message,
        }, { transaction });
      }
    } else {
      insertContacts.push({ id, ...updates });
    }
  });

  await Promise.all(updateTasks);

  if (insertContacts.length > 0) {
    try {
      await Contact.bulkCreate(insertContacts, {
        updateOnDuplicate: ['name', 'email'],
        transaction,
      });

      successCount += insertContacts.length;

      await Promise.all(insertContacts.map((contact) =>
        BulkJobLog.create({
          job_id: Number(jobId),
          entity_id: contact.id,
          status: 'success',
          message: 'Inserted successfully',
        }, { transaction })
      ));
    } catch (err: any) {
      failureCount += insertContacts.length;

      await Promise.all(insertContacts.map((contact) =>
        BulkJobLog.create({
          job_id: Number(jobId),
          entity_id: contact.id,
          status: 'failure',
          message: err.message,
        }, { transaction })
      ));
    }
  }

  console.log(`Bulk action complete for job ${jobId}. Success: ${successCount}, Failures: ${failureCount}, Skipped: ${skippedCount}`);

  return { successCount, failureCount, skippedCount };
};

export const queueBulkActionJob = async (jobId: number, scheduledAt: Date) => {
  const delay = scheduledAt.getTime() - Date.now();

  if (delay < 0) {
    throw new Error('Scheduled time must be in the future');
  }

  await bulkQueue.add('process-bulk-action', { jobId }, { delay });
};