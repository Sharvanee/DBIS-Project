import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Signup = () => {
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

  const [formData, setFormData] = useState({
    handle: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [handleAvailable, setHandleAvailable] = useState(null);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "handle") {
      checkHandleAvailability(value);
    }
  };

  const checkHandleAvailability = async (handle) => {
    if (!handle.trim()) return;

    try {
      const response = await fetch(`${apiUrl}/checkHandle?handle=${handle}`);
      const data = await response.json();

      setHandleAvailable(response.ok && data.available);
    } catch (error) {
      console.error("Error checking handle availability:", error);
      setHandleAvailable(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!handleAvailable) {
      setError("Username (handle) is already taken. Please choose another.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          handle: formData.handle,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/dashboard");
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  // Handle Google signup
  const handleGoogleSignup = () => {
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {error && <p className="error-message">{error}</p>}
      
      <button onClick={handleGoogleSignup} className="google-signup-btn">
        Sign up with Google
      </button>
      
      <p>OR</p>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Username (Handle)"
            name="handle"
            value={formData.handle}
            onChange={handleChange}
            required
          />
          {handleAvailable === false && (
            <p className="error-message">Handle is already taken.</p>
          )}
          {handleAvailable === true && (
            <p className="success-message">Handle is available!</p>
          )}
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={handleAvailable === false}>
          Sign Up
        </button>
      </form>
      <p>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Signup;
