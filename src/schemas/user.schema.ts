import { object, string, TypeOf, z } from 'zod';
import { RoleEnumType } from 'entities';

const createUserSchema = object({
  body: object({
    firstName: string({ required_error: 'First name is required' }),
    lastName: string({ required_error: 'Last name is required' }),
    email: string({ required_error: 'Email address is required' })
      .email('Invalid email address'),
    password: string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(32, 'Password must be at most 32 characters'),
    passwordConfirm: string({ required_error: 'Please confirm your password' }),
    role: z.optional(z.nativeEnum(RoleEnumType)),
  }).refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Passwords do not match',
  })
});

const loginUserSchema = object({
  body: object({
    email: string({ required_error: 'Email address is required' })
      .email('Invalid email address'),
    password: string({ required_error: 'Password is required' })
      .min(8, 'Invalid email or password')
  })
});

type CreateUserInput = Omit<
  TypeOf<typeof createUserSchema>['body'],
  'passwordConfirm'
>;

type LoginUserInput = TypeOf<typeof loginUserSchema>['body'];

export { createUserSchema, loginUserSchema, CreateUserInput, LoginUserInput };