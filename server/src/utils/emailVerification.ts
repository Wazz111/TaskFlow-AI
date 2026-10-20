import {
    createHash,
    randomBytes,
  } from "crypto";

  const VERIFICATION_TOKEN_BYTES = 32;
  const VERIFICATION_TOKEN_LIFETIME_HOURS = 24;

  export const generateEmailVerificationToken = () => {
    return randomBytes(
      VERIFICATION_TOKEN_BYTES
    ).toString("hex");
  };

  export const hashEmailVerificationToken = (
    token: string
  ) => {
    return createHash("sha256")
      .update(token)
      .digest("hex");
  };

  export const createEmailVerificationExpiry = () => {
    return new Date(
      Date.now() +
        VERIFICATION_TOKEN_LIFETIME_HOURS *
          60 *
          60 *
          1000
    );
  };