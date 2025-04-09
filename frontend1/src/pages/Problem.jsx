// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router";
// import { apiUrl } from "../config/config";

// const Problem = () => {
//   const { id } = useParams(); // problem ID from URL
//   const navigate = useNavigate();
//   const [problem, setProblem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showSubmit, setShowSubmit] = useState(false);
//   const [language, setLanguage] = useState("cpp");
//   const [code, setCode] = useState("");
//   const [uploadMode, setUploadMode] = useState("text"); // 'text' or 'file'
//   const [file, setFile] = useState(null);

//   useEffect(() => {
//     const fetchProblem = async () => {
//       try {
//         // Check if logged in
//         const authRes = await fetch(`${apiUrl}/isLoggedIn`, {
//           credentials: "include",
//         });

//         if (!authRes.ok) {
//           navigate("/login");
//           return;
//         }

//         // Fetch problem data
//         const res = await fetch(`${apiUrl}/problem/${id}`, {
//           credentials: "include",
//         });

//         if (!res.ok) {
//           throw new Error("Problem not found");
//         }

//         const data = await res.json();
//         setProblem(data);
//       } catch (err) {
//         console.error("Error fetching problem:", err);
//         navigate("/not-found"); // Optional: handle 404 page
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProblem();
//   }, [id, navigate]);

//   if (loading) return <p>Loading problem...</p>;
//   if (!problem) return <p>Problem not found.</p>;

//   return (
//     <div className="problem-container">
//       <h1>{problem.title}</h1>
//       <p><strong>Difficulty:</strong> {problem.difficulty}</p>
//       <p><strong>Tags:</strong> {problem.tags.join(", ")}</p>
//       <hr />
//       <div className="problem-description">
//         <p>{problem.description}</p>
//       </div>
//       <button onClick={() => setShowSubmit(true)}>Submit Solution</button>
//       {showSubmit && (
//   <div className="submission-form">
//     <h2>Submit Your Solution</h2>
    
//     <label>Choose Language: </label>
//     <select value={language} onChange={(e) => setLanguage(e.target.value)}>
//       <option value="cpp">C++</option>
//       <option value="python">Python</option>
//       <option value="java">Java</option>
//       {/* Add more as needed */}
//     </select>

//     <br /><br />

//     <label>Code:</label><br />
//     <textarea
//       value={code}
//       onChange={(e) => setCode(e.target.value)}
//       rows="15"
//       cols="80"
//       placeholder="Type your solution here..."
//     />

//     <br /><br />

//     <button onClick={async () => {
//       try {
//         const res = await fetch(`${apiUrl}/submit`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           credentials: "include",
//           body: JSON.stringify({
//             problemId: id,
//             language,
//             code,
//           }),
//         });

//         const result = await res.json();
//         if (res.ok) {
//           alert("Submission successful!");
//           setShowSubmit(false);
//           setCode("");
//         } else {
//           alert("Submission failed: " + result.error);
//         }
//       } catch (err) {
//         console.error("Submission error:", err);
//         alert("Something went wrong!");
//       }
//     }}>Submit</button>

//     <button onClick={() => setShowSubmit(false)}>Cancel</button>
//   </div>
// )}

//       <div className="submission-table">
//         <h2>Submissions</h2>
//         <table>
//           <thead>
//             <tr>
//               <th>Submission ID</th>
//               <th>Status</th>
//               <th>Time</th>
//               <th>Memory</th>
//               <th>Language</th>
//             </tr>
//           </thead>
//           <tbody>
//             {problem.submissions.map((submission) => (
//               <tr key={submission.id}>
//                 <td><a href={`/submission/${submission.id}`}>{submission.id}</a></td>
//                 <td>{submission.verdict}</td>
//                 <td>{submission.runtime}</td>
//                 <td>{submission.memory}</td>
//                 <td>{submission.language}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       {/* Optional: Add sample input/output, constraints, etc. */}
//     </div>
//   );
// };

// export default Problem;
    
//   const [uploadMode, setUploadMode] = useState("text"); // 'text' or 'file'
//   const [file, setFile] = useState(null);

//       <button onClick={() => setShowSubmit(true)}>Submit Solution</button>
//       {showSubmit && (
//   <div className="submission-form">
//     <h2>Submit Your Solution</h2>
    
