import { CookieOptions, NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import config from 'config';
import {
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  LoginUserInput,
  VerifyEmailInput
} from '../schema/user.schema';
import {
  createUser,
  findUser,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  signTokens
} from '../services/user.service';
import { AppError } from '../utils/appError';
import { Email } from '../utils/email';
import { logger } from '../utils/logger';
import { redisClient } from '../utils/connectRedis';
import { signJwt, verifyJwt } from '../utils/jwt';
import { User } from '../entities/user.entity';
// import {log} from 'console';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'strict',
  secure: process.env.NODE_ENV === 'development' ? false : true,
};

if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

const accessTokenCookieOptions: CookieOptions = {
  ...cookieOptions,
  expires: new Date(
    Date.now() + config.get<number>('accessTokenExpiresIn') * 60 * 1000
  ),
  maxAge: config.get<number>('accessTokenExpiresIn') * 60 * 1000
}

const refreshTokenCookieOptions: CookieOptions = {
  ...cookieOptions,
  expires: new Date(
    Date.now() + config.get<number>('refreshTokenExpiresIn') * 60 * 1000
  ),
  maxAge: config.get<number>('refreshTokenExpiresIn') * 60 * 1000
}

export const registerUserHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstname, lastname, password, email } = req.body;
    const newUser = await createUser({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password
    });
    const { hashedVerificationCode, verificationcode } = User.createVerificationCode();
    newUser.verificationcode = hashedVerificationCode;
    await newUser.save();

    /** Send verification email */
    const redirectUrl = `${config.get<string>(
      'origin'
    )}/${config.get<string>(
      'verifyEmailPath'
    )}/${verificationcode}`;
    try {
      await new Email(newUser, redirectUrl).sendVerificationCode();
      res.status(201).json({
        status: 'success',
        message: 'An email with a verification code has been sent to your email address'
      });
    } catch (error) {
      newUser.verificationcode = null;
      await newUser.save();
      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email, please try again.'
      });
    }
  } catch (error) {
    logger.log('ERROR', error);
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'fail',
        message: 'A user with that email already exists'
      });
    }
    next(error);
  }
};

export const verifyEmailHandler = async (
  req: Request<VerifyEmailInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const verificationcode = crypto
      .createHash('sha256')
      .update(req.params.verificationcode)
      .digest('hex');
    const user = await findUser({ verificationcode });
    if (!user) {
      return next(new AppError(401, 'Could not verify email'));
    }
    user.verified = true;
    user.verificationcode = null;
    await user.save();
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    next(error);
  }
};

export const forgotPasswordHandler = async (
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail({ email });
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }
    const { hashedVerificationCode, verificationcode } = User.createVerificationCode();
    user.verificationcode = hashedVerificationCode;
    user.verified = false;
    await user.save();
    /** Send confirmation email */
    const redirectUrl = `${config.get<string>(
      'origin'
    )}/${config.get<string>(
      'resetPasswordPath'
    )}/${verificationcode}`;
    try {
      await new Email(user, redirectUrl).sendPasswordResetToken();
      res.status(201).json({
        status: 'success',
        message: 'Check your email for a confirmation link to update your password'
      });
    } catch (error) {
      user.verificationcode = null
      await user.save();
      return res.status(509).json({
        status: 'error',
        message: 'There was an error sending the email, please try again.'
      })
    }
  } catch (error: any) {
    next(error);
  }
}

export const resetPasswordHandler = async (
  req: Request<ResetPasswordInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.log('DEBUG', `request body = ${JSON.stringify(req.body)}`);
    const { password } = req.body;
    logger.log('DEBUG', `Password: ${password}`);
    const verificationcode = crypto
      .createHash('sha256')
      .update(req.params.verificationcode)
      .digest('hex');
    /** 1. Find the user by querying on the verification code */
    const user = await findUser({ verificationcode });
    if (!user) {
      return next(new AppError(401, 'Could not update password'));
    }
    logger.log('DEBUG', 'User found');
    logger.log('DEBUG', `User: id = ${user.id}, email = ${user.email}, verified = ${user.verified}, verificationcode = ${user.verificationcode}, password = ${user.password}`);
    logger.log('DEBUG', `New password: ${password}`);
    /** 2. Update the user's password */
    await updateUserPassword(user, {
      password,
      ...{ verified: true, verificationcode: null }
    });
    /** 3. Send the reponse */
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    next(error);
  } 
}

export const loginUserHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail({ email });
    /** 1. Check if user exists and password is valid */
    if (!user) {
      return next(new AppError(400, 'Invalid email or password'));
    }
    /** 2. Check if user has verified their email */
    if (!user.verified) {
      return next(new AppError(400, 'Please verify your email address before logging in'));
    }
    /** 3. Check if the password is valid */
    if (!(await User.comparePasswords(password, user.password))) {
      return next(new AppError(400, 'Invalid email or password'));
    }
    /** 4. Sign access or refresh tokens */
    const { access_token, refresh_token } = await signTokens(user);
    /** 5. Add cookies */
    res.cookie('access_token', access_token, accessTokenCookieOptions);
    res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false
    });
    /** 6. Send response */
    res.status(200).json({
      status: 'success',
      access_token,
    });
  } catch (error: any) {
    next(error);
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    const message = 'Could not refresh access token';
    if (!refresh_token) {
      return next(new AppError(403, message));
    }
    /** Validate refresh token */
    const decoded = verifyJwt<{ sub: string }>(
      refresh_token,
      'refreshTokenPublicKey'
    );
    /** Check if the user has a valid session */
    const session = decoded && await redisClient.get(decoded.sub);
    if (!session) {
      return next(new AppError(403, message));
    }
    /** Check if the user still exists */
    const user = await findUserById(JSON.parse(session).id);
    if (!user) {
      return next(new AppError(403, message));
    }
    /** Sign new access token */
    const access_token = signJwt(
      { sub: user.id },
      'accessTokenPrivateKey',
      { expiresIn: `${config.get<number>('accessTokenExpiresIn')}m` }
    );
    /** Add cookies */
    res.cookie('access_token', access_token, accessTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false
    });
    /** Send response */
    res.status(200).json({
      status: 'success',
      access_token
    });
  } catch (error: any) {
    next(error);
  }
};

const logout = (res: Response) => {
  res.cookie('access_token', '', { maxAge: -1 });
  res.cookie('refresh_token', '', { maxAge: -1 });
  res.cookie('logged_in', '', { maxAge: -1 });
}

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    await redisClient.del(user.id);
    logout(res);
    res.status(200).json({
      status: 'success'
    });
  } catch (error: any) {
    next(error);
  }
};
