import express from 'express';
import { getMeHandler } from '../controllers/user.controller';
import { deserialiseUser } from '../middleware/deserialiseUser';
import { requireUser } from '../middleware/requireUser';

export const Router = express.Router();
Router.use(deserialiseUser, requireUser);
/** Get currently logged in user */
Router.get('/me', getMeHandler);