//     <label>Choose Language: </label>
//     <select value={language} onChange={(e) => setLanguage(e.target.value)}>
//       <option value="cpp">C++</option>
//       <option value="python">Python</option>
//       <option value="java">Java</option>
//       {/* Add more as needed */}
//     </select>

//     <br /><br />

//     <label>Code:</label><br />
//     <textarea
//       value={code}
//       onChange={(e) => setCode(e.target.value)}
//       rows="15"
//       cols="80"
//       placeholder="Type your solution here..."
//     />

//     <br /><br />

//     <button onClick={async () => {
//       try {
//         const res = await fetch(`${apiUrl}/submit`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           credentials: "include",
//           body: JSON.stringify({
//             problemId: id,
//             language,
//             code,
//           }),
//         });

//         const result = await res.json();
//         if (res.ok) {
//           alert("Submission successful!");
//           setShowSubmit(false);
//           setCode("");
//         } else {
//           alert("Submission failed: " + result.error);
//         }
//       } catch (err) {
//         console.error("Submission error:", err);
//         alert("Something went wrong!");
//       }
//     }}>Submit</button>

//     <button onClick={() => setShowSubmit(false)}>Cancel</button>
//   </div>
// )}


import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Problem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [uploadMode, setUploadMode] = useState("text"); // 'text' or 'file'
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const authRes = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });

        if (!authRes.ok) {
          navigate("/login");
          return;
        }

        const res = await fetch(`${apiUrl}/problem/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Problem not found");
        }

        const data = await res.json();
        setProblem(data);
      } catch (err) {
        console.error("Error fetching problem:", err);
        navigate("/not-found");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, navigate]);

  if (loading) return <p>Loading problem...</p>;
  if (!problem) return <p>Problem not found.</p>;

  return (
    <div className="problem-container">
      <h1>{problem.title}</h1>
      <p><strong>Difficulty:</strong> {problem.difficulty}</p>
      <p><strong>Tags:</strong> {problem.tags.join(", ")}</p>
      <hr />
      <div className="problem-description">
        <p>{problem.description}</p>
      </div>
      <button onClick={() => setShowSubmit(true)}>Submit Solution</button>

      {showSubmit && (
        <div className="submission-form">
          <h2>Submit Your Solution</h2>

          <label>Choose Language: </label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <br /><br />

          <label>
            <input
              type="radio"
              checked={uploadMode === "text"}
              onChange={() => setUploadMode("text")}
            />
            Type Code
          </label>
          <label style={{ marginLeft: "15px" }}>
            <input
              type="radio"
              checked={uploadMode === "file"}
              onChange={() => setUploadMode("file")}
            />
            Upload File
          </label>

          <br /><br />

          {uploadMode === "text" ? (
            <>
              <label>Code:</label><br />
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows="15"
                cols="80"
                placeholder="Type your solution here..."
              />
            </>
          ) : (
            <>
              <input
                type="file"
                accept=".cpp,.py,.java,.txt"
                onChange={(e) => {
                  const uploadedFile = e.target.files[0];
                  setFile(uploadedFile);
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setCode(event.target.result);
                  };
                  reader.readAsText(uploadedFile);
                }}
              />
              {file && <p>Selected file: {file.name}</p>}
            </>
          )}

          <br /><br />

          <button onClick={async () => {
            try {
              const res = await fetch(`${apiUrl}/submit`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  problemId: id,
                  language,
                  code,
                }),
              });

              const result = await res.json();
              if (res.ok) {
                alert("Submission successful!");
                setShowSubmit(false);
                setCode("");
                setFile(null);
              } else {
                alert("Submission failed: " + result.error);
              }
            } catch (err) {
              console.error("Submission error:", err);
              alert("Something went wrong!");
            }
          }}>Submit</button>

          <button onClick={() => setShowSubmit(false)}>Cancel</button>
        </div>
      )}

      <div className="submission-table">
        <h2>Submissions</h2>
        <table>
          <thead>
            <tr>
              <th>Submission ID</th>
              <th>Status</th>
              <th>Time</th>
              <th>Memory</th>
              <th>Language</th>
            </tr>
          </thead>
          <tbody>
            {problem.submissions.map((submission) => (
              <tr key={submission.id}>
                <td><a href={`/submission/${submission.id}`}>{submission.id}</a></td>
                <td>{submission.verdict}</td>
                <td>{submission.runtime}</td>
                <td>{submission.memory}</td>
                <td>{submission.language}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Problem;