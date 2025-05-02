import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import { apiUrl } from "../config/config";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [contests, setContests] = useState([]);
  const [blogs, setBlogs] = useState([]);

  const categories = ["data structures", "greedy", "graphs", "sorting"];

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

    const fetchContests = async () => {
      try {
        const res = await fetch(`${apiUrl}/contests`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setContests(data);
        } else {
          console.error("Failed to fetch contests");
        }
      } catch (err) {
        console.error("Contest fetch failed:", err);
      }
    };

    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${apiUrl}/blogs`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        } else {
          console.error("Failed to fetch blogs");
        }
      } catch (err) {
        console.error("Blog fetch failed:", err);
      }
    };

    checkStatus();
    fetchContests();
    fetchBlogs();
  }, [navigate]);

  const now = new Date();

  // Sorting contests by active, upcoming, and past priorities
  const sortedContests = contests
    .map((c) => {
      const startTime = new Date(c.start_time);
      const endTime = new Date(startTime.getTime() + c.duration * 60000);
      let status = "past";
      if (now < startTime) {
        status = "upcoming";
      } else if (now >= startTime && now <= endTime) {
        status = "active";
      }

      return { ...c, status, startTime, endTime };
    })
    .sort((a, b) => {
      // Prioritize active contests, then upcoming, then past
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      if (a.status === "upcoming" && b.status !== "upcoming") return -1;
      if (a.status !== "upcoming" && b.status === "upcoming") return 1;
      return a.startTime - b.startTime;
    })
    .slice(0, 4); // Limit to the top 4 contests

  // Sorting blogs by creation date (most recent first)
  const sortedBlogs = blogs
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4); // Limit to the top 4 latest blogs

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Hi, {username} 👋</h1>
          <p className="dashboard-subtitle">Welcome to CodeQuest!</p>
          <p className="dashboard-description">
            Jump into contests, solve problems, and climb the leaderboard 🏆
          </p>

          <div className="dashboard-section">
            <h2>Problem Categories</h2>
            <div className="categories-list">
            {categories.map((tag) => (
  <div key={tag} className="category-card">
    <Link to={`/problem-set?tag=${encodeURIComponent(tag)}`} className="category-link">
      {tag}
    </Link>
  </div>
))}

            </div>
          </div>

          <div className="dashboard-section">
            <h2>Contests</h2>
            {sortedContests.length === 0 ? (
              <p>No contests available.</p>
            ) : (
              <div className="contests-list">
                {sortedContests.map((c) => (
                  <div key={c.contest_id} className={`contest-card ${c.status}`}>
                    <h3>
                      <Link to={`/contest/${c.contest_id}`}>{c.contest_name}</Link>
                    </h3>
                    <p>{c.startTime.toLocaleString()}</p>
                    <span>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <h2>Blogs</h2>
            {sortedBlogs.length === 0 ? (
              <p>No blogs published yet.</p>
            ) : (
              <div className="blogs-list">
                {sortedBlogs.map((b) => (
                  <div key={b.id} className="blog-card">
                    <h3>
                      <Link to={`/blogs/${b.id}`}>{b.title}</Link>
                    </h3>
                    <p className="blog-author">by {b.author}</p>
                    <p>{b.content.slice(0, 150)}...</p> {/* Show the first part of the blog content */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
