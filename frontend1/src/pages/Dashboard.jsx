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
  const [categories, setCategories] = useState([
    "data structures",
    "greedy",
    "graphs",
    "sorting"
  ]);

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
  const sortedContests = contests
    .map((c) => {
      const startTime = new Date(c.start_time);
      const endTime = new Date(startTime.getTime() + c.duration * 60000);
      let status = "past";
      if (now < startTime) status = "upcoming";
      else if (now >= startTime && now <= endTime) status = "active";
      return { ...c, status, startTime, endTime };
    })
    .sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      if (a.status === "upcoming" && b.status !== "upcoming") return -1;
      if (a.status !== "upcoming" && b.status === "upcoming") return 1;
      return a.startTime - b.startTime;
    })
    .slice(0, 6);

  const sortedBlogs = blogs
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="hero">
          <h1>Welcome back, <span>{username}</span>!</h1>
          <p>Sharpen your skills, compete, and grow every day with CodeQuest.</p>
        </div>

        <section className="section">
          <h2>Problem Categories</h2>
          <div className="grid categories">
            {categories.map((tag) => (
              <Link
                key={tag}
                to={`/problem-set?tag=${encodeURIComponent(tag)}`}
                className="card category"
              >
                <span>{tag}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Contests</h2>
          <div className="grid contests">
            {sortedContests.length === 0 ? (
              <p>No contests available.</p>
            ) : (
              sortedContests.map((c) => (
                <Link key={c.contest_id} to={`/contest/${c.contest_id}`} className={`card contest ${c.status}`}>
                  <h3>{c.contest_name}</h3>
                  <p>{c.startTime.toLocaleString()}</p>
                  <span className="badge">{c.status}</span>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="section">
          <h2>Latest Blogs</h2>
          <div className="grid blogs">
            {sortedBlogs.length === 0 ? (
              <p>No blogs published yet.</p>
            ) : (
              sortedBlogs.map((b) => (
                <Link key={b.id} to={`/blogs/${b.id}`} className="card blog">
                  <h3>{b.title}</h3>
                  <p className="meta">By {b.author}</p>
                  <p>{b.content.slice(0, 120)}...</p>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
