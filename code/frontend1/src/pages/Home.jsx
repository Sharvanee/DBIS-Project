import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

// Use the API you implemented earlier, 
// to check if the user is logged in or not
// if yes, navigate to the dashboard
// else to the login page

// use the React Hooks useNavigate and useEffect
// to implement this component
const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };

    checkUserLoggedIn();
  }, [navigate]);

  return <div>HomePage</div>;
};

export default Home;