import { logger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        params: req.params,
        query: req.query,
        body: req.body
      });
      next();
    } catch (error) {
      logger.log('ERROR', `Validation failed: ${error}`);
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'fail',
          errors: error.errors
        });
      }
      next(error);
    }
  }
};
