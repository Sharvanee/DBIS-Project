import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import "./ProblemList.css";
import Navbar from "./Navbar";

const ProblemList = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 15;

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        if (!res.ok) navigate("/login");
      } catch (err) {
        console.error("Login check failed:", err);
        navigate("/login");
      }
    };
    checkLogin();
  }, [navigate]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch(`${apiUrl}/problem-set`, {
          credentials: "include",
        });
        const json = await res.json();
        setProblems(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Failed to fetch problems:", err);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const indexOfLast = currentPage * problemsPerPage;
  const indexOfFirst = indexOfLast - problemsPerPage;
  const currentProblems = problems.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(problems.length / problemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="problem-list-container">
      <Navbar />
      <h1 className="problem-heading">Problem Set</h1>

      {loading ? (
        <p className="loading">Loading problems...</p>
      ) : problems.length === 0 ? (
        <p className="no-problems">No problems found.</p>
      ) : (
        <>
          <table className="problem-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {currentProblems.map((problem, index) => (
                <tr key={index}>
                  <td>{problem.problem_id}</td>
                  <td>
                    <a
                      href={`/problem/${problem.problem_id}`}
                      className="problem-link"
                    >
                      {problem.title}
                    </a>
                  </td>
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

          {/* Pagination with Ellipsis */}
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {currentPage > 2 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className={currentPage === 1 ? "active-page" : ""}
                >
                  1
                </button>
                {currentPage > 3 && <span className="ellipsis">...</span>}
              </>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (num) =>
                  num === currentPage ||
                  num === currentPage - 1 ||
                  num === currentPage + 1
              )
              .map((num) => (
                <button
                  key={num}
                  onClick={() => handlePageChange(num)}
                  className={currentPage === num ? "active-page" : ""}
                >
                  {num}
                </button>
              ))}

            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && (
                  <span className="ellipsis">...</span>
                )}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={currentPage === totalPages ? "active-page" : ""}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProblemList;
