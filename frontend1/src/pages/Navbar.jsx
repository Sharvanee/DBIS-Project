import React from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../config/config";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

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
        <Link to="/add-contest" className="navbar-link">Add Contest</Link>
      </div>
      <button onClick={handleLogout} className="navbar-logout">Logout</button>
    </nav>
  );
};

export default Navbar;
