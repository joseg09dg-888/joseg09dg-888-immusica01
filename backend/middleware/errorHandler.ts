import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config/config';
import db from '../config/database';
import { appEvents, EVENTS } from '../utils/events';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the error
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });

  // OpenClaw: Log to ia_logs for automated handling if it's a 500 error
  if (statusCode === 500) {
    try {
      db.prepare(`
        INSERT INTO ia_logs (action, details, status)
        VALUES (?, ?, ?)
      `).run('BUG_DETECTED', JSON.stringify({
        message,
        url: req.originalUrl,
        method: req.method,
        stack: err.stack,
        ip: req.ip
      }), 'pending');
      
      appEvents.emit(EVENTS.BUG_DETECTED, { message, url: req.originalUrl });
    } catch (e) {
      logger.error('Failed to log to ia_logs', e);
    }
  }

  // Send response
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: config.nodeEnv === 'production' && !err.isOperational 
      ? 'Algo salió mal en el servidor' 
      : message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
