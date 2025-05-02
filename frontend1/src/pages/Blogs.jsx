import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../config/config";
import Navbar from "./Navbar";
import "./Blogs.css";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const res = await fetch(`${apiUrl}/blogs`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <>
      <Navbar />
      <div className="blogs-container">
        <h1>Blogs</h1>
        {blogs.length === 0 ? (
          <p>No blogs yet.</p>
        ) : (
          blogs.map(blog => (
            <div className="blog-preview" key={blog.id}>
              <h2><Link to={`/blogs/${blog.id}`}>{blog.title}</Link></h2>
              <p>by {blog.author} on {new Date(blog.created_at).toLocaleDateString()}</p>
              <p>{blog.content.slice(0, 150)}...</p>
            </div>
          ))
        )}
      </div>
  
      {/* Floating Button */}
      <div className="floating-add-blog-button">
        <Link to="/add-blog" className="btn">+ Add Blog</Link>
      </div>
    </>
  );  
};

export default Blogs;
