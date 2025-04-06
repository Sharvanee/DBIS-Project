import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Problem = () => {
  const { id } = useParams(); // problem ID from URL
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        // Check if logged in
        const authRes = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });

        if (!authRes.ok) {
          navigate("/login");
          return;
        }

        // Fetch problem data
        const res = await fetch(`${apiUrl}/problems/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Problem not found");
        }

        const data = await res.json();
        setProblem(data);
      } catch (err) {
        console.error("Error fetching problem:", err);
        navigate("/not-found"); // Optional: handle 404 page
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, navigate]);

  if (loading) return <p>Loading problem...</p>;
  if (!problem) return <p>Problem not found.</p>;

  return (
    <div className="problem-container">
      <h1>{problem.title}</h1>
      <p><strong>Difficulty:</strong> {problem.difficulty}</p>
      <p><strong>Tags:</strong> {problem.tags.join(", ")}</p>
      <hr />
      <div className="problem-description">
        <p>{problem.description}</p>
      </div>
      {/* Optional: Add sample input/output, constraints, etc. */}
    </div>
  );
};

export default Problem;
