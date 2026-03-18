import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';

export const authorize = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new CustomError('No autenticado', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new CustomError('No autorizado para esta acción', 403));
    }

    next();
  };
};
