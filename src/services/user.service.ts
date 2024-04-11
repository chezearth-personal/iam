import { User } from 'entities';
import { CreateUserInput } from 'schemas';
import { AppDataSource } from 'utils';

export { createUser, findUserByEmail, findUserById, findUser};
const userRepository = AppDataSource.getRepository(User);

async function createUser(input: CreateUserInput) {
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
