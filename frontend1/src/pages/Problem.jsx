import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import Navbar from "./Navbar";
import "./Problem.css";
import Editor from "@monaco-editor/react";
import { set } from "date-fns";

const Problem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [uploadMode, setUploadMode] = useState("text");
  const [contestEndTime, setContestEndTime] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isProblemLocked, setIsProblemLocked] = useState(false);

  // Theme effect
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    if (theme === "dark") document.body.classList.add("dark");
  }, []);

  useEffect(() => {
    if (uploadMode === "text") {
      const savedCode = localStorage.getItem(`draft-${id}-${language}`);
      if (savedCode) setCode(savedCode);
      else {
        if (language === "cpp") setCode("#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}");
        else if (language === "python") setCode("def main():\n    pass\n\nif __name__ == \"__main__\":\n    main()");
        else if (language === "java") setCode("public class Main {\n    public static void main(String[] args) {\n        \n    }\n}");
      }
    }
  }, [language, uploadMode, id]);

  useEffect(() => {
    if (uploadMode === "text") {
      localStorage.setItem(`draft-${id}-${language}`, code);
    }
  }, [code, id, language, uploadMode]);

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
          navigate("/not-found");
          return;
        }

        const data = await res.json();
        setProblem(data);

        if (data.contest_start_time && data.contest_duration) {
          const start = new Date(data.contest_start_time);
          const end = new Date(start.getTime() + data.contest_duration * 60000);
          setContestEndTime(end);
        
          const now = new Date();
        
          if (now < start) {
            // Contest hasn't started yet — lock the whole problem
            setIsProblemLocked(true);
            setIsLocked(true);
          } else {
            // Contest has started; optionally lock model solution if contest is still ongoing
            setIsLocked(now < end);
          }
        }
        

      } catch (err) {
        console.error("Fetch error:", err);
        navigate("/not-found");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, navigate]);

  useEffect(() => {
    if (!contestEndTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((contestEndTime - now) / 1000));
      const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const seconds = String(diff % 60).padStart(2, "0");
      setCountdown(`${hours}:${minutes}:${seconds}`);

      // Lock model solution if contest is over
      if (diff === 0 && isLocked) {
        setIsLocked(false);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [contestEndTime, isLocked]);

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${apiUrl}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ problem_id: id, language, code }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Submission successful!");
        // setCode("");
        setFile(null);
        // Fetch the latest submission data (refresh the problem state)
        const updatedProblemRes = await fetch(`${apiUrl}/problem/${id}`, {
          credentials: "include",
        });
        const updatedProblemData = await updatedProblemRes.json();
        setProblem(updatedProblemData);  // This will re-render the component with the new submissions

      } else {
        alert("Submission failed: " + result.error);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong!");
    }
  };

  const handleRunAllExamples = async () => {
    try {
      const examples = problem.examples.map((ex) => ({
        input: ex.input,
        output: ex.output,
      }));

      const res = await fetch(`${apiUrl}/runAllExamples`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          problem_id: id,
          language,
          code,
          examples,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        const updatedExamples = problem.examples.map((ex, index) => ({
          ...ex,
          result: result.results[index].passed
          ? "Passed"
          : `Failed (Expected: ${ex.output}, Got: ${result.results[index].actualOutput})`,        
        }));
        setProblem({ ...problem, examples: updatedExamples });
      } else {
        alert("Error running all examples: " + result.error);
      }
    } catch (err) {
      console.error("Run All Examples error:", err);
      alert("Something went wrong during running all examples!");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!problem) return <p>Problem not found.</p>;

  if (isProblemLocked) {
    return (
      <div className="problem-page">
        <Navbar />
        <div className="problem-main">
          <div className="locked-message">
            <h2>This problem is currently locked.</h2>
            <p>
              It is part of an upcoming contest and will become available on{" "}
              <strong>{new Date(problem.contest_start_time).toLocaleString()}</strong>.
            </p>
            <p className="note">Please check back after the contest starts!</p>
          </div>
        </div>
      </div>
    );
  }
  
  

  return (
    <div className="problem-page">
      <Navbar />
      {countdown && new Date() < contestEndTime && (
        <div style={{ textAlign: "center", color: "red", fontSize: "1.2rem", fontWeight: "bold", margin: "10px 0" }}>
          Contest ends in: {countdown}
        </div>
      )}
      <div className="problem-main">
        <div className="problem-left">
          <h1>{problem.title}</h1>
          <p><strong>Difficulty:</strong> {problem.difficulty}</p>
          <p><strong>Tags:</strong> {problem.tags.join(", ")}</p>
          <hr />
          <div className="problem-description">
            <p>{problem.description}</p>
          </div>

          {problem.examples && problem.examples.length > 0 ? (
            <div className="problem-examples">
              <h3>Examples:</h3>
              {problem.examples.map((ex, index) => (
                <div key={index} className="example-block">
                  <p><strong>Example {index + 1}:</strong></p>
                  <pre><strong>Input:</strong> {ex.input}</pre>
                  <pre><strong>Output:</strong> {ex.output}</pre>
                  {ex.explanation && (
                    <pre><strong>Explanation:</strong> {ex.explanation}</pre>
                  )}
                  {ex.result && <p><strong>Test Result: </strong>{ex.result}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p>No examples available for this problem.</p>
          )}

          <div className="submission-table">
            <h2>Submissions</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Lang</th>
                </tr>
              </thead>
              <tbody>
                {problem.submissions?.length > 0 ? (
                  problem.submissions.map((s) => (
                    <tr key={s.id}>
                      <td><a href={`/submission/${s.id}`}>{s.id}</a></td>
                      <td>{s.verdict}</td>
                      <td>{s.language}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5">No submissions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="model-solution-block" style={{ marginTop: "20px" }}>
            <button
              onClick={() => setShowSolution(!showSolution)}
              style={{ marginBottom: "10px" }}
              disabled={isLocked}
              title={isLocked ? "Model solution will be available once the contest ends." : ""}
            >
              {showSolution ? "Hide Solution" : "Reveal Solution"}
            </button>
            {showSolution && !isLocked && (
              <div className="solution-content" style={{
                backgroundColor: "#f8f8f8",
                padding: "10px",
                borderRadius: "6px",
                whiteSpace: "pre-wrap"
              }}>
                {problem.model_solution ? (
                  <code>{problem.model_solution}</code>
                ) : (
                  <p>No model solution available.</p>
                )}
              </div>
            )}
            {isLocked && (
              <div style={{ color: "gray", fontStyle: "italic" }}>
                Model solution will be available once the contest ends.
              </div>
            )}
          </div>
        </div>

        <div className="problem-right">
          <div className="editor-controls">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>

            <div style={{ marginTop: "10px" }}>
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
            </div>
          </div>

          {uploadMode === "file" ? (
            <>
              <input
                type="file"
                accept=".cpp,.py,.java,.txt"
                onChange={(e) => {
                  const uploaded = e.target.files[0];
                  setFile(uploaded);
                  const reader = new FileReader();
                  reader.onload = (ev) => setCode(ev.target.result);
                  reader.readAsText(uploaded);
                }}
              />
              {file && <p>Selected file: {file.name}</p>}
            </>
          ) : (
            <Editor
              height="calc(100vh - 200px)"
              defaultLanguage={language}
              theme={document.body.classList.contains("dark") ? "vs-dark" : "light"}
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                wordWrap: "on",
                automaticLayout: true,
              }}
            />
          )}

          <div style={{ marginTop: "10px" }}>
            <button onClick={handleRunAllExamples} style={{ marginRight: "10px" }}>
              Run All Examples
            </button>
            <button className="submit-btn" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problem;
