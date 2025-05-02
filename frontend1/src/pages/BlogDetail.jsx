import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiUrl } from "../config/config";
import Navbar from "./Navbar";
import "./Blogs.css";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBlog();
    fetchComments();
  }, [id]);

  const fetchBlog = async () => {
    const res = await fetch(`${apiUrl}/blogs/${id}`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setBlog(data);
    }
  };

  const fetchComments = async () => {
    const res = await fetch(`${apiUrl}/blogs/${id}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const res = await fetch(`${apiUrl}/blogs/${id}/comments`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      setNewComment("");
      fetchComments();
    } else {
      setError("Failed to post comment.");
    }
  };

  const handleReaction = async (is_like) => {
    await fetch(`${apiUrl}/blogs/${id}/react`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_like }),
    });
    fetchBlog();
  };

  if (!blog) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="blog-detail">
        <h1>{blog.title}</h1>
        <p><em>by {blog.author} on {new Date(blog.created_at).toLocaleString()}</em></p>
        <div className="blog-content">
          <p>{blog.content}</p>
        </div>

        <div className="reactions">
          <button onClick={() => handleReaction(true)}>👍 Like ({blog.likes || 0})</button>
          <button onClick={() => handleReaction(false)}>👎 Dislike ({blog.dislikes || 0})</button>
        </div>

        <div className="comments">
          <h3>Comments</h3>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows="3"
            ></textarea>
            <button type="submit">Post</button>
            {error && <p className="form-error">{error}</p>}
          </form>

          {comments.map((c) => (
            <div key={c.id} className="comment">
              <strong>{c.username}</strong>: {c.content}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BlogDetail;
