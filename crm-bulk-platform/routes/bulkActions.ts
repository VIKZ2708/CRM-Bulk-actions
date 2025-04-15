import express from 'express';
import {
  bulkUpdate,
  listBulkActions,
  getBulkActionById,
  getBulkActionStats,
  getQueueStatus,
  createBulkAction
} from '../controllers/bulkActionController';
import validateBulkUpdate from '../middlewares/validateBulkUpdate';

const router = express.Router();
router.get('/queue-status', getQueueStatus);

router.post('/bulk-update', validateBulkUpdate, bulkUpdate);
router.get('/bulk-actions', listBulkActions);
router.get('/bulk-actions/:actionId', getBulkActionById);
router.get('/bulk-actions/:actionId/stats', getBulkActionStats);
router.post('/scheduled-bulk-action', createBulkAction);



export default router;