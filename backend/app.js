const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const { exec } = require("child_process");
const { spawn } = require("child_process");
const cors = require("cors");
const passport = require("passport");
require("./config/passport");
require("dotenv").config();
const { Pool } = require("pg");
const app = express();
const port = 4000;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const profileRoutes = require("./routes/profile");
// const contestRoutes = require("./routes/contest");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");

// Setup for file uploads (profile pictures)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage });

const pool = new Pool({
  user: "test",
  host: "localhost",
  database: "codeforces",
  password: "test",
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // maxAge: 30 * 24 * 60 * 60 * 1000,
      maxAge: 60* 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(authRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", aiRoutes);
// app.use("/api", contestRoutes);
app.use("/api/profile", profileRoutes);

function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.status(400).json({ message: "Unauthorized" });
  }
  next();
}

app.get("/blogs", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.id, b.title, b.content, b.created_at, u.handle AS author
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE is_published = true
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/blogs", isAuthenticated, async (req, res) => {
  const { title, content, tags } = req.body;
  const authorId = req.session.user.id;

  try {
    const result = await pool.query(
      `
      INSERT INTO blogs (title, content, author_id, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [title, content, authorId, tags || []]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get comments for a blog
app.get("/blogs/:id/comments", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT c.id, c.content, c.created_at, 
             u.id AS user_id, u.display_name, u.profile_pic
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.blog_id = $1
      ORDER BY c.created_at ASC
    `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Add comment
app.post("/blogs/:id/comments", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.session.user.id;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Comment content cannot be empty" });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO comments (blog_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [id, userId, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});


app.post("/blogs/:id/react", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { is_like } = req.body;
  const userId = req.session.user.id;

  if (typeof is_like !== "boolean" && is_like !== null) {
    return res.status(400).json({ error: "is_like must be true, false, or null" });
  }

  try {
    if (is_like === null) {
      // If is_like is null, delete the reaction
      await pool.query(
        `DELETE FROM blog_reactions WHERE blog_id = $1 AND user_id = $2`,
        [id, userId]
      );
    } else {
      // Otherwise, insert or update the reaction
      await pool.query(
        `
        INSERT INTO blog_reactions (blog_id, user_id, is_like)
        VALUES ($1, $2, $3)
        ON CONFLICT (blog_id, user_id)
        DO UPDATE SET is_like = EXCLUDED.is_like
      `,
        [id, userId, is_like]
      );
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("Error recording reaction:", err);
    res.status(500).json({ error: "Failed to react to blog" });
  }
});


// Get blog with reactions
app.get("/blogs/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const blogRes = await pool.query(
      `
      SELECT b.*, 
             u.display_name AS author, 
             u.profile_pic, 
             u.id AS author_id
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE b.id = $1
    `,
      [id]
    );

    if (!blogRes.rows[0]) return res.sendStatus(404);

    const likesRes = await pool.query(
      `
      SELECT 
        COUNT(*) FILTER (WHERE is_like) AS likes,
        COUNT(*) FILTER (WHERE NOT is_like) AS dislikes
      FROM blog_reactions
      WHERE blog_id = $1
    `,
      [id]
    );

    const { likes, dislikes } = likesRes.rows[0];
    res.json({
      ...blogRes.rows[0],
      likes: Number(likes),
      dislikes: Number(dislikes),
    });
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(500).json({ error: "Failed to fetch blog" });
  }
});


app.get("/blogs/:id/user-reaction", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const userId = req.session.user.id;

  try {
    const result = await pool.query(
      `SELECT is_like FROM blog_reactions WHERE blog_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) return res.json({ is_like: null });

    res.json({ is_like: result.rows[0].is_like });
  } catch (err) {
    console.error("Error fetching user reaction:", err);
    res.status(500).json({ error: "Failed to fetch user reaction" });
  }
});


app.post("/signup", async (req, res) => {
  try {
    const { handle, email, password } = req.body;

    const email_in_use = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (email_in_use.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Error: Email is already registered." });
    }

    const username_in_use = await pool.query(
      "SELECT * FROM users WHERE handle = $1",
      [handle]
    );
    if (username_in_use.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Error: Username is already registered." });
    }

    const hashed_pwd = await bcrypt.hash(password, 10);
    const insertResult = await pool.query(
      `INSERT INTO users (handle, email, password_hash, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
       RETURNING id, created_at`,
      [handle, email, hashed_pwd]
    );

    const { id: userId, created_at } = insertResult.rows[0];

    req.session.user = {
      id: userId,
      handle,
      email,
    };

    res.status(200).json({
      id: userId,
      handle,
      email,
      created_at,
      message: "User Registered Successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error signing up" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { handle, password, rememberMe } = req.body;

    const userQuery = await pool.query(
      "SELECT * FROM users WHERE handle = $1",
      [handle]
    );

    if (userQuery.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid handle or password" });
    }

    const user = userQuery.rows[0];
    const correct_pwd = await bcrypt.compare(password, user.password_hash);
    if (!correct_pwd) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid handle or password" });
    }

    // if (rememberMe) req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    if (rememberMe) req.session.cookie.maxAge = 60 * 1000;
    else req.session.cookie.expires = false;

    req.session.user = {
      id: user.id,
      handle: user.handle,
      email: user.email,
    };

    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Error logging in" });
  }
});

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const handle = email.split("@")[0]; // fallback if handle isn't provided

    let user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      // Create user
      const result = await pool.query(
        `INSERT INTO users (handle, email, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *`,
        [handle, email]
      );
      user = result;
    }

    const { id, handle: userHandle } = user.rows[0];
    req.session.user = { id, handle: userHandle, email };

    return res.status(200).json({ message: "Google login successful" });
  } catch (err) {
    console.error("Google login failed:", err);
    res.status(400).json({ message: "Google authentication failed" });
  }
});

app.get("/isLoggedIn", async (req, res) => {
  if (req.session.user) {
    return res
      .status(200)
      .json({ message: "Logged in", handle: req.session.user.handle });
  } else {
    return res.status(400).json({ message: "Not logged in" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()",
      [token]
    );
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2",
      [hashed, userResult.rows[0].id]
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const token = require("crypto").randomBytes(32).toString("hex");

  try {
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_expires = NOW() + INTERVAL '1 hour' WHERE email = $2",
      [token, email]
    );

    // TODO: Email the token as reset link: http://localhost:3000/reset-password?token=...
    console.log(
      `Reset link: http://localhost:3000/reset-password?token=${token}`
    );
    res.status(200).json({ message: "Password reset link has been sent." });
  } catch (err) {
    console.error("Error sending reset link:", err);
    res.status(500).json({ message: "Error processing request" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logged out successfully" });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/problem-set", isAuthenticated, async (req, res) => {
  const problems = await pool.query(
    `SELECT 
      p.problem_id, 
      p.title, 
      p.difficulty, 
      COALESCE(json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
    FROM problems AS p
    LEFT JOIN problem_tags pt ON p.problem_id = pt.problem_id
    LEFT JOIN tags t ON t.id = pt.tag_id
    GROUP BY p.problem_id, p.title, p.difficulty`
  );

  res.json(problems.rows);
});

app.get("/problem/:id", isAuthenticated, async (req, res) => {
  const problemId = req.params.id;

  try {
    const problem = await pool.query(
      `SELECT p.title, p.difficulty, p.description, p.examples, p.model_solution,
       c.start_time AS contest_start_time, c.duration AS contest_duration
       FROM problems p
       LEFT JOIN contests c ON p.contest_id = c.contest_id
       WHERE p.problem_id = $1`,
      [problemId]
    );

    if (problem.rows.length === 0) {
      return res.status(404).json({ error: "Problem not found" });
    }

    let examples = [];
    if (problem.rows[0].examples) {
      try {
        examples = JSON.parse(problem.rows[0].examples);
      } catch (err) {
        console.error("Error parsing examples:", err);
        examples = [{ input: "Error", output: "Unable to parse examples." }];
      }
    }

    const tags = await pool.query(
      `SELECT tag.name
       FROM tags tag
       JOIN problem_tags ptag ON ptag.problem_id = $1 AND tag.id = ptag.tag_id`,
      [problemId]
    );

    const submissions = await pool.query(
      `SELECT * FROM submissions
       WHERE problem_id = $1 AND user_id = $2`,
      [problemId, req.session.user.id]
    );

    res.json({
      title: problem.rows[0].title,
      difficulty: problem.rows[0].difficulty,
      description: problem.rows[0].description,
      tags: tags.rows.map((tag) => tag.name),
      submissions: submissions.rows,
      examples: examples,
      contest_start_time: problem.rows[0].contest_start_time,
      contest_duration: problem.rows[0].contest_duration,
      model_solution: problem.rows[0].model_solution,
    });

  } catch (err) {
    console.error("Error fetching problem:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Register or deregister for a contest
app.post("/contest/:id/register", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const contestId = req.params.id;

  try {
    // Check if the user is already registered
    const result = await pool.query(
      `SELECT * FROM contest_registrations WHERE user_id = $1 AND contest_id = $2`,
      [userId, contestId]
    );

    if (result.rows.length > 0) {
      // User is already registered, so let's deregister them
      await pool.query(
        `DELETE FROM contest_registrations WHERE user_id = $1 AND contest_id = $2`,
        [userId, contestId]
      );
      return res.json({ success: true, action: "deregistered" });
    }

    // User is not registered, so register them
    await pool.query(
      `INSERT INTO contest_registrations (user_id, contest_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, contest_id) DO NOTHING`,
      [userId, contestId]
    );
    res.json({ success: true, action: "registered" });
  } catch (err) {
    console.error("Contest registration error:", err);
    res.status(500).json({ error: "Failed to register or deregister" });
  }
});

app.post("/contest/:id/rate", async (req, res) => {
  const { leaderboard } = req.body;
  const contestId = req.params.id;

  if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
    return res.status(400).send("Invalid leaderboard");
  }

  try {
    // Fetch contest data from the database
    const contestResult = await pool.query("SELECT * FROM contests WHERE id = $1", [contestId]);
    const contest = contestResult.rows[0];

    if (!contest) {
      return res.status(404).send("Contest not found");
    }

    if (contest.rated) {
      return res.status(400).send("Contest already rated");
    }

    const base = 300; // Increased base value for a larger boost

    // Iterate over leaderboard and update user ratings
    for (let i = 0; i < leaderboard.length; i++) {
      const userId = leaderboard[i].user_id;

      // Fetch user data
      const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      const user = userResult.rows[0];

      if (!user) continue;

      // Calculate boost based on rank (higher rank = more points)
      const boost = Math.round(base / (i + 1));
      const newRating = (user.rating || 1500) + boost; // Default to 1500 if no rating exists

      // Update user's rating
      await pool.query("UPDATE users SET rating = $1 WHERE id = $2", [newRating, userId]);
    }

    // Mark contest as rated
    await pool.query("UPDATE contests SET rated = true WHERE id = $1", [contestId]);

    res.send("Ratings updated successfully");
  } catch (err) {
    console.error("Rating update error:", err);
    res.status(500).send("Server error");
  }
});




app.get("/contest/:id/isRegistered", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const contestId = req.params.id;

    if (!userId) return res.status(401).json({ isRegistered: false });

    const result = await pool.query(
      `SELECT 1 FROM contest_registrations WHERE user_id = $1 AND contest_id = $2`,
      [userId, contestId]
    );

    const isRegistered = result.rowCount > 0;
    res.json({ isRegistered });
  } catch (err) {
    console.error("Error checking registration:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all contest registrations for the logged-in user
app.get("/myRegistrations", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;

  try {
    const result = await pool.query(
      `SELECT contest_id FROM contest_registrations WHERE user_id = $1`,
      [userId]
    );

    res.json(result.rows); // returns an array of { contest_id }
  } catch (err) {
    console.error("Error fetching registrations:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

app.get("/contest/:id", isAuthenticated, async (req, res) => {
  const contestId = req.params.id;
  const contest = await pool.query(
    "Select * from contests where contest_id = $1",
    [contestId]
  );
  const problems = await pool.query(
    "Select * from problems where contest_id = $1",
    [contestId]
  );

  if (contest.rows.length === 0) {
    return res.status(404).json({ message: "Contest not found" });
  }

  res.json({
    title: contest.rows[0].title,
    start_time: contest.rows[0].start_time,
    duration: contest.rows[0].duration,
    problems: problems.rows.map((problem) => ({
      id: problem.problem_id,
      title: problem.title,
      difficulty: problem.difficulty,
    })),
  });
});

app.get("/contest/:id/stats", isAuthenticated, async (req, res) => {
  const contestId = req.params.id;

  try {
    const problemStatsQuery = await pool.query(
      `
      SELECT 
        p.problem_id,
        COUNT(s.id) AS total_submissions,
        COUNT(CASE WHEN s.verdict = 'Accepted' THEN 1 END) AS accepted_submissions
      FROM problems p
      LEFT JOIN submissions s ON p.problem_id = s.problem_id
      WHERE p.contest_id = $1
      GROUP BY p.problem_id
      `,
      [contestId]
    );

    const problemStats = {};
    problemStatsQuery.rows.forEach((row) => {
      problemStats[row.problem_id] = {
        total_submissions: parseInt(row.total_submissions),
        accepted_submissions: parseInt(row.accepted_submissions),
      };
    });

    const leaderboardQuery = await pool.query(
      `
SELECT
  r.user_id,
  u.handle,
  COUNT(DISTINCT CASE WHEN s.verdict = 'Accepted' THEN s.problem_id END) AS solved_count,
  MIN(CASE WHEN s.verdict = 'Accepted' THEN s.created_at END) AS first_solved_at,
  JSON_OBJECT_AGG(
    s.problem_id,
    CASE WHEN s.verdict = 'Accepted' THEN s.created_at ELSE NULL END
  ) FILTER (WHERE s.verdict = 'Accepted' AND s.problem_id IS NOT NULL) AS solved_times
FROM contest_registrations r
INNER JOIN users u ON u.id = r.user_id
LEFT JOIN submissions s ON s.user_id = r.user_id
  AND s.problem_id IN (SELECT problem_id FROM problems WHERE contest_id = $1)
WHERE r.contest_id = $1
GROUP BY r.user_id, u.handle
ORDER BY solved_count DESC, first_solved_at ASC NULLS LAST

      `,
      [contestId]
    );

    res.json({
      problemStats,
      userLeaderboard: leaderboardQuery.rows,
    });
  } catch (err) {
    console.error("Error fetching contest stats:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/contests", isAuthenticated, async (req, res) => {
  const contests = await pool.query("Select * from contests");
  res.json(contests.rows);
});

// GET /contestProblemCounts
app.get("/contestProblemCounts", isAuthenticated, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT contest_id, COUNT(*) AS problem_count
      FROM problems
      GROUP BY contest_id
    `);

    const result = {};
    for (const row of rows) {
      result[row.contest_id] = parseInt(row.problem_count, 10);
    }

    res.json(result);
  } catch (err) {
    console.error("Error fetching problem counts:", err);
    res.status(500).json({ error: "Failed to get problem counts" });
  }
});

// GET /mySolvedCounts
app.get("/mySolvedCounts", isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { rows } = await pool.query(
      `
      SELECT
        c.contest_id,
        COUNT(DISTINCT s.problem_id) AS solved
      FROM contests c
      JOIN problems p ON c.contest_id = p.contest_id
      JOIN submissions s ON s.problem_id = p.problem_id
      WHERE s.user_id = $1 AND s.verdict = 'Accepted'
      GROUP BY c.contest_id
    `,
      [userId]
    );

    const solvedMap = {};
    for (const row of rows) {
      solvedMap[row.contest_id] = parseInt(row.solved, 10);
    }

    res.json(solvedMap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get solve counts" });
  }
});

app.post("/add-contest", isAuthenticated, async (req, res) => {
  try {
    const { title, start_time, duration_minutes, problems } = req.body;

    if (
      !title ||
      !start_time ||
      !duration_minutes ||
      !Array.isArray(problems) ||
      problems.length === 0
    ) {
      return res.status(400).json({
        error:
          "All fields are required and problems must be a non-empty array.",
      });
    }

    const maxContestIdRes = await pool.query(
      `SELECT MAX(contest_id) FROM contests`
    );
    const maxContestId = maxContestIdRes.rows[0].max || 0;
    const contestId = maxContestId + 1;

    const contestInsertRes = await pool.query(
      `
        INSERT INTO contests (contest_id, contest_name, start_time, duration)
        VALUES ($1, $2, $3, $4)
        RETURNING contest_id
      `,
      [contestId, title, start_time, duration_minutes]
    );

    for (let i = 0; i < problems.length; i++) {
      const {
        problem_id,
        title,
        description,
        tags,
        difficulty,
        time_limit,
        memory_limit,
        input_format,
        output_format,
        interaction_format,
        note,
        examples,
        editorial,
        testset_size,
        testcases,
        model_solution,
      } = problems[i];

      const problemInsertRes = await pool.query(
        `
          INSERT INTO problems (
            problem_id, contest_id, title, difficulty, time_limit,
            memory_limit, description, input_format, output_format,
            interaction_format, note, examples, editorial, testset_size, testcases, model_solution
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9,
            $10, $11, $12, $13, $14, $15, $16
          )
          RETURNING problem_id
        `,
        [
          problem_id,
          contestId,
          title || `Problem ${String.fromCharCode(65 + i)}`,
          difficulty || null,
          time_limit || null,
          memory_limit || null,
          description || "",
          input_format || "",
          output_format || "",
          interaction_format || "",
          note || "",
          examples || "",
          editorial || "",
          testset_size || null,
          testcases ? JSON.stringify(testcases) : null,
          model_solution || "",
        ]
      );

      const insertedProblemId = problemInsertRes.rows[0].problem_id;

      if (tags) {
        const tagList = tags.split(",").map((t) => t.trim().toLowerCase());

        for (const tagName of tagList) {
          const tagRes = await pool.query(
            `
              INSERT INTO tags (name)
              VALUES ($1)
              ON CONFLICT (name) DO NOTHING
              RETURNING id
            `,
            [tagName]
          );

          let tagId;
          if (tagRes.rows.length > 0) {
            tagId = tagRes.rows[0].id;
          } else {
            const existing = await pool.query(
              `SELECT id FROM tags WHERE name = $1`,
              [tagName]
            );
            tagId = existing.rows[0].id;
          }

          await pool.query(
            `
              INSERT INTO problem_tags (problem_id, tag_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `,
            [insertedProblemId, tagId]
          );
        }
      }
    }

    res.status(201).json({
      success: "Contest created successfully!",
      contest_id: contestId,
    });
  } catch (err) {
    console.error("Error creating contest:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/profile", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;

  try {
    const userQuery = await pool.query(
      `SELECT 
        u.handle, 
        u.email, 
        u.display_name,
        u.country,
        u.state,
        u.city,
        u.college,
        u.profile_pic,
        u.rating, 
        u.created_at,
        COALESCE(ps.solved_count, 0) AS solved_count, 
        COALESCE(sub.submission_count, 0) AS submission_count
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS solved_count
        FROM submissions
        WHERE verdict = 'Accepted'
        GROUP BY user_id
      ) ps ON u.id = ps.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS submission_count
        FROM submissions
        GROUP BY user_id
      ) sub ON u.id = sub.user_id
      WHERE u.id = $1`,
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(userQuery.rows[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/submission/:id", isAuthenticated, async (req, res) => {
  const submissionId = req.params.id;
  const submission = await pool.query(
    "Select * from submissions where id = $1",
    [submissionId]
  );
  if (submission.rows.length === 0) {
    return res.status(404).json({ message: "Submission not found" });
  }
  res.json(submission.rows[0]);
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  (req, res) => {
    res.redirect("http://localhost:3000/dashboard");
  }
);

app.get("/checkHandle", async (req, res) => {
  const { handle } = req.query;

  if (!handle) {
    return res
      .status(400)
      .json({ available: false, message: "Handle is required" });
  }

  try {
    const result = await pool.query("SELECT id FROM users WHERE handle = $1", [
      handle,
    ]);

    const isAvailable = result.rows.length === 0;
    return res.json({ available: isAvailable });
  } catch (err) {
    console.error("Error checking handle:", err);
    return res
      .status(500)
      .json({ available: false, message: "Internal server error" });
  }
});

app.put(
  "/update-profile",
  isAuthenticated,
  upload.single("profile_pic"),
  async (req, res) => {
    const userId = req.session.user.id;
    const { country, state, city, college, display_name } = req.body;
    const profile_pic = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const updateFields = [
        country,
        state,
        city,
        college,
        display_name,
        profile_pic,
        userId,
      ];

      await pool.query(
        `UPDATE users 
       SET country = $1, state = $2, city = $3, college = $4, 
           display_name = $5, profile_pic = COALESCE($6, profile_pic) 
       WHERE id = $7`,
        updateFields
      );
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
);

app.post("/runAllExamples", async (req, res) => {
  const { language, code, examples } = req.body;

  const extensionMap = {
    cpp: "cpp",
    python: "py",
    java: "java",
  };

  const fileExt = extensionMap[language];
  const fileName = `temp_code_${Date.now()}.${fileExt}`;
  const filePath = path.join(__dirname, fileName);

  try {
    fs.writeFileSync(filePath, code);
    const results = [];

    const runExample = (example) => {
      return new Promise((resolve) => {
        let output = "", error = "";
        const input = (example.input || "").replace(/\r\n/g, "\n").trim();
        const expected = (example.output || "").replace(/\r\n/g, "\n").trim();
        const tempID = Date.now();

        const finish = (actualOutput) => {
          const isCorrect = actualOutput === expected;
          resolve({
            passed: isCorrect,
            actualOutput
          });
        };



        switch (language) {
          case "cpp": {
            const execName = `temp_exec_${tempID}`;
            const compileCommand = `g++ ${filePath} -o ${execName}`;

            exec(compileCommand, (compileErr) => {
              if (compileErr) return resolve("Wrong Answer");

              const child = spawn(`./${execName}`);

              child.stdin.on("error", (err) => {
                if (err.code === "EPIPE") console.error("C++ stdin EPIPE");
              });

              if (child.stdin.writable) {
                try {
                  child.stdin.write(input);
                  child.stdin.end();
                } catch (e) {
                  console.error("C++ write error:", e.message);
                }
              }

              child.stdout.on("data", (data) => output += data.toString());
              child.stderr.on("data", (data) => error += data.toString());

              child.on("close", () => {
                fs.unlinkSync(execName);
                finish(output.trim());
              });
            });
            break;
          }

          case "python": {
            const child = spawn("python3", [filePath]);

            child.stdin.on("error", (err) => {
              if (err.code === "EPIPE") console.error("Python stdin EPIPE");
            });

            if (child.stdin.writable) {
              try {
                child.stdin.write(input);
                child.stdin.end();
              } catch (e) {
                console.error("Python write error:", e.message);
              }
            }

            child.stdout.on("data", (data) => output += data.toString());
            child.stderr.on("data", (data) => error += data.toString());

            child.on("close", () => {
              finish(output.trim());
            });
            break;
          }

          case "java": {
            const className = "Main";
            const javaFilePath = path.join(__dirname, `${className}.java`);
            fs.writeFileSync(javaFilePath, code);

            exec(`javac ${javaFilePath}`, (compileErr) => {
              if (compileErr) return resolve("Wrong Answer");

              const child = spawn("java", ["-cp", __dirname, className]);

              child.stdin.on("error", (err) => {
                if (err.code === "EPIPE") console.error("Java stdin EPIPE");
              });

              if (child.stdin.writable) {
                try {
                  child.stdin.write(input);
                  child.stdin.end();
                } catch (e) {
                  console.error("Java write error:", e.message);
                }
              }

              child.stdout.on("data", (data) => output += data.toString());
              child.stderr.on("data", (data) => error += data.toString());

              child.on("close", () => {
                fs.unlinkSync(javaFilePath);
                fs.unlinkSync(path.join(__dirname, `${className}.class`));
                finish(output.trim());
              });
            });
            break;
          }

          default:
            resolve("Wrong Answer");
        }
      });
    };

    // Run all examples sequentially
    for (const example of examples) {
      const result = await runExample(example);
      results.push(result);
    }

    fs.unlinkSync(filePath);
    res.json({ results });

  } catch (err) {
    console.error("Error during execution:", err);
    res.status(500).send("Execution error");
  }
});



app.post("/submit", isAuthenticated, async (req, res) => {
  try {
    const { problem_id, language, code } = req.body;
    const user_id = req.session?.user?.id;

    const extensionMap = { cpp: "cpp", python: "py", java: "java" };
    const fileExt = extensionMap[language];
    const fileName = `temp_code_${Date.now()}.${fileExt}`;
    const filePath = path.join(__dirname, fileName);

    const insertResult = await pool.query(
      `INSERT INTO submissions (user_id, problem_id, code, language, created_at, verdict)
       VALUES ($1, $2, $3, $4, NOW(), NULL)
       RETURNING id;`,
      [user_id, problem_id, code, language]
    );
    const submission_id = insertResult.rows[0].id;

    const problemResult = await pool.query(
      "SELECT testcases FROM problems WHERE problem_id = $1;",
      [problem_id]
    );

    if (problemResult.rows.length === 0) {
      return res.status(404).json({ error: "Problem not found." });
    }

    const testcases = problemResult.rows[0].testcases;
    fs.writeFileSync(filePath, code);
    const results = [];

    const runTestcase = (testcase) => {
      return new Promise((resolve) => {
        const timeoutLimit = 3000;
        let verdict = "Accepted";
        let timedOut = false;

        const input = testcase.input.replace(/\r\n/g, '\n').trim();
        const expectedOutput = (testcase.output || "").replace(/\r\n/g, '\n').trim();

        const timeout = setTimeout(() => {
          timedOut = true;
          verdict = "Time Limit Exceeded";
          resolve({ status: verdict, input, expected: expectedOutput, actual: "" });
        }, timeoutLimit);

        let output = "", error = "";
        const tempID = Date.now();

        const finish = (actualOutput) => {
          if (timedOut) return;
          clearTimeout(timeout);
          if (error) verdict = "Runtime Error";
          else if (actualOutput !== expectedOutput) verdict = "Wrong Answer";
          resolve({ status: verdict, input, expected: expectedOutput, actual: actualOutput });
        };

        switch (language) {
          case "cpp": {
            const execName = `temp_exec_${tempID}`;
            const compileCommand = `g++ ${filePath} -o ${execName}`;

            exec(compileCommand, (compileErr) => {
              if (compileErr) {
                clearTimeout(timeout);
                return resolve({ status: "Runtime Error", input, expected: expectedOutput, actual: "" });
              }

              const child = spawn(`./${execName}`);
              let actual = "";

              child.stdin.on("error", (err) => {
                if (err.code === "EPIPE") {
                  console.error("C++ stdin EPIPE (closed pipe)");
                }
              });

              if (child.stdin.writable) {
                try {
                  child.stdin.write(input);
                  child.stdin.end();
                } catch (e) {
                  console.error("Error writing to C++ stdin:", e.message);
                }
              }

              child.stdout.on("data", (data) => output += data.toString());
              child.stderr.on("data", (data) => error += data.toString());
              child.on("close", () => {
                fs.unlinkSync(execName);
                finish(output.trim());
              });
            });
            break;
          }

          case "python": {
            const child = spawn("python3", [filePath]);

            child.stdin.on("error", (err) => {
              if (err.code === "EPIPE") {
                console.error("Python stdin EPIPE (closed pipe)");
              }
            });

            if (child.stdin.writable) {
              try {
                child.stdin.write(input);
                child.stdin.end();
              } catch (e) {
                console.error("Error writing to Python stdin:", e.message);
              }
            }

            child.stdout.on("data", (data) => output += data.toString());
            child.stderr.on("data", (data) => error += data.toString());
            child.on("close", () => {
              finish(output.trim());
            });
            break;
          }

          case "java": {
            const className = "Main";
            const javaFilePath = path.join(__dirname, `${className}.java`);
            fs.writeFileSync(javaFilePath, code);

            exec(`javac ${javaFilePath}`, (compileErr) => {
              if (compileErr) {
                clearTimeout(timeout);
                return resolve({ status: "Runtime Error", input, expected: expectedOutput, actual: "" });
              }

              const child = spawn("java", ["-cp", __dirname, className]);

              child.stdin.on("error", (err) => {
                if (err.code === "EPIPE") {
                  console.error("Java stdin EPIPE (closed pipe)");
                }
              });

              if (child.stdin.writable) {
                try {
                  child.stdin.write(input);
                  child.stdin.end();
                } catch (e) {
                  console.error("Error writing to Java stdin:", e.message);
                }
              }

              child.stdout.on("data", (data) => output += data.toString());
              child.stderr.on("data", (data) => error += data.toString());
              child.on("close", () => {
                fs.unlinkSync(javaFilePath);
                fs.unlinkSync(path.join(__dirname, `${className}.class`));
                finish(output.trim());
              });
            });
            break;
          }

          default:
            clearTimeout(timeout);
            resolve({ status: "Runtime Error", input, expected: expectedOutput, actual: "" });
        }
      });
    };


    for (const testcase of testcases) {
      const result = await runTestcase(testcase);
      results.push(result);
    }

    fs.unlinkSync(filePath);

    const finalVerdict = results.every(r => r.status === "Accepted") ? "Accepted" : "Wrong Answer";

    await pool.query(
      "UPDATE submissions SET verdict = $1 WHERE id = $2;",
      [finalVerdict, submission_id]
    );

    res.status(201).json({
      message: "Submission evaluated.",
      submission_id,
      results,
      verdict: finalVerdict,
    });

  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports.isAuthenticated = isAuthenticated;
