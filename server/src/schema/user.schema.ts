import { object, string, TypeOf, z } from 'zod';
import { RoleEnumType } from '../entities/user.entity';

export const createUserSchema = object({
  body: object({
    firstname: string({ required_error: 'First name is required' }),
    lastname: string({ required_error: 'Last name is required' }),
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

export const forgotPasswordSchema = object({
  body: object({
    email: string({ required_error: 'Email address is required' })
      .email('Invalid email address')
  })
});

export const PasswordResetSchema = object({
  params: object({
    verificationcode: string()
  }),
  body: object({
    password: string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(32, 'Password must be at most 32 characters'),
    passwordConfirm: string({ required_error: 'Please confirm your password' }),
  }).refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Passwords do not match',
  })
});

export const updatePasswordSchema = object({
  password: string({ required_error: 'Password is required' }),
  verificationcode: z.optional(string()),
  verified: z.boolean()
});

export const loginUserSchema = object({
  body: object({
    email: string({ required_error: 'Email address is required' })
      .email('Invalid email address'),
    password: string({ required_error: 'Password is required' })
      .min(8, 'Invalid email or password')
  })
});

export const verifyEmailSchema = object({
  params: object({
    verificationcode: string()
  })
});

export type CreateUserInput = Omit<
  TypeOf<typeof createUserSchema>['body'],
  'passwordConfirm'
>;

export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>['body'];

export type PasswordResetInput = Omit<
  TypeOf<typeof PasswordResetSchema>['body'],
  'passwordConfirm'
> & TypeOf<typeof PasswordResetSchema>['params'];

export type UpdatePasswordInput = TypeOf<typeof updatePasswordSchema>;

export type LoginUserInput = TypeOf<typeof loginUserSchema>['body'];

export type VerifyEmailInput = TypeOf<typeof verifyEmailSchema>['params'];
