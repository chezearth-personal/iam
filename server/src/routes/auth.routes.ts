import express from 'express';
import {
  loginUserHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerUserHandler
} from 'controllers';
import { deserialiseUser, requireUser, validate } from 'middleware';
import { createUserSchema, loginUserSchema } from 'schema';

const AuthRouter = express.Router();
/** Reggister user */
AuthRouter.post('/register', validate(createUserSchema), registerUserHandler);
/** Login user */
AuthRouter.post('/login', validate(loginUserSchema), loginUserHandler);
/** Logout user */
AuthRouter.post('/logout', deserialiseUser, requireUser, logoutHandler);
/** Refresh access token */
AuthRouter.get('/refresh', refreshAccessTokenHandler);

export { AuthRouter };
