import { NextFunction, Request, Response } from 'express';
import { findUserById } from '../services/user.service';
import { AppError } from '../utils/appError';
import { redisClient } from '../utils/connectRedis';
import { verifyJwt } from '../utils/jwt';

export const deserialiseUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let access_token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      access_token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.access_token) {
      access_token = req.cookies.access_token;
    }
    if (!access_token) {
      return next(new AppError(401, 'You are not logged in.'));
    }
    /** Validate the access token */
    const decoded = verifyJwt<{ sub: string }>(
      access_token,
      'accessTokenPublicKey'
    );
    if (!decoded) {
      return next(new AppError(401, 'Invalid token or user dose not exist.'));
    }
    /** Check if the user has a valid session */
    const session = await redisClient.get(decoded.sub);
    if (!session) {
      return next(new AppError(401, 'Invalid token or session has expired.'));
    }
    /** Check if the user still exists */
    const user = await findUserById(JSON.parse(session).userId);
    if (!user) {
      return next(new AppError(401, 'Invalid token or user does not exist.'));
    }
    /** Add use to res.locals */
    res.locals.user = user;
    next();
  } catch (error: any) {
    next(error);
  }
};
