import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import Navbar from "./Navbar";
import "./AddContest.css";

const AddContest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    start_time: "",
    duration_minutes: "",
    problems: [
      {
        problem_id: "",
        title: "",
        description: "",
        tags: "",
        difficulty: "",
        time_limit: "",
        memory_limit: "",
        input_format: "",
        output_format: "",
        interaction_format: "",
        note: "",
        examples: "",
        editorial: "",
        testset_size: "",
        testcases: "",
        model_solution: "",
      },
    ],
  });



  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProblemChange = (index, key, value) => {
    const updated = [...formData.problems];
    updated[index][key] = value;
    setFormData({ ...formData, problems: updated });
  };

  const addProblemField = () => {
    setFormData((prev) => ({
      ...prev,
      problems: [
        ...prev.problems,
        {
          problem_id: "",
          title: "",
          description: "",
          tags: "",
          difficulty: "",
          time_limit: "",
          memory_limit: "",
          input_format: "",
          output_format: "",
          interaction_format: "",
          note: "",
          examples: "",
          editorial: "",
          testset_size: "",
          testcases: {},
          model_solution: "",
        },
      ],
    }));
  };

  const removeProblemField = (index) => {
    const updated = formData.problems.filter((_, i) => i !== index);
    setFormData({ ...formData, problems: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ⛏️ Parse testcases before sending
    const parsedProblems = formData.problems.map((p) => ({
      ...p,
      testcases: (() => {
        try {
          return JSON.parse(p.testcases || "{}");
        } catch {
          return {}; // fallback on invalid JSON
        }
      })(),
    }));

    const submissionData = { ...formData, problems: parsedProblems };

    try {
      const response = await fetch(`${apiUrl}/add-contest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submissionData), // ✅ here
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Contest created successfully!");
        navigate("/contests");
      } else {
        setError(data.message || "Failed to create contest.");
      }
    } catch (err) {
      console.error("Error creating contest:", err);
      setError("Server error. Please try again.");
    }
  };


  return (
    <>
      <Navbar />
      <div className="pageContainer">
        <div className="container">
          <h1 className="heading">Create New Contest</h1>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <form onSubmit={handleSubmit} className="form">
            <div className="row">
              <input
                name="title"
                placeholder="Contest Title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input"
              />
              <input
                name="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="input"
              />
              <input
                name="duration_minutes"
                type="number"
                placeholder="Duration (minutes)"
                value={formData.duration_minutes}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <h2 className="subheading">Problems</h2>

            {formData.problems.map((problem, index) => (
              <div key={index} className="problemBox">
                <div className="problemHeader">
                  <h3>Problem #{index + 1}</h3>
                  {formData.problems.length > 1 && (
                    <button
                      type="button"
                      className="removeBtn"
                      onClick={() => removeProblemField(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="row">
                  {[
                    ["problem_id", "Problem ID"],
                    ["title", "Title"],
                    ["tags", "Tags (comma-separated)"],
                  ].map(([key, placeholder]) => (
                    <input
                      key={key}
                      type="text"
                      value={problem[key]}
                      onChange={(e) => handleProblemChange(index, key, e.target.value)}
                      placeholder={placeholder}
                      className="input"
                    />
                  ))}
                </div>

                <div className="row">
                  {[
                    ["difficulty", "Difficulty (1-10)", "number", "1", "10"],
                    ["time_limit", "Time Limit (ms)", "number"],
                    ["memory_limit", "Memory Limit (MB)", "number"],
                    ["testset_size", "Testset Size", "number"],
                  ].map(([key, placeholder, type = "text", min, max]) => (
                    <input
                      key={key}
                      type={type}
                      value={problem[key]}
                      onChange={(e) => handleProblemChange(index, key, e.target.value)}
                      placeholder={placeholder}
                      min={min}
                      max={max}
                      className="input"
                    />
                  ))}
                </div>

                {[
                  ["description", "Description"],
                  ["input_format", "Input Format"],
                  ["output_format", "Output Format"],
                  ["interaction_format", "Interaction Format"],
                  ["note", "Note"],
                  ["examples", "Examples"],
                  ["editorial", "Editorial"],
                ].map(([key, placeholder]) => (
                  <textarea
                    key={key}
                    value={problem[key]}
                    onChange={(e) => handleProblemChange(index, key, e.target.value)}
                    placeholder={placeholder}
                    className="textarea"
                  />
                ))}

                <textarea
                  value={problem.testcases}
                  onChange={(e) => handleProblemChange(index, "testcases", e.target.value)}
                  placeholder="Testcases (JSON format)"
                  className="textarea"
                />



                <button
                  type="button"
                  className="submitBtn"
                  disabled={loadingIndex === index}
                  onClick={async () => {
                    if (!problem.description || problem.description.trim().length === 0) {
                      alert("Please enter a problem description first.");
                      return;
                    }

                    setLoadingIndex(index);

                    try {
                      const res = await fetch(`${apiUrl}/api/generate-solution`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ description: problem.description }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        handleProblemChange(index, "model_solution", data.solution);
                      } else {
                        alert(data.message || "Failed to generate solution.");
                      }
                    } catch (err) {
                      console.log(err);
                      alert("Server error. Please try again.");
                    } finally {
                      setLoadingIndex(null);
                    }
                  }}
                >
                  {loadingIndex === index ? "⏳ Generating..." : "💡 Generate Model Solution"}
                </button>

                <label className="subheading">Or paste your own model solution:</label>
                <textarea
                  value={problem.model_solution}
                  onChange={(e) => handleProblemChange(index, "model_solution", e.target.value)}
                  placeholder="Write or paste your own C++ model solution here..."
                  className="textarea"
                />

                <input
                  type="file"
                  accept=".cpp,.txt"
                  className="input"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        handleProblemChange(index, "model_solution", event.target.result);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </div>
            ))}

            <button type="button" onClick={addProblemField} className="submitBtn">
              ➕ Add another Problem
            </button>

            <button type="submit" className="submitBtn">
              Create Contest
            </button>
          </form>
        </div>
      </div>
    </>
  );


};

export default AddContest;

