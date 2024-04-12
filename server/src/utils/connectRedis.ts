import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
    redisClient.set('try', 'Hello, welcome to Express with TypeORM.');
  } catch (error) {
    console.log('Redis connection error:', error);
    setTimeout(connectRedis, 5000);
  }
};

connectRedis();

export { redisClient };
