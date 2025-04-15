// utils/responseHandler.ts
import { Response } from 'express';

export const successResponse = (
  res: Response,
  data: any,
  message = 'Request successful',
  statusCode = 200
): void => {
  res.status(statusCode).json({ success: true, message, data });
};

export const errorResponse = (
  res: Response,
  error: any,
  message = 'Something went wrong',
  statusCode = 500
): void => {
  console.error(message, error);
  res.status(statusCode).json({
    success: false,
    message,
    error: error.message || error,
  });
};
