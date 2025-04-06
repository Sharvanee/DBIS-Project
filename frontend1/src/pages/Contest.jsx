import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Contest = () => {
  const { id } = useParams(); // Contest ID from the route
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        // Check login
        const loginRes = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        if (!loginRes.ok) {
          navigate("/login");
          return;
        }

        // Fetch contest info
        const res = await fetch(`${apiUrl}/contests/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Contest not found");
        }

        const data = await res.json();
        setContest(data);
      } catch (err) {
        console.error("Error fetching contest:", err);
        navigate("/not-found");
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [id, navigate]);

  if (loading) return <p>Loading contest...</p>;
  if (!contest) return <p>Contest not found.</p>;

  return (
    <div className="contest-container">
      <h1>{contest.title}</h1>
      <p><strong>Start Time:</strong> {new Date(contest.start_time).toLocaleString()}</p>
      {/* <p><strong>Description:</strong> {contest.description}</p> */}

      <h2>Problems</h2>
      {contest.problems && contest.problems.length > 0 ? (
        <ul>
          {contest.problems.map((problem) => (
            <li key={problem.id}>
              <a href={`/problems/${problem.id}`}>{problem.title}</a> – {problem.difficulty}
            </li>
          ))}
        </ul>
      ) : (
        <p>No problems listed for this contest.</p>
      )}
    </div>
  );
};

export default Contest;
