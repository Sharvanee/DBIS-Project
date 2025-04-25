import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        await response.json();
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
  const [, setHandle] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "handle") {
      setHandle(value);
      if (typingTimeout) clearTimeout(typingTimeout);

      setTypingTimeout(
        setTimeout(() => {
          checkHandleAvailability(value);
        }, 500)
      );
    }
  };

  const checkHandleAvailability = async (handle) => {
    if (!handle.trim()) return false;

    try {
      const response = await fetch(`${apiUrl}/checkHandle?handle=${handle}`);
      const data = await response.json();
      if (response.ok && data.available !== undefined) {
        setHandleAvailable(data.available);
        return data.available;
      } else {
        setHandleAvailable(false);
        return false;
      }
    } catch (error) {
      console.error("Error checking handle availability:", error);
      setHandleAvailable(null);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const latestAvailability = await checkHandleAvailability(formData.handle);
    if (!latestAvailability) {
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
        headers: { "Content-Type": "application/json" },
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

  return (
    <div className="signup-wrapper">
      <div className="signup-box">
        <h2>Create your account</h2>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="signup-form">
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

          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={handleAvailable === false}>
            Sign Up
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>

      <style jsx>{`
        .signup-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f8fafc;
        }

        .signup-box {
          background: white;
          padding: 2.5rem 3rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        h2 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #1e293b;
        }

        .signup-form {
          display: flex;
          flex-direction: column;
        }

        .signup-form input {
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .signup-form input:focus {
          border-color: #6366f1;
          outline: none;
        }

        button {
          padding: 0.75rem 1rem;
          background-color: #6366f1;
          color: white;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        button:disabled {
          background-color: #a5b4fc;
          cursor: not-allowed;
        }

        button:hover:not(:disabled) {
          background-color: #4f46e5;
        }

        .error-message {
          color: #ef4444;
          margin-top: -0.75rem;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .success-message {
          color: #10b981;
          margin-top: -0.75rem;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .login-link {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.95rem;
        }

        .login-link a {
          color: #6366f1;
          text-decoration: none;
          font-weight: 500;
        }

        .login-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Signup;
