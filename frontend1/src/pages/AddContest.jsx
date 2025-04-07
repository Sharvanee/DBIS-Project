import React, { useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";

const AddContest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    start_time: "",
    duration_minutes: "",
    problems: [""], // array of problem IDs
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProblemChange = (index, value) => {
    const updatedProblems = [...formData.problems];
    updatedProblems[index] = value;
    setFormData((prev) => ({ ...prev, problems: updatedProblems }));
  };

  const addProblemField = () => {
    setFormData((prev) => ({ ...prev, problems: [...prev.problems, ""] }));
  };

  const removeProblemField = (index) => {
    const updatedProblems = formData.problems.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, problems: updatedProblems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${apiUrl}/contests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Contest created successfully!");
        navigate("/contests"); // Optional: Redirect to contest list
      } else {
        setError(data.message || "Failed to create contest.");
      }
    } catch (err) {
      console.error("Contest creation error:", err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="add-contest-container">
        <h2>Create New Contest</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="title"
              placeholder="Contest Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="number"
              name="duration_minutes"
              placeholder="Duration (in minutes)"
              value={formData.duration_minutes}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Problem IDs:</label>
            {formData.problems.map((problemId, index) => (
              <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "0.5rem" }}>
                <input
                  type="text"
                  value={problemId}
                  onChange={(e) => handleProblemChange(index, e.target.value)}
                  placeholder={`Problem ID #${index + 1}`}
                  required
                />
                <button type="button" onClick={() => removeProblemField(index)}>
                  ❌
                </button>
              </div>
            ))}
            <button type="button" onClick={addProblemField}>
              ➕ Add Problem
            </button>
          </div>

          <button type="submit">Create Contest</button>
        </form>
      </div>
    </div>
  );
};

export default AddContest;
