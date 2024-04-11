import express from 'express';
import { getMeHandler } from 'controllers';
import { deserialiseUser, requireUser } from 'middleware';

const UserRouter = express.Router();
UserRouter.use(deserialiseUser, requireUser);
/** Get currently logged in user */
UserRouter.get('/me', getMeHandler);

export { UserRouter };
