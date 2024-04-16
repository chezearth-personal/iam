import { createClient } from 'redis';
import { logger } from './';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });
const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.log('DEBUG', 'Redis connected successfully');
    redisClient.set('try', 'Hello, welcome to Express with TypeORM.');
  } catch (error) {
    logger.log('ERROR', 'Redis connection error:', error);
    setTimeout(connectRedis, 5000);
  }
};

connectRedis();

export { redisClient };
