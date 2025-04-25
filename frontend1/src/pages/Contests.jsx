import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import "./ContestList.css";
import Navbar from "./Navbar";

const ContestList = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state for active and past contests
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [pastCurrentPage, setPastCurrentPage] = useState(1);
  const contestsPerPage = 10;

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

  const now = new Date();

  // Filter active and past contests
  const activeContests = contests.filter((contest) => {
    const start = new Date(contest.start_time);
    const end = new Date(start.getTime() + contest.duration * 60 * 1000);
    return now >= start && now <= end;
  });

  const pastContests = contests.filter((contest) => {
    const start = new Date(contest.start_time);
    const end = new Date(start.getTime() + contest.duration * 60 * 1000);
    return now > end;
  });

  // Get active and past contests based on pagination
  const indexOfActiveLast = activeCurrentPage * contestsPerPage;
  const indexOfActiveFirst = indexOfActiveLast - contestsPerPage;
  const activeContestsToShow = activeContests.slice(indexOfActiveFirst, indexOfActiveLast);

  const indexOfPastLast = pastCurrentPage * contestsPerPage;
  const indexOfPastFirst = indexOfPastLast - contestsPerPage;
  const pastContestsToShow = pastContests.slice(indexOfPastFirst, indexOfPastLast);

  const totalActivePages = Math.ceil(activeContests.length / contestsPerPage);
  const totalPastPages = Math.ceil(pastContests.length / contestsPerPage);

  const handleActivePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalActivePages) {
      setActiveCurrentPage(newPage);
    }
  };

  const handlePastPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPastPages) {
      setPastCurrentPage(newPage);
    }
  };

  const renderContestTable = (title, contestList, currentPage, totalPages, handlePageChange) => (
    <>
      <h2>{title}</h2>
      {contestList.length === 0 ? (
        <p>No {title.toLowerCase()}.</p>
      ) : (
        <>
          <table className="contest-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Start Time</th>
                <th>End Time</th> {/* Added End Time column */}
              </tr>
            </thead>
            <tbody>
              {contestList.map((contest, index) => {
                const start = new Date(contest.start_time);
                const end = new Date(start.getTime() + contest.duration * 60 * 1000); // Calculate end time
                return (
                  <tr key={index}>
                    <td>
                      <a
                        href={`/contest/${contest.contest_id}`}
                        className="contest-link"
                      >
                        {contest.contest_name}
                      </a>
                    </td>
                    <td>{start.toLocaleString()}</td>
                    <td>{end.toLocaleString()}</td> {/* Display the calculated end time */}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
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
    </>
  );

  return (
    <>
      <Navbar />
      <div className="contest-list-container">
        <h1>Contests</h1>
        {loading ? (
          <p>Loading contests...</p>
        ) : contests.length === 0 ? (
          <p>No contests available.</p>
        ) : (
          <>
            {renderContestTable(
              "Active Contests",
              activeContestsToShow,
              activeCurrentPage,
              totalActivePages,
              handleActivePageChange
            )}
            {renderContestTable(
              "Past Contests",
              pastContestsToShow,
              pastCurrentPage,
              totalPastPages,
              handlePastPageChange
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ContestList;
