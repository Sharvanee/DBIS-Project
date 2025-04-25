import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import Navbar from "./Navbar";
import "./Problem.css";
import Editor from "@monaco-editor/react";

const Problem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [uploadMode, setUploadMode] = useState("text");
  const [file, setFile] = useState(null);

  // Theme toggle effect
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
          const text = await res.text();
          console.error("Server error response:", text);
          if (text.includes("not logged in") || res.status === 401) navigate("/login");
          else navigate("/not-found");
          return;
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
    <>
      <Navbar />
      <div className="problem-container">
        <button
          onClick={() => {
            const newTheme = document.body.classList.toggle("dark") ? "dark" : "light";
            localStorage.setItem("theme", newTheme);
          }}
          style={{ float: "right", margin: "10px" }}
        >
          Toggle Theme
        </button>

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
                <Editor
                  height="400px"
                  defaultLanguage={
                    language === "cpp" ? "cpp" :
                      language === "python" ? "python" :
                        "java"
                  }
                  theme={document.body.classList.contains("dark") ? "vs-dark" : "light"}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  onMount={(editor, monaco) => {
                    // Set format on Ctrl+Shift+I
                    editor.addCommand(
                      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI,
                      () => {
                        editor.getAction("editor.action.formatDocument").run();
                      }
                    );
                  }}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    formatOnType: true,
                    formatOnPaste: true,
                    wordWrap: "on",
                    autoClosingBrackets: "always",
                    suggestOnTriggerCharacters: true,
                    tabSize: 2,
                  }}
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
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`${apiUrl}/submit`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                      problem_id: id,
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
              }}
            >
              Submit
            </button>

            <button onClick={() => setShowSubmit(false)} style={{ marginLeft: "10px" }}>
              Cancel
            </button>
          </div>
        )}

        <div className="submission-table" style={{ marginTop: "30px" }}>
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
              {problem.submissions && problem.submissions.length > 0 ? (
                problem.submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td><a href={`/submission/${submission.id}`}>{submission.id}</a></td>
                    <td>{submission.verdict}</td>
                    <td>{submission.runtime}</td>
                    <td>{submission.memory}</td>
                    <td>{submission.language}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No submissions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Problem;
