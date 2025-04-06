import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <Link to="/dashboard" style={{ marginRight: "15px" }}>Dashboard</Link>
      <Link to="/contests" style={{ marginRight: "15px" }}>Contests</Link>
      <Link to="/problem-set" style={{ marginRight: "15px" }}>Problem Set</Link>
      <Link to="/profile" style={{ marginRight: "15px" }}>Profile</Link>
    </nav>
  );
};

export default Navbar;
