import config from 'config';
import { User } from '../entities/user.entity';
import { CreateUserInput } from '../schema/user.schema';
import { redisClient } from '../utils/connectRedis';
import { AppDataSource } from '../utils/data-source';
import { signJwt } from '../utils/jwt';
// import { logger } from '../utils/logger';

const userRepository = AppDataSource.getRepository(User);

export const createUser = async (input: CreateUserInput) => {
  return (await AppDataSource.manager.save(
    AppDataSource.manager.create(User, input)
  )) as User;
};

export const findUserByEmail = async ({ email }: { email: string }) => {
  // console.log('email obj =', { email });
  return await userRepository.findOneBy({ email });
};

export const findUserById = async (userId: string) => {
  return await userRepository.findOneBy({ id: userId });
}

export const findUser = async (query: Object) => {
  return await userRepository.findOneBy(query);
}

export const updateUserVerification = async (
  user: User,
  verified: boolean,
  verificationcode: string|null
) => {
  return await userRepository.update(user.id, { verified, verificationcode });
}

/** ? Sign access and refresh tokens */
export const signTokens = async (user: User) => {
  /** 1. Create session */
  redisClient.set(user.id, JSON.stringify(user), {
    EX: config.get<number>('redisCacheExpiresIn') * 60
  });
  /** 2. Create Access and Refresh tokens */
  const access_token = signJwt(
    { sub: user.id },
    'accessTokenPrivateKey',
    { expiresIn: `${config.get<number>('accessTokenExpiresIn')}m` }
  );
  const refresh_token = signJwt(
    { sub: user.id },
    'refreshTokenPrivateKey',
    { expiresIn: `${config.get<number>('refreshTokenExpiresIn')}m` }
  );
  return { access_token, refresh_token };
}
