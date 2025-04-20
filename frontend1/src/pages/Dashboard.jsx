// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router";
// import Navbar from "./Navbar"; // Navbar will be updated below
// import { apiUrl } from "../config/config";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState("User");

//   useEffect(() => {
//     const checkStatus = async () => {
//       try {
//         const res = await fetch(`${apiUrl}/isLoggedIn`, {
//           credentials: "include",
//         });

//         if (!res.ok) {
//           navigate("/login");
//           return;
//         }

//         const data = await res.json();
//         setUsername(data.username || "User");
//       } catch (err) {
//         console.error("Login check failed:", err);
//         navigate("/login");
//       }
//     };

//     checkStatus();
//   }, [navigate]);

//   return (
//     <div>
//       <Navbar />
//       <h1>Hi {username}!</h1>
//       <div>Welcome to the Contest Platform</div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "./Navbar";
import { apiUrl } from "../config/config";
import "./Dashboard.css"; // Make sure to create/import this file

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });

        if (!res.ok) {
          navigate("/login");
          return;
        }

        const data = await res.json();
        setUsername(data.handle || "User");
      } catch (err) {
        console.error("Login check failed:", err);
        navigate("/login");
      }
    };

    checkStatus();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <h1 className="dashboard-title">Hi, {username} 👋</h1>
        <p className="dashboard-subtitle">Welcome to the Contest Platform!</p>
        <p className="dashboard-description">
          Jump into contests, solve problems, and climb the leaderboard 🏆
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
