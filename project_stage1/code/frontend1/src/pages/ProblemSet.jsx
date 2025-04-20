// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiUrl } from "../config/config";

// const ProblemList = () => {
//   const navigate = useNavigate();
//   const [problems, setProblems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Check if user is logged in
//   useEffect(() => {
//     const checkLogin = async () => {
//       try {
//         const res = await fetch(`${apiUrl}/isLoggedIn`, {
//           credentials: "include",
//         });
//         if (!res.ok) {
//           navigate("/login");
//         }
//       } catch (err) {
//         console.error("Login check failed:", err);
//         navigate("/login");
//       }
//     };
//     checkLogin();
//   }, [navigate]);

//   // Fetch problems from backend
//   useEffect(() => {
//     const fetchProblems = async () => {
//       try {
//         const res = await fetch(`${apiUrl}/problem-set`, {
//           credentials: "include",
//         });
//         const json = await res.json();

//         if (Array.isArray(json)) {
//           setProblems(json);
//         } else {
//           setProblems([]); // Prevents map() error
//         }
//       } catch (err) {
//         console.error("Failed to fetch problems:", err);
//         setProblems([]); // Handle errors by setting an empty array
//       } finally {
//         setLoading(false);
//       }
//     };


//     fetchProblems();
//   }, []);

//   return (
//     <div className="problem-list-container">
//       <h1>Problem Set</h1>

//       {loading ? (
//         <p>Loading problems...</p>
//       ) : problems.length === 0 ? (
//         <p>No problems found.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Title</th>
//               <th>Difficulty</th>
//               <th>Tags</th>
//             </tr>
//           </thead>
//           <tbody>
//             {problems.map((problem, index) => (
//               <tr key={index}>
//                 <td>{problem.problem_id}</td>
//                 <td>
//                 <a href={`/problem/${problem.problem_id}`}>{problem.title}</a>
//                 </td>
//                 <td>{problem.difficulty}</td>
//                 <td>
//                   {problem.tags.map((tag, i) => (
//                     <span key={i} className="tag">
//                       {tag}
//                     </span>
//                   ))}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default ProblemList;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import "./ProblemList.css"; // Import the corresponding CSS file
import Navbar from "./Navbar";


const ProblemList = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch(`${apiUrl}/problem-set`, {
          credentials: "include",
        });
        const json = await res.json();

        if (Array.isArray(json)) {
          setProblems(json);
        } else {
          setProblems([]);
        }
      } catch (err) {
        console.error("Failed to fetch problems:", err);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="problem-list-container">
      <Navbar />
      <h1 className="problem-heading">Problem Set</h1>

      {loading ? (
        <p className="loading">Loading problems...</p>
      ) : problems.length === 0 ? (
        <p className="no-problems">No problems found.</p>
      ) : (
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
            {problems.map((problem, index) => (
              <tr key={index}>
                <td>{problem.problem_id}</td>
                <td>
                  <a href={`/problem/${problem.problem_id}`} className="problem-link">
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
      )}
    </div>
  );
};

export default ProblemList;
