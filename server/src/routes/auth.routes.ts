import express from 'express';
import {
  loginUserHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
  verifyEmailHandler
} from '../controllers/auth.controller';
import { deserialiseUser } from '../middleware/deserialiseUser';
import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import {
  createUserSchema,
  loginUserSchema,
  verifyEmailSchema
} from '../schema/user.schema';

export const Router = express.Router();
/** Reggister user */
Router.post('/register', validate(createUserSchema), registerUserHandler);
/** Verify email */
Router.get(
  '/verifyemail/:verificationcode',
  validate(verifyEmailSchema), verifyEmailHandler
);
/** Login user */
Router.post('/login', validate(loginUserSchema), loginUserHandler);
/** Logout user */
Router.post('/logout', deserialiseUser, requireUser, logoutHandler);
/** Refresh access token */
Router.get('/refresh', refreshAccessTokenHandler);
