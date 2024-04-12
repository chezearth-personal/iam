import { NextFunction, Request, Response } from 'express';

export { getMeHandler };

async function getMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = res.locals.user;
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}
