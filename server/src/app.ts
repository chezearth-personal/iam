import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import config from 'config';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { AppDataSource, AppError, validateEnv, redisClient } from './utils';
import { AuthRouter, UserRouter } from './routes';

// (async function() {
  // const credentials = await nodemailer.createTestAccount();
  // console.log(credentials);
// })();

AppDataSource.initialize()
  .then(async () => {
    // console.log('validating env...');
    /** Validate env */
    validateEnv();
    const app = express();

    /** TEMPLATE ENGINE */
    app.set('view engine', 'pug');
    app.set('views', `${__dirname}/views`);

    /** MIDDLEWARE */
    /** 1. Body parser */
    app.use(express.json({ limit: '10kb' }));
    /** 2. Logger */
    if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
    /** 3. Cookie parser */
    app.use(cookieParser());
    /** 4. CORS */
    app.use(
      cors({
        origin: config.get<string>('origin'),
        credentials: true
      })
    );

    /** ROUTES */
    app.use('/api/auth/', AuthRouter);
    app.use('/api/users/', UserRouter);

    /** HEALTH CHECK */
    app.get('/api/health-check', async (_, res: Response) => {
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

    /** Start the server */
    const port = config.get<number>('port');
    app.listen(port);
    console.log(`Server started on port ${port}`);
    
  })
  .catch(error => {
    console.log(error);
  });
