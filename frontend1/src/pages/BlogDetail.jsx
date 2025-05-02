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
        const fetchData = async () => {
            try {
                const blogRes = await fetch(`${apiUrl}/blogs/${id}`, { credentials: "include" });
                if (blogRes.ok) {
                    const blogData = await blogRes.json();
                    setBlog(blogData);
                }

                const commentsRes = await fetch(`${apiUrl}/blogs/${id}/comments`, { credentials: "include" });
                if (commentsRes.ok) {
                    const commentsData = await commentsRes.json();
                    setComments(commentsData);
                }
            } catch (err) {
                console.error("Error fetching blog or comments:", err);
                setError("Failed to load blog details.");
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!newComment.trim()) return;

        try {
            const res = await fetch(`${apiUrl}/blogs/${id}/comments`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment }),
            });

            if (res.ok) {
                setNewComment("");
                const commentsRes = await fetch(`${apiUrl}/blogs/${id}/comments`, { credentials: "include" });
                if (commentsRes.ok) {
                    const data = await commentsRes.json();
                    setComments(data);
                }
            } else {
                setError("Failed to post comment.");
            }
        } catch (err) {
            console.error("Error posting comment:", err);
            setError("Failed to post comment.");
        }
    };

    const handleReaction = async (is_like) => {
        try {
            await fetch(`${apiUrl}/blogs/${id}/react`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_like }),
            });

            const res = await fetch(`${apiUrl}/blogs/${id}`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setBlog(data);
            }
        } catch (err) {
            console.error("Error reacting to blog:", err);
        }
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

                    {comments.length === 0 && <p>No comments yet.</p>}
                    {comments.map((c) => (
                        <div key={c.id} className="comment">
                            <strong>{c.display_name}</strong>: {c.content}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default BlogDetail;
