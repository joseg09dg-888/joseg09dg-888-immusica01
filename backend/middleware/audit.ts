import { Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { logger } from '../utils/logger';

export const auditLog = (action: string, entityType?: string) => {
  return (req: any, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user?.id || null;
          const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
          const details = JSON.stringify({
            method: req.method,
            url: req.originalUrl,
            body: req.method !== 'GET' ? req.body : undefined,
            params: req.params,
            query: req.query,
            response: typeof body === 'string' ? JSON.parse(body) : body
          });

          db.prepare(`
            INSERT INTO audit_logs (user_id, action, entity_type, details, ip_address)
            VALUES (?, ?, ?, ?, ?)
          `).run(userId, action, entityType || null, details, ipAddress);
        } catch (err) {
          logger.error('Failed to create audit log', err);
        }
      }
      return originalSend.apply(res, arguments as any);
    };

    next();
  };
};
