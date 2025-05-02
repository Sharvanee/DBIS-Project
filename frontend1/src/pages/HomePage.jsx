import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import logo from "../logo.png";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <div className="top-box">
        <img src={logo} alt="Logo" className="site-logo" />
        <h1 className="main-heading">Master Programming with CodeQuest</h1>
      </div>

      <div className="bottom-section">
        <h2 className="sub-heading">Learn, Practice & Compete</h2>
        <p className="description">
          Join millions of developers in learning in-demand programming languages, solving
          real-world problems, and excelling in coding competitions.
        </p>

        <div className="buttons">
          <button className="sign-in" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="explore" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
