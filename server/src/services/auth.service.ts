import bcrypt from "bcryptjs";

import prisma from "../config/database";
import { signToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

import {
  RegisterInput,
  LoginInput,
} from "../validators/auth.validator";

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

const normalizeEmail = (email: string) => {
  return email.trim().toLowerCase();
};

export const registerUser = async (
  data: RegisterInput
) => {
  const email = normalizeEmail(data.email);

  const existingUser =
    await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

  if (existingUser) {
    throw new ApiError(
      409,
      "Email is already in use"
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      data.password,
      SALT_ROUNDS
    );

  const user =
    await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        password: hashedPassword,
      },
    });

  const token = signToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const loginUser = async (
  data: LoginInput
) => {
  const email = normalizeEmail(data.email);

  const user =
    await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

  if (!user) {
    throw new ApiError(
      401,
      "Invalid email or password"
    );
  }

  const isPasswordValid =
    await bcrypt.compare(
      data.password,
      user.password
    );

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid email or password"
    );
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};