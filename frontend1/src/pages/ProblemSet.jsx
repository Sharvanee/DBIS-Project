import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiUrl } from "../config/config";
import "./ProblemList.css";
import Navbar from "./Navbar";

const ProblemList = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchText, setSearchText] = useState("");
  const [tagFilter, setTagFilter] = useState("");
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

  const location = useLocation();
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const tag = params.get("tag");
  if (tag) {
    setTagFilter(tag);
  }
}, [location.search]);

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

  let filteredProblems = problems.filter((p) => {
    const matchesText =
      p.title.toLowerCase().includes(searchText.toLowerCase()) ||
      String(p.problem_id).includes(searchText);
    const matchesTag =
      tagFilter === "" ||
      p.tags.some((tag) =>
        tag.toLowerCase().includes(tagFilter.toLowerCase())
      );
    return matchesText && matchesTag;
  });

  let sortedProblems = [...filteredProblems];
  if (sortKey) {
    sortedProblems.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (sortKey === "problem_id") {
        const parse = (id) => {
          const match = id.match(/^(\d+)([A-Z]+)$/i);
          if (!match) return [Number.MAX_SAFE_INTEGER, id];
          return [parseInt(match[1], 10), match[2]];
        };
        const [numA, letterA] = parse(valA);
        const [numB, letterB] = parse(valB);
        if (numA === numB) {
          return sortOrder === "asc"
            ? letterA.localeCompare(letterB)
            : letterB.localeCompare(letterA);
        }
        return sortOrder === "asc" ? numA - numB : numB - numA;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
    });
  }

  // Pagination
  const indexOfLast = currentPage * problemsPerPage;
  const indexOfFirst = indexOfLast - problemsPerPage;
  const currentProblems = sortedProblems.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedProblems.length / problemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      <Navbar />
      <div className="problem-list-container">
        <h1 className="problem-heading">Problem Set</h1>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by ID or Title"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by Tag"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="loading">Loading problems...</p>
        ) : sortedProblems.length === 0 ? (
          <p className="no-problems">No problems found.</p>
        ) : (
          <>
            <table className="problem-table">
              <thead>
                <tr>
                  <th>
                    <div className="sort-header">
                      ID
                      <span className="sort-arrows">
                        <span
                          className={sortKey === "problem_id" && sortOrder === "asc" ? "active-arrow" : ""}
                          onClick={() => {
                            setSortKey("problem_id");
                            setSortOrder("asc");
                          }}
                        >
                          ▲
                        </span>
                        <span
                          className={sortKey === "problem_id" && sortOrder === "desc" ? "active-arrow" : ""}
                          onClick={() => {
                            setSortKey("problem_id");
                            setSortOrder("desc");
                          }}
                        >
                          ▼
                        </span>
                      </span>
                    </div>
                  </th>
                  <th>
                    Title
                  </th>
                  <th>
                    <div className="sort-header">
                      Difficulty{" "}
                      <span className="sort-arrows">
                        <span
                          className={sortKey === "difficulty" && sortOrder === "asc" ? "active-arrow" : ""}
                          onClick={() => {
                            setSortKey("difficulty");
                            setSortOrder("asc");
                          }}
                        >
                          ▲
                        </span>
                        <span
                          className={sortKey === "difficulty" && sortOrder === "desc" ? "active-arrow" : ""}
                          onClick={() => {
                            setSortKey("problem_id");
                            setSortOrder("desc");
                          }}
                        >
                          ▼
                        </span>
                      </span>
                    </div>
                  </th>

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
    </>
  );
};

export default ProblemList;
