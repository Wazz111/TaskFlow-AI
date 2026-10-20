import { type FormEvent, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { register } from "../services/auth.service";
import { startVerificationCooldown } from "../utils/verificationCooldown";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [message, setMessage] =
    useState("");

  const navigate = useNavigate();

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Name is required.");
      return;
    }

    if (!email.trim()) {
      setMessage("Email is required.");
      return;
    }

    if (password.length < 8) {
      setMessage(
        "Password must be at least 8 characters long."
      );
      return;
    }

    try {
      await register({
        name,
        email,
        password,
      });

      const normalizedEmail = email.trim().toLowerCase();

      startVerificationCooldown(normalizedEmail);

      navigate("/check-email", {
        state: {
          email: normalizedEmail,
        },
      });

    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Registration failed"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>TaskFlow-AI</h1>
        <h2>Create an Account</h2>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="name">
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="password-input-area">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
              />

              <small>
                Password must be at least 8
                characters long.
              </small>
            </div>
          </div>

          <button
            className="auth-button"
            type="submit"
          >
            Register
          </button>
        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;