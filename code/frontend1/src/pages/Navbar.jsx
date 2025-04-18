// import React from "react";
// import { Link } from "react-router-dom";
// import { apiUrl } from "../config/config";
// import { useNavigate } from "react-router";

// const Navbar = () => {
//   const navigate = useNavigate();

//     const handleLogout = async (e) => {
//       e.preventDefault();
//       try {
//         const response = await fetch(`${apiUrl}/logout`, {
//           method: "POST",
//           credentials: "include", // Ensure session is cleared
//         });
  
//         if (response.ok) {
//           navigate("/login"); // Redirect to login page after logout
//         } else {
//           console.error("Logout failed");
//         }
//       } catch (error) {
//         console.error("Error logging out:", error);
//       }
//     };

//   return (
//     <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
//       <Link to="/dashboard" style={{ marginRight: "15px" }}>Dashboard</Link>
//       <Link to="/contests" style={{ marginRight: "15px" }}>Contests</Link>
//       <Link to="/problem-set" style={{ marginRight: "15px" }}>Problem Set</Link>
//       <Link to="/profile" style={{ marginRight: "15px" }}>Profile</Link>
//       <button onClick={handleLogout}>Logout</button>
//     </nav>
//   );
// };

// export default Navbar;

import React from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../config/config";
import { useNavigate } from "react-router";
import "./Navbar.css"; // ⬅️ Import your CSS here

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/dashboard" className="navbar-link">Dashboard</Link>
        <Link to="/contests" className="navbar-link">Contests</Link>
        <Link to="/problem-set" className="navbar-link">Problem Set</Link>
        <Link to="/profile" className="navbar-link">Profile</Link>
      </div>
      <button onClick={handleLogout} className="navbar-logout">Logout</button>
    </nav>
  );
};

export default Navbar;
