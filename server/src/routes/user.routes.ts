import express from 'express';
import { getMeHandler } from '../controllers/user.controller';
import { deserialiseUser } from '../middleware/deserialise-user';
import { requireUser } from '../middleware/require-user';

export const Router = express.Router();
Router.use(deserialiseUser, requireUser);
/** Get currently logged in user */
Router.get('/me', getMeHandler);
