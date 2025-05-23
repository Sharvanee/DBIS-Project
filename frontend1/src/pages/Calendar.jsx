import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";

const PageName = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
          navigate("/login"); // Redirect if not logged in
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };

    checkLogin();
  }, [navigate]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/Calendar`, {
            method: "GET",
            credentials: "include",
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="page-container">
      <h1>Page Title</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {}
          <p>Data: {JSON.stringify(data)}</p>
        </div>
      )}
    </div>
  );
};

export default PageName;
