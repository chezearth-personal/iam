import express from 'express';
import {
  loginUserHandler,
  logoutHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
  verifyEmailHandler
} from '../controllers/auth.controller';
import { deserialiseUser } from '../middleware/deserialiseUser';
import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import {
  createUserSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  loginUserSchema
} from '../schema/user.schema';

export const Router = express.Router();
/** Reggister user */
Router.post('/register', validate(createUserSchema), registerUserHandler);
/** Verify email (after registering, and sending a verification email) */
Router.get(
  '/verify-email/:verificationcode',
  validate(verifyEmailSchema),
  verifyEmailHandler
);
/** Confirm email (after forgot password and sending a confirmation email) */
Router.post(
  '/reset-password/:verificationcode',
  validate(resetPasswordSchema),
  resetPasswordHandler
);
/** Forgot password */
Router.post('/forgot-password', forgotPasswordHandler);
/** Login user */
Router.post('/login', validate(loginUserSchema), loginUserHandler);
/** Logout user */
Router.post('/logout', deserialiseUser, requireUser, logoutHandler);
/** Refresh access token */
Router.get('/refresh', refreshAccessTokenHandler);
