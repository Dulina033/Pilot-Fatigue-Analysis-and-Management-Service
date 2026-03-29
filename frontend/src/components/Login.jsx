// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load remembered email on component mount
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedEmail");
    if (remembered) {
      setEmail(remembered);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${config.API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.API_KEY}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token if returned from backend
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }

        // If remember me is checked, store in localStorage
        if (remember) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Navigate to home page
        navigate("/home");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error, please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotMessage("Password reset link has been sent to your email!");
    setTimeout(() => setForgotMessage(""), 5000);
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(/images/login-background.jpg)` }}
    >
      <div className="overlay centered-overlay">
        <div className="login-box">
          <div className="login-header">
            <img src="/images/logo.png" alt="Logo" className="logo" />
            <h2>Welcome</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                tabIndex={0}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>

            <div className="form-options">
              <label>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={isLoading}
                />
                Remember me
              </label>
              <a
                href="#"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </a>
            </div>

            {forgotMessage && (
              <p className="success-message">{forgotMessage}</p>
            )}

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
}
