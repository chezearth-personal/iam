import express from 'express';
import {
  loginUserHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerUserHandler
} from 'controllers';
import { deserialiseUser, requireUser, validate } from 'middleware';
import { createUserSchema, loginUserSchema } from 'schema';

const authRouter = express.Router();
/** Reggister user */
authRouter.post('/register', validate(createUserSchema), registerUserHandler);
/** Login user */
authRouter.post('/login', validate(loginUserSchema), loginUserHandler);
/** Logout user */
authRouter.post('/logout', deserialiseUser, requireUser, logoutHandler);
/** Refresh access token */
authRouter.get('/refresh', refreshAccessTokenHandler);

export { authRouter };
