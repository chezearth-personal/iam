import express from 'express';
import { getMeHandler } from 'controllers';
import { deserialiseUser, requireUser } from 'middleware';

const userRouter = express.Router();
userRouter.use(deserialiseUser, requireUser);
/** Get currently logged in user */
userRouter.get('/me', getMeHandler);

export { userRouter };
