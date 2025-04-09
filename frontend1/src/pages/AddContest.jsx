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
      },
    ],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Navbar />
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Contest</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Contest Fields */}
          <input
            name="title"
            placeholder="Contest Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input w-full"
          />
          <input
            name="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={handleChange}
            required
            className="input w-full"
          />
          <input
            name="duration_minutes"
            type="number"
            placeholder="Duration (minutes)"
            value={formData.duration_minutes}
            onChange={handleChange}
            required
            className="input w-full"
          />

          {/* Problem Sections */}
          <h2 className="text-xl font-semibold mt-6">Problems</h2>

          {formData.problems.map((problem, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-300 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Problem #{index + 1}</h3>
                {formData.problems.length > 1 && (
                  <button type="button" className="text-red-500" onClick={() => removeProblemField(index)}>
                    Remove
                  </button>
                )}
              </div>

              {/* All problem fields in vertical flow */}
              <input
                type="text"
                value={problem.problem_id}
                onChange={(e) => handleProblemChange(index, "problem_id", e.target.value)}
                placeholder="Problem ID"
                className="input w-full"
              />
              <input
                type="text"
                value={problem.title}
                onChange={(e) => handleProblemChange(index, "title", e.target.value)}
                placeholder="Title"
                className="input w-full"
              />
              <input
                type="text"
                value={problem.tags}
                onChange={(e) => handleProblemChange(index, "tags", e.target.value)}
                placeholder="Tags (comma-separated)"
                className="input w-full"
              />
              <input
                type="number"
                value={problem.difficulty}
                onChange={(e) => handleProblemChange(index, "difficulty", e.target.value)}
                placeholder="Difficulty (1-10)"
                min="1"
                max="10"
                className="input w-full"
              />
              <input
                type="number"
                value={problem.time_limit}
                onChange={(e) => handleProblemChange(index, "time_limit", e.target.value)}
                placeholder="Time Limit (ms)"
                className="input w-full"
              />
              <input
                type="number"
                value={problem.memory_limit}
                onChange={(e) => handleProblemChange(index, "memory_limit", e.target.value)}
                placeholder="Memory Limit (MB)"
                className="input w-full"
              />
              <input
                type="number"
                value={problem.testset_size}
                onChange={(e) => handleProblemChange(index, "testset_size", e.target.value)}
                placeholder="Testset Size"
                className="input w-full"
              />

              {/* Textareas */}
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
                  className="input w-full h-24"
                />
              ))}

              {/* Testcases */}
              <textarea
                value={JSON.stringify(problem.testcases || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const json = JSON.parse(e.target.value);
                    handleProblemChange(index, "testcases", json);
                  } catch {
                    // silent fail for invalid JSON
                  }
                }}
                placeholder="Testcases (JSON format)"
                className="input w-full font-mono h-40 bg-gray-100"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addProblemField}
            className="bg-green-100 text-green-800 font-medium px-4 py-2 rounded-xl hover:bg-green-200 transition"
          >
            ➕ Add Problem
          </button>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition self-center mt-4"
          >
            Create Contest
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddContest;
