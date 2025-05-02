import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import "./Contest.css";
import Navbar from "./Navbar";

const Contest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [problemStats, setProblemStats] = useState({});
  const [userLeaderboard, setUserLeaderboard] = useState([]);
  const [countdown, setCountdown] = useState("");
  const [endTime, setEndTime] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const loginRes = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        if (!loginRes.ok) {
          navigate("/login");
          return;
        }

        const res = await fetch(`${apiUrl}/contest/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Contest not found");

        const data = await res.json();
        setContest(data);

        const durationMinutes = Number(data.duration);
        if (!isNaN(durationMinutes)) {
          const end = new Date(new Date(data.start_time).getTime() + durationMinutes * 60000);
          setEndTime(end);
        }

        await fetchStats();
        await checkRegistration(); // ✅ check registration after login
      } catch (err) {
        console.error("Error fetching contest:", err);
        navigate("/not-found");
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch(`${apiUrl}/contest/${id}/stats`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch stats");

        const data = await res.json();
        setProblemStats(data.problemStats);
        setUserLeaderboard(data.userLeaderboard);
      } catch (err) {
        console.error("Stats error:", err);
      }
    };

    const checkRegistration = async () => {
      try {
        const res = await fetch(`${apiUrl}/contest/${id}/isRegistered`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to check registration");
        const data = await res.json();
        setIsRegistered(data.isRegistered);
      } catch (err) {
        console.error("Registration check error:", err);
      }
    };

    fetchContest();
  }, [id, navigate]);

  useEffect(() => {
    if (!endTime) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = endTime - now;

      if (diff <= 0) {
        setCountdown("Contest ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (loading) return <p className="loading">Loading contest...</p>;
  if (!contest) return <p className="error">Contest not found.</p>;

  const formattedStart = new Date(contest.start_time).toLocaleString();
  const formattedEnd = endTime ? endTime.toLocaleString() : "Loading...";

  return (
    <>
      <Navbar />
      <div className="contest-container">
        <h1 className="contest-title">{contest.title}</h1>
        <p className="contest-detail">
          <strong>Start Time:</strong> {formattedStart}
        </p>
        <p className="contest-detail">
          <strong>End Time:</strong> {formattedEnd}
        </p>
        <p className="contest-detail countdown">
          <strong>Time Left:</strong> <span>{countdown}</span>
        </p>

        <h2 className="section-heading">Problems in this Contest</h2>
        {contest.problems && contest.problems.length > 0 ? (
          <table className="problem-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Total Submissions</th>
                <th>Accepted Submissions</th>
                <th>Submit</th> {/* ✅ new column */}
              </tr>
            </thead>
            <tbody>
              {contest.problems.map((problem) => {
                const stats = problemStats[problem.id] || {
                  total_submissions: 0,
                  accepted_submissions: 0,
                };
                return (
                  <tr key={problem.id}>
                    <td>
                      <a href={`/problem/${problem.id}`}>{problem.title}</a>
                    </td>
                    <td>{problem.difficulty}</td>
                    <td>{stats.total_submissions}</td>
                    <td>{stats.accepted_submissions}</td>
                    <td>
                      {isRegistered ? (
                        <a href={`/problem/${problem.id}`}>Submit</a>
                      ) : (
                        <span style={{ color: "gray" }}>Register to submit</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="no-problems">No problems listed for this contest.</p>
        )}

        <h2 className="section-heading">Leaderboard</h2>
        {userLeaderboard.length > 0 ? (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Problems Solved</th>
                <th>First Solved At</th>
              </tr>
            </thead>
            <tbody>
              {userLeaderboard.map((user, index) => (
                <tr key={user.user_id}>
                  <td>{index + 1}</td>
                  <td>{user.handle}</td>
                  <td>{user.solved_count}</td>
                  <td>
  {user.first_solved_at
    ? new Date(user.first_solved_at).toLocaleString()
    : "—"}
</td>

                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No leaderboard data available yet.</p>
        )}
      </div>
    </>
  );
};

export default Contest;
