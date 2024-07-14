import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import config from 'config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { AppDataSource } from './utils/data-source';
import { AppError } from './utils/appError';
import { Router as AuthRouter } from './routes/auth.routes';
import { Router as UserRouter } from './routes/user.routes';
import { errorHandler, logger, successHandler } from './utils/logger';
import { redisClient } from './utils/connectRedis';
import { validateEnv } from './utils/validateEnv';
/** Nodemailer is used for emails; included here to create a fake email acc*/
// import nodemailer from 'nodemailer';

/** IIF to call Ethereal and create a new fake email account */
// (async function () {
  // const credentials = await nodemailer.createTestAccount();
  // console.log(credentials);
// })();

AppDataSource.initialize()
  .then(async () => {
    /** Validate env */
    validateEnv();
    // console.log(process.env);
    const app = express();

    /** TEMPLATE ENGINE */
    app.set('view engine', 'pug');
    app.set('views', `${__dirname}/views`);

    /** MIDDLEWARE */
    /** 1. Body parser */
    app.use(express.json({ limit: '10kb' }));
    /** 2. Logger */
    app.use(successHandler);
    app.use(errorHandler);
    /** 3. Cookie parser */
    app.use(cookieParser());
    /** 4. CORS */
    app.use(
      // cors()
      cors({
        origin: config.get<string>('origin'),
        credentials: true
      })
    );

    /** ROUTES */
    app.use('/api/v1/auth/', AuthRouter);
    app.use('/api/v1/users/', UserRouter);

    /** HEALTH CHECK */
    app.get('/api/v1/health-check', async (_, res: Response) => {
      const message = await redisClient.get('try');
      res.status(200).json({
        status: 'success',
        message
      });
    });

    /** UNHANDLED ROUTE */
    app.use('*', (req: Request, res: Response, next: NextFunction) => {
      next(new AppError(404, `Route ${req.originalUrl} not found`));
    })

    /** GLOBAL ERROR HANDLER */
    app.use(
      (error: AppError, req: Request, res: Response, next: NextFunction) => {
        error.status = error.status || 'error';
        error.statusCode = error.statusCode || 500;
        res.status(error.statusCode).json({
          status: error.status,
          message: error.message
        });
      }
    );

    /** START THE SERVER */
    const port = config.get<number>('port');
    app.listen(port);
    logger.log('INFO',`Server started on port ${port}`);
    
  })
  .catch(error => {
    logger.log('ERROR', error);
  });
