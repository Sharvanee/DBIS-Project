import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import "./ContestList.css";
import Navbar from "./Navbar";

const ContestList = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [registeredContestIds, setRegisteredContestIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solvedCountMap, setSolvedCountMap] = useState({});
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);
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
    const fetchData = async () => {
      try {
        const [contestRes, registrationRes, solveCountRes, problemCountRes] = await Promise.all([
          fetch(`${apiUrl}/contests`, { credentials: "include" }),
          fetch(`${apiUrl}/myRegistrations`, { credentials: "include" }),
          fetch(`${apiUrl}/mySolvedCounts`, { credentials: "include" }),
          fetch(`${apiUrl}/contestProblemCounts`, { credentials: "include" }),
        ]);

        const contestsData = await contestRes.json();
        const registeredData = await registrationRes.json();
        const solvedMap = await solveCountRes.json();
        setSolvedCountMap(solvedMap);
        const problemCounts = await problemCountRes.json();

        const contestsWithCounts = contestsData.map((contest) => ({
          ...contest,
          problem_count: problemCounts[contest.contest_id] || 0,
        }));

        setContests(contestsWithCounts);
        setRegisteredContestIds(registeredData.map((reg) => reg.contest_id));
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const now = new Date();

  const activeContests = contests.filter((contest) => {
    const start = new Date(contest.start_time);
    const end = new Date(start.getTime() + contest.duration * 60 * 1000);
    return now >= start && now <= end;
  });

  const upcomingContests = contests.filter((contest) => {
    const start = new Date(contest.start_time);
    return now < start;
  });

  const pastContests = contests
    .filter((contest) => {
      const start = new Date(contest.start_time);
      const end = new Date(start.getTime() + contest.duration * 60 * 1000);
      return now > end;
    })
    .sort((a, b) => {
      const aEnd = new Date(new Date(a.start_time).getTime() + a.duration * 60 * 1000);
      const bEnd = new Date(new Date(b.start_time).getTime() + b.duration * 60 * 1000);
      return bEnd - aEnd;
    });

  const paginate = (array, page) =>
    array.slice((page - 1) * contestsPerPage, page * contestsPerPage);

  const activeContestsToShow = paginate(activeContests, activeCurrentPage);
  const upcomingContestsToShow = paginate(upcomingContests, upcomingCurrentPage);
  const pastContestsToShow = paginate(pastContests, pastCurrentPage);

  const totalActivePages = Math.ceil(activeContests.length / contestsPerPage);
  const totalUpcomingPages = Math.ceil(upcomingContests.length / contestsPerPage);
  const totalPastPages = Math.ceil(pastContests.length / contestsPerPage);

  const handlePageChange = (setter, newPage, totalPages) => {
    if (newPage >= 1 && newPage <= totalPages) setter(newPage);
  };

  const handleRegister = async (contestId) => {
    try {
      const res = await fetch(`${apiUrl}/contest/${contestId}/register`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        const updated = [...registeredContestIds];
        if (data.action === "registered") {
          updated.push(contestId);
          alert("Successfully registered!");
        } else if (data.action === "deregistered") {
          const index = updated.indexOf(contestId);
          if (index > -1) updated.splice(index, 1);
          alert("Successfully deregistered!");
        }
        setRegisteredContestIds(updated);
      } else {
        alert(data.message || "Action failed.");
      }
    } catch (err) {
      console.error("Action error:", err);
      alert("Something went wrong.");
    }
  };

  const formatDateOrTime = (date, forceFull = false) => {
    if (forceFull) {
      return date.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    return date.toLocaleDateString();
  };

  const renderContestTable = (
    title,
    contestList,
    currentPage,
    totalPages,
    onPageChange
  ) => {
    const showActions = title.toLowerCase().includes("upcoming");
    const showSolved = title.toLowerCase().includes("active");

    return (
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
                  <th>{title.includes("Upcoming") || title.includes("Active") ? "Starts" : "Started"}</th>
                  <th>{title.includes("Upcoming") || title.includes("Active") ? "Ends" : "Ended"}</th>
                  {showActions && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {contestList.map((contest, index) => {
                  const start = new Date(contest.start_time);
                  const end = new Date(start.getTime() + contest.duration * 60 * 1000);
                  const isRegistered = registeredContestIds.includes(contest.contest_id);
                  const solved = solvedCountMap[contest.contest_id] || 0;
                  const total = contest.problem_count || 0;

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
                      <td>{formatDateOrTime(start, true)}</td>
                      <td>{formatDateOrTime(end, true)}</td>
                      {showActions && (
                        <td>
                          <button
                            className={`action-button ${isRegistered ? "deregister" : "register"}`}
                            onClick={() => handleRegister(contest.contest_id)}
                          >
                            {isRegistered ? "Deregister" : "Register"}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pagination-controls">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {currentPage > 2 && (
                <>
                  <button onClick={() => onPageChange(1)}>1</button>
                  {currentPage > 3 && <span className="ellipsis">...</span>}
                </>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((num) =>
                  [currentPage, currentPage - 1, currentPage + 1].includes(num)
                )
                .map((num) => (
                  <button
                    key={num}
                    onClick={() => onPageChange(num)}
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
                  <button onClick={() => onPageChange(totalPages)}>
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </>
    );
  };

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
              (page) =>
                handlePageChange(setActiveCurrentPage, page, totalActivePages)
            )}
            {renderContestTable(
              "Upcoming Contests",
              upcomingContestsToShow,
              upcomingCurrentPage,
              totalUpcomingPages,
              (page) =>
                handlePageChange(setUpcomingCurrentPage, page, totalUpcomingPages)
            )}
            {renderContestTable(
              "Past Contests",
              pastContestsToShow,
              pastCurrentPage,
              totalPastPages,
              (page) =>
                handlePageChange(setPastCurrentPage, page, totalPastPages)
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ContestList;