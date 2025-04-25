// const express = require("express");
// const router = express.Router();
// const pool = require("../db");
// const isAuthenticated = require("../middleware/isAuthenticated");

// router.get("/:id/stats", isAuthenticated, async (req, res) => {
//   const contestId = req.params.id;

//   try {
//     // Problem-level stats
//     const problemStatsQuery = await pool.query(
//       `
//       SELECT 
//         p.problem_id,
//         COUNT(s.id) AS total_submissions,
//         COUNT(CASE WHEN s.verdict = 'Accepted' THEN 1 END) AS accepted_submissions
//       FROM problems p
//       LEFT JOIN submissions s ON p.problem_id = s.problem_id
//       WHERE p.contest_id = $1
//       GROUP BY p.problem_id
//       `,
//       [contestId]
//     );

//     const problemStats = {};
//     problemStatsQuery.rows.forEach(row => {
//       problemStats[row.problem_id] = {
//         total_submissions: parseInt(row.total_submissions),
//         accepted_submissions: parseInt(row.accepted_submissions)
//       };
//     });

//     // User-level leaderboard
//     const leaderboardQuery = await pool.query(
//       `
//       SELECT
//         sp.user_id,
//         u.handle,
//         COUNT(DISTINCT sp.problem_id) AS solved_count,
//         MIN(sp.solved_at) AS first_solved_at
//       FROM solved_problems sp
//       INNER JOIN problems p ON p.problem_id = sp.problem_id
//       INNER JOIN users u ON u.id = sp.user_id
//       WHERE p.contest_id = $1 AND sp.verdict = 'Accepted'
//       GROUP BY sp.user_id, u.handle
//       ORDER BY solved_count DESC, first_solved_at ASC
//       `,
//       [contestId]
//     );

//     res.json({
//       problemStats,
//       userLeaderboard: leaderboardQuery.rows
//     });

//   } catch (err) {
//     console.error("Error fetching contest stats:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// module.exports = router;
