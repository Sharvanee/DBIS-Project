import React from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";

const Navbar = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // TODO: Implement the handleLogout function.
  // This function should do an API call to log the user out.
  // On successful logout, redirect the user to the login page.
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include", // Ensure session is cleared
      });

      if (response.ok) {
        navigate("/login"); // Redirect to login page after logout
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // TODO: Use JSX to create a navigation bar with buttons for:
  // - Home
  // - Products
  // - Cart
  // - Logout
  return (
    <nav className="navbar">
            <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
