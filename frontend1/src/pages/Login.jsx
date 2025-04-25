import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import "./Login.css"; // <-- Make sure to import your CSS file

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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

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
        body: JSON.stringify({
          ...formData,
          rememberMe: formData.rememberMe, // Send rememberMe flag
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid handle/email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Sign In</h2>

      {error && <p className="login-error">{error}</p>}

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="login-input"
        />

        <div className="login-row">
          <label className="login-checkbox">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            Remember me for a month
          </label>
          <a href="/forgot-password" className="login-link">
            Forgot Password?
          </a>
        </div>

        <button type="submit" className="login-button">
          Login
        </button>
      </form>

      <p className="login-footer">
        Don't have an account?{" "}
        <a href="/signup" className="login-link">
          Sign up here
        </a>
      </p>
    </div>
  );
};

export default Login;


// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiUrl } from "../config/config";
// import "./Login.css";

// const Login = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkStatus = async () => {
//       try {
//         const response = await fetch(`${apiUrl}/isLoggedIn`, {
//           credentials: "include",
//         });
//         const data = await response.json();
//         if (response.ok) {
//           navigate("/dashboard");
//         }
//       } catch (error) {
//         console.error("Error checking login status:", error);
//       }
//     };
//     checkStatus();
//   }, [navigate]);

//   // 🌟 Initialize Google Sign-In
//   useEffect(() => {
//     /* global google */
//     if (window.google) {
//       google.accounts.id.initialize({
//         client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
//         callback: handleGoogleResponse,
//       });

//       google.accounts.id.renderButton(
//         document.getElementById("google-signin-button"),
//         { theme: "outline", size: "large" }
//       );
//     }
//   }, []);

//   const handleGoogleResponse = async (response) => {
//     try {
//       const googleToken = response.credential;

//       const res = await fetch(`${apiUrl}/auth/google`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ token: googleToken }),
//       });

//       if (res.ok) {
//         navigate("/dashboard");
//       } else {
//         const data = await res.json();
//         setError(data.message || "Google Sign-In failed.");
//       }
//     } catch (err) {
//       console.error("Google Sign-In error:", err);
//       setError("An error occurred during Google Sign-In.");
//     }
//   };

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     rememberMe: false,
//   });

//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const response = await fetch(`${apiUrl}/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         navigate("/dashboard");
//       } else {
//         setError(data.message || "Invalid email or password.");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       setError("An error occurred. Please try again.");
//     }
//   };

//   return (
//     <div className="login-container">
//       <h2 className="login-title">Sign In</h2>

//       {/* Google Sign-In button */}
//       <div id="google-signin-button" className="login-google-button"></div>

//       {error && <p className="login-error">{error}</p>}

//       <form onSubmit={handleSubmit} className="login-form">
//         <input
//           type="text"
//           placeholder="Email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//           className="login-input"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           name="password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//           className="login-input"
//         />

//         <div className="login-row">
//           <label className="login-checkbox">
//             <input
//               type="checkbox"
//               name="rememberMe"
//               checked={formData.rememberMe}
//               onChange={handleChange}
//             />
//             Remember me for a month
//           </label>
//           <a href="/forgot-password" className="login-link">
//             Forgot Password?
//           </a>
//         </div>

//         <button type="submit" className="login-button">
//           Login
//         </button>
//       </form>

//       <p className="login-footer">
//         Don't have an account?{" "}
//         <a href="/signup" className="login-link">
//           Sign up here
//         </a>
//       </p>
//     </div>
//   );
// };

// export default Login;
