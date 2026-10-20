import {
    useEffect,
    useRef,
    useState,
  } from "react";

  import {
    Link,
    useSearchParams,
  } from "react-router-dom";

  import { api } from "../services/api";

  type VerificationStatus =
    | "VERIFYING"
    | "SUCCESS"
    | "ERROR";

  function VerifyEmail() {
    const [searchParams] =
      useSearchParams();

    const [status, setStatus] =
      useState<VerificationStatus>(
        "VERIFYING"
      );

    const [message, setMessage] =
      useState(
        "Verifying your email..."
      );

    const verificationStarted =
      useRef(false);

    useEffect(() => {
      if (verificationStarted.current) {
        return;
      }

      verificationStarted.current = true;

      const token =
        searchParams.get("token");

      if (!token) {
        setStatus("ERROR");
        setMessage(
          "Verification token is missing."
        );
        return;
      }

      const verifyEmail = async () => {
        try {
          const data = await api(
            "/auth/verify-email",
            {
              method: "POST",
              body: JSON.stringify({
                token,
              }),
            }
          );

          setStatus("SUCCESS");
          setMessage(data.message);
        } catch (error) {
          setStatus("ERROR");

          setMessage(
            error instanceof Error
              ? error.message
              : "Email verification failed."
          );
        }
      };

      verifyEmail();
    }, [searchParams]);

    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>TaskFlow-AI</h1>
          <h2>Email Verification</h2>

          <p className="auth-message">
            {message}
          </p>

          {status === "SUCCESS" && (
            <p className="auth-switch">
              Your email has been verified.{" "}
              <Link to="/login">
                Continue to Login
              </Link>
            </p>
          )}

          {status === "ERROR" && (
            <p className="auth-switch">
              <Link to="/login">
                Return to Login
              </Link>
            </p>
          )}
        </div>
      </div>
    );
  }

  export default VerifyEmail;
