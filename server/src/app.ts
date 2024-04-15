import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import config from 'config';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { AppDataSource, AppError, validateEnv, redisClient } from './utils';
import { AuthRouter, UserRouter } from './routes';

AppDataSource.initialize()
  .then(async () => {
    // console.log('validating env...');
    /** Validate env */
    validateEnv();
    // console.log('process.env.NODE_ENV =', process.env.NODE_ENV);
    // console.log('process.env.PORT =', process.env.PORT);
    // console.log('process.env.POSTGRES_HOST =', process.env.POSTGRES_HOST);
    // console.log('process.env.POSTGRES_PORT =', process.env.POSTGRES_PORT);
    // console.log('process.env.POSTGRES_USER =', process.env.POSTGRES_USER);
    // console.log('process.env.POSTGRES_DB =', process.env.POSTGRES_DB);
    const app = express();
    
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

    /** Routes */
    app.use('/api/auth/', AuthRouter);
    app.use('/api/users/', UserRouter);

    /** Health checker */
    app.get('/api/health-checker', async (_, res: Response) => {
      const message = await redisClient.get('try');
      res.status(200).json({
        status: 'success',
        message
      });
    });

    /** Unhandled route */
    app.use('*', (req: Request, res: Response, next: NextFunction) => {
      next(new AppError(404, `Route ${req.originalUrl} not found`));
    })

    /** Global error handler */
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
