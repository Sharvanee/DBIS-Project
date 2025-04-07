import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";

const SingleSubmission = () => {
  const { id } = useParams(); // Get submission ID from URL
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if logged in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        if (!res.ok) {
          navigate("/login");
        }
      } catch (err) {
        console.error("Login check failed:", err);
        navigate("/login");
      }
    };

    checkLogin();
  }, [navigate]);

  // Fetch submission by ID
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await fetch(`${apiUrl}/submission/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setSubmission(data);
      } catch (err) {
        console.error("Failed to fetch submission:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  return (
    <div>
      <Navbar />
      <div className="submission-container">
        <h2>Submission Details</h2>

        {loading ? (
          <p>Loading submission...</p>
        ) : !submission ? (
          <p>Submission not found.</p>
        ) : (
          <div className="submission-details">
            <p>
              <strong>Problem:</strong>{" "}
              <a href={`/problem/${submission.problem_id}`}>
                {submission.problem_title}
              </a>
            </p>
            <p>
              <strong>Language:</strong> {submission.language}
            </p>
            <p>
              <strong>Verdict:</strong> {submission.verdict}
            </p>
            <p>
              <strong>Submitted:</strong>{" "}
              {new Date(submission.created_at).toLocaleString()}
            </p>
            <div>
              <strong>Code:</strong>
              <pre
                style={{
                  background: "#f4f4f4",
                  padding: "1rem",
                  borderRadius: "8px",
                  overflowX: "auto",
                }}
              >
                <code>{submission.code}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleSubmission;
