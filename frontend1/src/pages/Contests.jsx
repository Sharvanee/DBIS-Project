import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import "./ContestList.css";
import Navbar from "./Navbar";

const ContestList = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const contestsPerPage = 15;

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
    const fetchContests = async () => {
      try {
        const res = await fetch(`${apiUrl}/contests`, {
          credentials: "include",
        });
        const data = await res.json();
        setContests(data);
      } catch (err) {
        console.error("Failed to fetch contests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const indexOfLast = currentPage * contestsPerPage;
  const indexOfFirst = indexOfLast - contestsPerPage;
  const currentContests = contests.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(contests.length / contestsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="contest-list-container">
      <Navbar />
      <h1>Contests</h1>

      {loading ? (
        <p>Loading contests...</p>
      ) : contests.length === 0 ? (
        <p>No contests available.</p>
      ) : (
        <>
          <table className="contest-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Start Time</th>
              </tr>
            </thead>
            <tbody>
              {currentContests.map((contest, index) => (
                <tr key={index}>
                  <td>
                    <a
                      href={`/contest/${contest.contest_id}`}
                      className="contest-link"
                    >
                      {contest.contest_name}
                    </a>
                  </td>
                  <td>{new Date(contest.start_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls with Ellipsis */}
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {/* First Page */}
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

            {/* Current, Previous, and Next Pages */}
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

            {/* Last Page */}
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

export default ContestList;
