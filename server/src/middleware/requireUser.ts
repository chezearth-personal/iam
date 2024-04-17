import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils';

export const requireUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return next(
        new AppError(400, `Session has expired or user doesn't exist.`)
      );
    }
    next();
  } catch (error: any) {
    next(error);
  }
};
