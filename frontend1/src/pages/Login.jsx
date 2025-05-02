import { useNavigate, Link } from 'react-router-dom';
import { apiUrl } from "../config/config";
import './Login.css';
import React, { useState, useEffect, useCallback } from 'react';
import eyeOn from '../assets/eye-on.svg';
import eyeOff from '../assets/eye-off.svg';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    handle: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        if (response.ok) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkStatus();
  }, [navigate]);

  // const handleGoogleResponse = useCallback(async (response) => {
  //   try {
  //     const googleToken = response.credential;
  
  //     const res = await fetch(`${apiUrl}/auth/google`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //       body: JSON.stringify({ token: googleToken }),
  //     });
  
  //     if (res.ok) {
  //       navigate("/dashboard");
  //     } else {
  //       const data = await res.json();
  //       setError(data.message || "Google Sign-In failed.");
  //     }
  //   } catch (err) {
  //     console.error("Google Sign-In error:", err);
  //     setError("An error occurred during Google Sign-In.");
  //   }
  // }, [navigate]);

  // useEffect(() => {
  //   if (window.google) {
  //     google.accounts.id.initialize({
  //       client_id: "524012542926-6bi2laama2478pjoilp4tthp40vf7fer.apps.googleusercontent.com",
  //       callback: handleGoogleResponse,
  //     });
  
  //     google.accounts.id.renderButton(
  //       document.getElementById("google-signin-button"),
  //       { theme: "outline", size: "large" }
  //     );
  //   }
  // }, [handleGoogleResponse]);
  

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
        setError(data.message || "Invalid handle or password.");
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

        {/* Google button custom */}
        {/* <button className="google-btn" onClick={() => { }}>
          <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" />
          Sign in with Google
        </button> */}

        <div id="google-signin-button" className="google-btn"></div>

        {/* OR divider */}
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
            <img
              src={showPassword ? eyeOn : eyeOff}
              alt="Toggle visibility"
              className="eye-icon"
              onClick={() => setShowPassword(prev => !prev)}
            />
          </div>


          <div className="remember-forgot">
            <label>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />{" "}
              Remember me for a month
            </label>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="signup-link">
          Don’t have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
