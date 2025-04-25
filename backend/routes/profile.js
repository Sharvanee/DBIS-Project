const express = require("express");
const router = express.Router();
const { pool } = require("../db"); // Ensure you use the correct path for your db file
const isAuthenticated = require("../middleware/isAuthenticated");


// Get the count of problems solved by the user every day in the last year
router.get("/submissions/daily-count", isAuthenticated, async (req, res) => {
  const userId = req.user.id;  // Assuming user ID is available in req.user after authentication

  // Query to get the count of solved problems per day in the past year
  const query = `
    SELECT 
      DATE(solved_at) AS date, 
      COUNT(*) AS solved_count
    FROM solved_problems
    WHERE user_id = $1 
      AND solved_at > NOW() - INTERVAL '1 year'
    GROUP BY DATE(solved_at)
    ORDER BY DATE(solved_at) DESC;
  `;
  
  try {
    const result = await pool.query(query, [userId]);

    const solvedCounts = result.rows.map(row => ({
        date: row.date,
        count: row.solved_count, // ✅ FIX: rename to `count`
      }));      

    res.json(solvedCounts);
  } catch (err) {
    console.error("Error fetching solved problems count:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;
