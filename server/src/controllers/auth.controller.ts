import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema, verifyEmailSchema, resendVerificationSchema } from '../validators/auth.validator';
import { registerUser, loginUser, verifyUserEmail, resendUserVerificationEmail } from '../services/auth.service';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await registerUser(parsed.data);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await loginUser(parsed.data);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = verifyEmailSchema.parse(req.body);

    const result =
      await verifyUserEmail(data);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = resendVerificationSchema.parse(req.body);

    const result = await resendUserVerificationEmail(data);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};