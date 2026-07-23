import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError.ts';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

const SALT_ROUNDS = 10;

const sanitizeUser = (user: {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ApiError(409, 'Email is already in use');
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  const token = signToken({ userId: user.id, email: user.email });

  return { user: sanitizeUser(user), token };
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ userId: user.id, email: user.email });

  return { user: sanitizeUser(user), token };
};