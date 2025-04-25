import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import styles from "./AddContest.css";

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
        testcases: {},
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

    try {
      const response = await fetch(`${apiUrl}/add-contest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
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
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.heading}>Create New Contest</h1>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            name="title"
            placeholder="Contest Title"
            value={formData.title}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <input
            name="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <input
            name="duration_minutes"
            type="number"
            placeholder="Duration (minutes)"
            value={formData.duration_minutes}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <h2 className={styles.subheading}>Problems</h2>

          {formData.problems.map((problem, index) => (
            <div key={index} className={styles.problemBox}>
              <div className={styles.problemHeader}>
                <h3>Problem #{index + 1}</h3>
                {formData.problems.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeProblemField(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              {[
                ["problem_id", "Problem ID"],
                ["title", "Title"],
                ["tags", "Tags (comma-separated)"],
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
                  className={styles.input}
                />
              ))}

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
                  className={styles.textarea}
                />
              ))}

              <textarea
                value={JSON.stringify(problem.testcases || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const json = JSON.parse(e.target.value);
                    handleProblemChange(index, "testcases", json);
                  } catch { }
                }}
                placeholder="Testcases (JSON format)"
                className={`${styles.textarea} ${styles.codeArea}`}
              />

              <button
                type="button"
                className={styles.generateBtn}
                disabled={loadingIndex === index}
                onClick={async () => {
                  if (!problem.description || problem.description.trim().length === 0) {
                    alert("Please enter a problem description first.");
                    return;
                  }

                  setLoadingIndex(index); // Set loading state for this problem

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
                    setLoadingIndex(null); // Clear loading state
                  }
                }}
              >
                {loadingIndex === index ? "⏳ Generating..." : "💡 Generate Model Solution"}
              </button>

              {/* Manual Model Solution Entry */}
              <label className={styles.label}>Or paste your own model solution:</label>
              <textarea
                value={problem.model_solution}
                onChange={(e) => handleProblemChange(index, "model_solution", e.target.value)}
                placeholder="Write or paste your own C++ model solution here..."
                className={`${styles.textarea} ${styles.codeArea}`}
              />

              <input
                type="file"
                accept=".cpp,.txt"
                className={styles.input}
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



              {problem.model_solution && (
                <div className={styles.solutionPreview}>
                  <h4>🧠 Model Solution Preview</h4>
                  <pre className={styles.codeBlock}>{problem.model_solution}</pre>
                </div>
              )}
            </div>
          ))}

          <button type="button" onClick={addProblemField} className={styles.addBtn}>
            ➕ Add Problem
          </button>

          <button type="submit" className={styles.submitBtn}>
            Create Contest
          </button>
        </form>
      </div>
    </div>
  );

};

export default AddContest;

