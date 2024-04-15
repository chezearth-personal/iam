import config from 'config';
import { User } from '../entities';
import { CreateUserInput } from 'schema';
import { redisClient, AppDataSource, signJwt } from '../utils';

const userRepository = AppDataSource.getRepository(User);
// console.log('User:', User);
// console.log('userRepository:', userRepository);

const createUser = async (input: CreateUserInput) => {
  // console.log('CreatUser...');
  // console.log('input:', input);
  // const user = new User();
  // const newUser = AppDataSource.manager.create(User, input);
  // console.log('newUser =', newUser);
  // return (await AppDataSource.manager.save(newUser)) as User;
  return (await AppDataSource.manager.save(
    AppDataSource.manager.create(User, input)
  )) as User;
}

const findUserByEmail = async ({ email }: { email: string }) => {
  return await userRepository.findOneBy({ email });
}

const findUserById = async (userId: string) => {
  return await userRepository.findOneBy({ id: userId });
}

const findUser = async (query: Object) => {
  return await userRepository.findOneBy(query);
}

/** ? Sign access and refresh tokens */
const signTokens = async (user: User) => {
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

export { createUser, findUserByEmail, findUserById, findUser, signTokens };
