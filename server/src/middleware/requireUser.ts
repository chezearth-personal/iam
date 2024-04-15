import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils';

export { requireUser };

async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = res.locals.user;
    if (!user) {
      return next(
        new AppError(400, `Session has expired or user doesn't exist.`)
      );
    }
    next();
  } catch (error) {
    next(error);
  }
}