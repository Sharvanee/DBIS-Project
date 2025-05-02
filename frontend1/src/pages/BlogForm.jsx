import React, { useState } from "react";
import { apiUrl } from "../config/config";
import { useNavigate } from "react-router-dom";
import "./BlogForm.css";

const BlogForm = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Both title and content are required.");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/blogs`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) throw new Error("Failed to post blog");

      navigate("/blogs");
    } catch (err) {
      console.error(err);
      setError("An error occurred while submitting the blog.");
    }
  };

  return (
    <div className="blog-form-container">
      <h1>Write a New Blog</h1>
      {error && <p className="form-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Content:
          <textarea
            rows="12"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </label>

        <button type="submit">Publish</button>
      </form>
    </div>
  );
};

export default BlogForm;
