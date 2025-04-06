import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const ProblemList = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
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

  // Fetch problems from backend
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch(`${apiUrl}/problem-set`, {
          credentials: "include",
        });
        const json = await res.json();
        setProblems(json); // assuming backend sends an array of problems
      } catch (err) {
        console.error("Failed to fetch problems:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="problem-list-container">
      <h1>Problem Set</h1>

      {loading ? (
        <p>Loading problems...</p>
      ) : problems.length === 0 ? (
        <p>No problems found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Name</th>
              <th>Difficulty</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem, index) => (
              <tr key={index}>
                <td>
                  <a href={`/problems/${problem.id}`}>{problem.title}</a>
                </td>
                <td>{problem.name}</td>
                <td>{problem.difficulty}</td>
                <td>
                  {problem.tags.map((tag, i) => (
                    <span key={i} className="tag">
                      {tag}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProblemList;
