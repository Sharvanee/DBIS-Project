// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router";
// import { apiUrl } from "../config/config";

// const ContestList = () => {
//   const navigate = useNavigate();
//   const [contests, setContests] = useState([]);
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

//   // Fetch contests from backend
//   useEffect(() => {
//     const fetchContests = async () => {
//       try {
//         const res = await fetch(`${apiUrl}/contests`, {
//           credentials: "include",
//         });
//         const data = await res.json();
//         setContests(data); // assuming array of contests
//       } catch (err) {
//         console.error("Failed to fetch contests:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchContests();
//   }, []);

//   return (
//     <div className="contest-list-container">
//       <h1>Contests</h1>

//       {loading ? (
//         <p>Loading contests...</p>
//       ) : contests.length === 0 ? (
//         <p>No contests available.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Title</th>
//               <th>Start Time</th>
//               <th>Duration</th>
//               <th>Division</th>
//             </tr>
//           </thead>
//           <tbody>
//             {/* console.log("Contests:", contests); */}
//             {contests.map((contest, index) => (
//               <tr key={index}>
//                 <td>
//                   <a href={`/contest/${contest.contest_id}`}>{contest.contest_name}</a>
//                 </td>
//                 <td>{new Date(contest.start_time).toLocaleString()}</td>
//                 <td>{contest.duration} mins</td>
//                 <td>{contest.division}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default ContestList;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "./ContestList.css"; // Add this line to import the CSS
import Navbar from "./Navbar";

const ContestList = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
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

  // Fetch contests from backend
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

  return (
    <div className="contest-list-container">
      <Navbar />
      <h1>Contests</h1>

      {loading ? (
        <p>Loading contests...</p>
      ) : contests.length === 0 ? (
        <p>No contests available.</p>
      ) : (
        <table className="contest-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Start Time</th>
              {/* <th>Duration</th>
              <th>Division</th> */}
            </tr>
          </thead>
          <tbody>
            {contests.map((contest, index) => (
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
                {/* <td>{contest.duration} mins</td>
                <td>{contest.division}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ContestList;
