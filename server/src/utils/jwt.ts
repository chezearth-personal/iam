import jwt, { SignOptions } from 'jsonwebtoken';
import config from 'config';

export { signJwt, verifyJwt };

/** ? Sign Access or Refresh Tokens */
function signJwt(
  payload: Object,
  keyName: 'accessTokenPrivateKey' | 'refreshTokenPrivateKey',
  options: SignOptions
) {
  // console.log('payload =', payload);
  // console.log('keyName =', keyName);
  // console.log('config.get(keyName) =', config.get<string>(keyName));
  const privateKey = Buffer.from(
    config.get<string>(keyName),
    'base64'
  ).toString('ascii');
  // console.log('privateKey =', privateKey);
  // console.log('options =', options);
  // console.log('(options && options) =', (options && options));
  const signedJwt = jwt.sign(payload, privateKey, {
    ...(options && options),
    algorithm: 'RS256'
  });
  // console.log('newJwt =', newJwt);
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
