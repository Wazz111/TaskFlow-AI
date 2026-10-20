import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Link, useLocation } from "react-router-dom";

import { api } from "../services/api";

import {
  getRemainingCooldown,
  startVerificationCooldown,
} from "../utils/verificationCooldown";

function CheckEmail() {
  const location = useLocation();

  const navigationState = location.state as {
    email?: string;
  } | null;

  const [email, setEmail] = useState(
    navigationState?.email ?? ""
  );

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Restore and update the countdown.
  useEffect(() => {
    const updateCountdown = () => {
      setCooldown(getRemainingCooldown(email));
    };

    updateCountdown();

    const interval = window.setInterval(
      updateCountdown,
      1000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [email]);

  const handleResend = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (
      sending ||
      getRemainingCooldown(normalizedEmail) > 0
    ) {
      return;
    }

    if (!normalizedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      const data = await api(
        "/auth/resend-verification",
        {
          method: "POST",
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      startVerificationCooldown(normalizedEmail);

      setCooldown(
        getRemainingCooldown(normalizedEmail)
      );

      setMessage(data.message);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to request verification email."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>TaskFlow-AI</h1>
        <h2>Check Your Email</h2>

        <p className="auth-message">
          Check your inbox for a verification link.
          You must verify your email before logging in.
        </p>

        <form
          className="check-email-form"
          onSubmit={handleResend}
        >
          <label htmlFor="resend-email">
            Email Address
          </label>

          <input
            id="resend-email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter your email"
            autoComplete="email"
            disabled={sending}
            required
          />

          <button
            className="auth-button"
            type="submit"
            disabled={sending || cooldown > 0}
          >
            {sending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend Verification Email"}
          </button>
        </form>

        {message && (
          <p className="auth-message" role="status">
            {message}
          </p>
        )}

        <p className="auth-switch">
          Already verified?{" "}
          <Link to="/login">
            Go to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default CheckEmail;