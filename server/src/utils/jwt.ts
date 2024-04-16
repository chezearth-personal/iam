import jwt, { SignOptions } from 'jsonwebtoken';
import config from 'config';

export { signJwt, verifyJwt };

/** ? Sign Access or Refresh Tokens */
function signJwt(
  payload: Object,
  keyName: 'accessTokenPrivateKey' | 'refreshTokenPrivateKey',
  options: SignOptions
) {
  const privateKey = Buffer.from(
    config.get<string>(keyName),
    'base64'
  ).toString('ascii');
  const signedJwt = jwt.sign(payload, privateKey, {
    ...(options && options),
    algorithm: 'RS256'
  });
  return signedJwt;
}

function verifyJwt <T>(
  token: string,
  keyName: 'accessTokenPublicKey' | 'refreshTokenPublicKey'
): T | null {
  try {
    const publicKey = Buffer.from(
      config.get<string>(keyName),
      'base64'
    ).toString('ascii');
    const decoded = jwt.verify(token, publicKey) as T;
    return decoded;
  } catch (error) {
    return null;
  }
}
