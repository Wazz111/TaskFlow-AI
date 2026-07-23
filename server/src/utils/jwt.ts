import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const JWT_EXPIRES_IN = '1d';

export interface JwtPayload {
  userId: string;
  email: string;
}

export const signToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
};

const isJwtPayload = (decoded: unknown): decoded is JwtPayload => {
  return (
    typeof decoded === 'object' &&
    decoded !== null &&
    typeof (decoded as Record<string, unknown>).userId === 'string' &&
    typeof (decoded as Record<string, unknown>).email === 'string'
  );
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (!isJwtPayload(decoded)) {
    throw new Error('Invalid token payload');
  }

  return decoded;
};