// middlewares/validateBulkUpdate.ts
import { Request, Response, NextFunction } from 'express';

const validateBulkUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { entityType, actionType, contacts } = req.body;

  if (!entityType || !actionType || !Array.isArray(contacts) || contacts.length === 0) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }
  for (const contact of contacts) {
    if (!contact.id || typeof contact.updates !== 'object') {
      res.status(400).json({ error: 'Each contact must have an id and updates object' });
      return;
    }
  }
  next();
};

export default validateBulkUpdate;
