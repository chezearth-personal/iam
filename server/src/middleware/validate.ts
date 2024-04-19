import { logger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // logger.log('DEBUG', `Validating request: method = ${req.method}`);
      // logger.log('DEBUG', `Validating request: originalUrl = ${req.originalUrl}`);
      // logger.log('DEBUG', `Validating request: body = ${JSON.stringify(req.body)}`);
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
