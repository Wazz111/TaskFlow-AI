import bcrypt from "bcryptjs";

import {
  createEmailVerificationExpiry,
  generateEmailVerificationToken,
  hashEmailVerificationToken,
} from "../utils/emailVerification";

import { sendVerificationEmail } from "./email.service";

import prisma from "../config/database";
import { signToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";


import {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ResendVerificationInput,
} from "../validators/auth.validator";

const SALT_ROUNDS = 10;

const sanitizeUser = (user: {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string | null;
  role: string;
  emailVerified: boolean;
  emailVerificationTokenHash: string | null;
  emailVerificationExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) => {
  const {
    password,
    emailVerificationTokenHash,
    emailVerificationExpiresAt,
    ...safeUser
  } = user;

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

  const verificationToken =
    generateEmailVerificationToken();

  const verificationTokenHash =
    hashEmailVerificationToken(
      verificationToken
    );

  const verificationExpiresAt =
    createEmailVerificationExpiry();

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        password: hashedPassword,

        emailVerificationTokenHash:
          verificationTokenHash,

        emailVerificationExpiresAt:
          verificationExpiresAt,

        emailVerificationLastSentAt:
          new Date(),
      },
    });

  const clientUrl =
    process.env.CLIENT_URL;

  if (!clientUrl) {
    console.error(
      "CLIENT_URL environment variable is not set"
    );
  } else {
    const verificationUrl =
      `${clientUrl}/verify-email?token=${verificationToken}`;

    void sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationUrl,
    }).catch((error) => {
      console.error(
        "Failed to send verification email:",
        error
      );
    });
  }

  return {
    user: sanitizeUser(user),
    message:
      "Registration successful. Please verify your email.",
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

  if (!user.emailVerified) {
    throw new ApiError(
      401,
      "Please verify your email before logging in"
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

export const verifyUserEmail = async (
  data: VerifyEmailInput
) => {
  const tokenHash =
     hashEmailVerificationToken(data.token);

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationTokenHash: tokenHash,
    },
  });

  if (!user) {
    throw new ApiError(
      400,
      "Invalid verification link"
    );
  }

  if (user.emailVerified) {
    return {
      message: "Email is already verified",
    };
  }

  if (
    !user.emailVerificationExpiresAt ||
    user.emailVerificationExpiresAt < new Date()
  ) {
    throw new ApiError(
      400,
      "Verification link has expired"
    );
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerified: true,
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    },
  });

  return {
    message: "Email verified successfully",
  };
};

const RESEND_COOLDOWN_MS = 60 * 1000;

const RESEND_MESSAGE =
  "If this email belongs to an unverified account, a verification email will be sent if eligible.";

export const resendUserVerificationEmail = async (
  data: ResendVerificationInput
) => {
  const email = normalizeEmail(data.email);

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
  });

  // Do not reveal whether an account exists.
  if (!user || user.emailVerified) {
    return { message: RESEND_MESSAGE };
  }

  const now = new Date();
  const cooldownCutoff = new Date(
    now.getTime() - RESEND_COOLDOWN_MS
  );

  const verificationToken =
    generateEmailVerificationToken();

  const tokenHash =
    hashEmailVerificationToken(verificationToken);

  // Atomically enforce the cooldown.
  const updated = await prisma.user.updateMany({
    where: {
      id: user.id,
      emailVerified: false,
      OR: [
        { emailVerificationLastSentAt: null },
        {
          emailVerificationLastSentAt: {
            lte: cooldownCutoff,
          },
        },
      ],
    },
    data: {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt:
        createEmailVerificationExpiry(),
      emailVerificationLastSentAt: now,
    },
  });

  if (updated.count === 0) {
    return { message: RESEND_MESSAGE };
  }

  try {
    const clientUrl = process.env.CLIENT_URL;

    if (!clientUrl) {
      throw new Error(
        "CLIENT_URL environment variable is not set"
      );
    }

    const verificationUrl = new URL(
      "/verify-email",
      clientUrl
    );

    verificationUrl.searchParams.set(
      "token",
      verificationToken
    );

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationUrl: verificationUrl.toString(),
    });
  } catch (error) {
    console.error(
      "Failed to resend verification email:",
      error
    );

    // Restore the previous link if sending failed.
    try {
      await prisma.user.updateMany({
        where: {
          id: user.id,
          emailVerificationTokenHash: tokenHash,
        },
        data: {
          emailVerificationTokenHash:
            user.emailVerificationTokenHash,
          emailVerificationExpiresAt:
            user.emailVerificationExpiresAt,
          emailVerificationLastSentAt:
            user.emailVerificationLastSentAt,
        },
      });
    } catch (rollbackError) {
      console.error(
        "Failed to restore verification token:",
        rollbackError
      );
    }
  }

  return { message: RESEND_MESSAGE };
};