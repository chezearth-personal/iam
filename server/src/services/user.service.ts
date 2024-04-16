import config from 'config';
import { User } from '../entities';
import { CreateUserInput } from 'schema';
import { redisClient, AppDataSource, signJwt } from '../utils';

const userRepository = AppDataSource.getRepository(User);

export { createUser, findUserByEmail, findUserById, findUser, signTokens };

async function createUser(input: CreateUserInput) {
  // console.log('CreatUser...');
  // console.log('input:', input);
  return (await AppDataSource.manager.save(
    AppDataSource.manager.create(User, input)
  )) as User;
}

async function findUserByEmail({ email }: { email: string }) {
  return await userRepository.findOneBy({ email });
}

async function findUserById(userId: string) {
  return await userRepository.findOneBy({ id: userId });
}

async function findUser(query: Object) {
  return await userRepository.findOneBy(query);
}

/** ? Sign access and refresh tokens */
async function signTokens(user: User) {
  /** 1. Create session */
  // console.log('signTokens(): user =', user);
  // console.log('signTokens(): user.id =', user.id);
  console.log('redisCacheExpiresIn =', config.get<number>('redisCacheExpiresIn') * 60);
  redisClient.set(user.id, JSON.stringify(user), {
    EX: config.get<number>('redisCacheExpiresIn') * 60
  });
  // console.log(`redisClient.get(${user.id}) =`, await redisClient.get(user.id));
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
  // console.log('access_token:', access_token);
  
  return { access_token, refresh_token };
}
