import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Login = () => {
  const navigate = useNavigate(); // Use this to redirect users


  // useEffect checks if the user is already logged in
  // if already loggedIn then it will simply navigate to the dashboard
  // TODO: Implement the checkStatus function.
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          navigate("/dashboard"); // Redirect if already logged in
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkStatus();
  }, [navigate]);

  // Read about useState to manage form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // TODO: This function handles input field changes
  const handleChange = (e) => {
    // Implement your logic here
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // TODO: Implement the login operation
  // This function should send form data to the server
  // and handle login success/failure responses.
  // Use the API you made for handling this.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure session cookies are stored
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/dashboard"); // Redirect on successful login
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  // TODO: Use JSX to create a login form with input fields for:
  // - Email
  // - Password
  // - A submit button
  return (
    <div className="login-container">
      <h2>Sign In</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="string"
            placeholder="Handle"
            name="handle"
            value={formData.handle}
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
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/signup">Sign up here</a>
      </p>
    </div>
  );
};

export default Login;
