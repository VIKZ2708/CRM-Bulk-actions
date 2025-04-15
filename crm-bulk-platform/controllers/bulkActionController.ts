import { RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { BulkJob, BulkJobLog, Contact } from '../models';
import chunk from 'lodash/chunk';
import { bulkQueue } from '../queues/bulkQueue';
import { actionHandlers } from '../services';
import { successResponse, errorResponse } from '../utils/responseHandler';
import { Request, Response } from 'express';
import dayjs from 'dayjs';
// import { PubSub } from '@google-cloud/pubsub';
// const pubsub = new PubSub();
// const topicName = 'bulk-contact-updates';

const BATCH_SIZE = 1000;

export const bulkUpdate: RequestHandler = async (req, res) => {
  const { entityType, actionType, contacts } = req.body;

  if (!entityType || !actionType || !contacts || contacts.length === 0) {
    return errorResponse(res, 'Missing required parameters', 'Validation error', 400);
  }

  try {
    const bulkJob = await BulkJob.create({
      entity_type: entityType,
      action_type: actionType,
      total_count: contacts.length,
      success_count: 0,
      failure_count: 0,
      status: 'queued',
    });

    const contactChunks = chunk(contacts, BATCH_SIZE);

    for (const batch of contactChunks) {
      await bulkQueue.add('bulk-contact-job', {
        jobId: bulkJob.id,
        contacts: batch,
      });
    }

    return successResponse(res, bulkJob, 'Bulk update request accepted and queued', 202);
  } catch (error: any) {
    return errorResponse(res, error, 'Failed to enqueue bulk update', 500);
  }
};

export const listBulkActions: RequestHandler = async (req, res) => {
  try {
    const jobs = await BulkJob.findAll({ order: [['created_at', 'DESC']] });
    return successResponse(res, jobs, 'Fetched bulk actions');
  } catch (error: any) {
    return errorResponse(res, error, 'Failed to fetch bulk actions');
  }
};

export const getBulkActionById: RequestHandler = async (req, res) => {
  const { actionId } = req.params;

  try {
    const job = await BulkJob.findByPk(actionId);
    if (!job) {
      return errorResponse(res, 'Bulk action not found', 'Not Found', 404);
    }
    return successResponse(res, job, 'Fetched bulk action');
  } catch (error: any) {
    return errorResponse(res, error, `Failed to fetch bulk action with ID ${actionId}`);
  }
};

export const getBulkActionStats: RequestHandler = async (req, res) => {
  const { actionId } = req.params;

  try {
    const logs = await BulkJobLog.findAll({ where: { job_id: actionId } });

    const stats = {
      success: logs.filter(log => log.status === 'success').length,
      failure: logs.filter(log => log.status === 'failure').length,
      skipped: logs.filter(log => log.status === 'skipped').length,
      total: logs.length,
    };

    return successResponse(res, stats, 'Fetched bulk action stats');
  } catch (error: any) {
    return errorResponse(res, error, 'Failed to fetch bulk action stats');
  }
};

export const getQueueStatus: RequestHandler = async (req, res) => {
  try {
    const counts = await bulkQueue.getJobCounts();
    res.status(200).json({ status: 'ok', counts });
  } catch (error: any) {
    console.error('❌ Error getting queue status:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createBulkAction: RequestHandler = async (req, res) => {
  try {
    const { action_type, entity_type, scheduled_at, contacts } = req.body;

    if (!action_type || !entity_type || !contacts || !Array.isArray(contacts)) {
      res.status(400).json({ message: 'Missing or invalid parameters' });
      return;
    }

    const job = await BulkJob.create({
      action_type,
      entity_type,
      status: scheduled_at ? 'scheduled' : 'pending',
      scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
      total_count: contacts.length,
      success_count: 0,
      failure_count: 0,
    });

    const delay = scheduled_at ? dayjs(scheduled_at).diff(new Date(), 'millisecond') : 0;

    await bulkQueue.add(
      'bulk-contact-job',
      {
        jobId: job.id,
        contacts,
      },
      {
        delay: Math.max(delay, 0),
      }
    );

    res.status(201).json({
      message: scheduled_at ? 'Bulk job scheduled' : 'Bulk job started',
      jobId: job.id,
    });
  } catch (err: any) {
    console.error('Failed to create bulk job:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};