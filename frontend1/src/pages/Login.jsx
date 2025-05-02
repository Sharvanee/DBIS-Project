import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkStatus();
  }, [navigate]);
  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        callback: handleGoogleResponse,
      });

      google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const googleToken = response.credential;

      const res = await fetch(`${apiUrl}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ token: googleToken }),
      });

      if (res.ok) {
        navigate("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "Google Sign-In failed.");
      }
    } catch (err) {
      console.error("Google Sign-In error:", err);
      setError("An error occurred during Google Sign-In.");
    }
  };

  const [formData, setFormData] = useState({
    handle: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign In</h2>

        <button className="google-btn">
          <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" />
          Sign in with Google
        </button>

        <div className="divider">
          <hr />
          <span>OR</span>
          <hr />
        </div>
        {error && <p className="login-error">{error}</p>}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            name="handle"
            placeholder="Handle"
            value={formData.handle}
            onChange={handleChange}
            className="input-field"
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
            />
            <span className="eye-icon" onClick={() => setShowPassword(prev => !prev)}>
              <img
                src={showPassword
                  ? "../assets/eye-off.svg"
                  : "../assets/eye-on.svg"}
                alt="Toggle password visibility"
                style={{ width: '20px', cursor: 'pointer' }}
              />
            </span>

          </div>

          <div className="remember-forgot">
            <label>
              <input type="checkbox" /> Remember me for a month
            </label>
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="signup-link">
          Don’t have an account? <a href="#">Sign up here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
