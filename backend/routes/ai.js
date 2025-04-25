const express = require("express");
const cors = require("cors");
const router = express.Router();
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ make sure the API key is being read
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

router.post("/generate-solution", async (req, res) => {
  const { description } = req.body;

  if (!description || description.trim().length === 0) {
    return res.status(400).json({ message: "Description is required." });
  }

  try {
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      `You are a programming expert. Write a model solution in C++ for the following problem:\n${description}\n\nMake sure to include input/output handling.`,
    ]);

    const response = await result.response;
    const text = response.text();

    res.json({ solution: text });
  } catch (err) {
    console.error("Error generating solution:", JSON.stringify(err, null, 2));
    res.status(500).json({ message: "Failed to generate solution.", error: err.message });
  }
});

module.exports = router;
