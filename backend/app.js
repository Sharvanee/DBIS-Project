const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
// const passport = require("./config/passport"); // Import the configured passport file
const passport = require("passport");
require("./config/passport");
// require("./config/passport"); // Ensure passport is configured
require("dotenv").config();
const { Pool } = require("pg");
const app = express();
const port = 4000;

// PostgreSQL connection
// NOTE: use YOUR postgres username and password here
const pool = new Pool({
  user: "test",
  host: "localhost",
  database: "codeforces",
  password: "test",
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS: Give permission to localhost:3000 (ie our React app)
// to use this backend API
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session information
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Middleware
app.use(passport.initialize());
app.use(passport.session());

// Import and use auth routes
const authRoutes = require("./routes/auth");
app.use(authRoutes);


function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.status(400).json({ message: "Unauthorized" });
  }
  next();
}

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
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    console.log("user", user.rows);
    if (user.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const correct_pwd = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );
    if (!correct_pwd) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    req.session.user = {
      id: user.rows[0].id,
      handle: user.rows[0].handle,
      email: user.rows[0].email,
    };

    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Error logging in" });
  }
});

// TODO: Implement API used to check if the client is currently logged in or not.
// use correct status codes and messages mentioned in the lab document
app.get("/isLoggedIn", async (req, res) => {
  if (req.session.user) {
    return res
      .status(200)
      .json({ message: "Logged in", handle: req.session.user.handle });
  } else {
    return res.status(400).json({ message: "Not logged in" });
  }
});

// TODO: Implement API used to logout the user
// use correct status codes and messages mentioned in the lab document
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

////////////////////////////////////////////////////
// APIs for the products
// use correct status codes and messages mentioned in the lab document
// TODO: Fetch and display all products from the database

////////////////////////////////////////////////////
// Start the server
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
  
  console.log("problems", problems.rows);
  res.json(problems.rows);
});


app.get("/problem/:id", isAuthenticated, async (req, res) => {
  const problemId = req.params.id;

  try {
    const problem = await pool.query(
      "SELECT title, difficulty, description FROM problems WHERE problem_id = $1",
      [problemId]
    );

    if (problem.rows.length === 0) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const tags = await pool.query(
      "SELECT tag.name FROM tags tag JOIN problem_tags ptag ON ptag.problem_id = $1 AND tag.id = ptag.tag_id",
      [problemId]
    );

    const submissions = await pool.query(
      "SELECT * FROM submissions WHERE problem_id = $1 AND user_id = $2",
      [problemId, req.session.user.id]
    );

    res.json({
      title: problem.rows[0].title,
      difficulty: problem.rows[0].difficulty,
      description: problem.rows[0].description,
      tags: tags.rows.map((tag) => tag.name),
      submissions: submissions.rows,
    });
  } catch (err) {
    console.error("Error fetching problem:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/contests", isAuthenticated, async (req, res) => {
  const contests = await pool.query("Select * from contests");
  res.json(contests.rows);
});

app.get("/contest/:id", isAuthenticated, async (req, res) => {
  const contestId = req.params.id;
  const contest = await pool.query("Select * from contests where contest_id = $1", [
    contestId,
  ]);
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
    problems: problems.rows.map((problem) => ({
      id: problem.problem_id,
      title: problem.title,
      difficulty: problem.difficulty,
    })),
  });
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

    // Insert contest
    const contestInsertRes = await pool.query(
      `
        INSERT INTO contests (contest_name, start_time, duration)
        VALUES ($1, $2, $3)
        RETURNING contest_id
      `,
      [title, start_time, duration_minutes]
    );

    const contestId = contestInsertRes.rows[0].contest_id;

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
      } = problems[i];
      console.log(problem_id);
      const problemInsertRes = await pool.query(
        `
          INSERT INTO problems (
            problem_id, contest_id, title, difficulty, time_limit,
            memory_limit, description, input_format, output_format,
            interaction_format, note, examples, editorial, testset_size, testcases
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9,
            $10, $11, $12, $13, $14, $15
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
        ]
      );

      const insertedProblemId = problemInsertRes.rows[0].problem_id;

      // Handle tags
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
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.session.user.id;

  try {
    const userQuery = await pool.query(
      `SELECT 
        u.handle, 
        u.email, 
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
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/dashboard", // Redirect after success
    failureRedirect: "http://localhost:3000/login", // Redirect after failure
  })
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

app.post("/submit", isAuthenticated, async (req, res) => {
  try {
    const user_id = req.session && req.session.user ? req.session.user.id : null;
    const { problem_id, code, language } = req.body;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized: Please login." });
    }

    if (!problem_id) {
      return res.status(400).json({ error: "Missing required fields.1" });
    }
    if (!code) {
      return res.status(400).json({ error: "Missing required fields.2" });
    }
    if (!language) {
      return res.status(400).json({ error: "Missing required fields.3" });
    }

    const insertResult = await pool.query(
      `INSERT INTO submissions (
        user_id, problem_id, code, language, created_at, verdict, runtime, memory
      ) VALUES ($1, $2, $3, $4, NOW(), NULL, NULL, NULL)
      RETURNING id;`,
      [user_id, problem_id, code, language]
    );

    res.status(201).json({
      message: "Submission received successfully.",
      submission_id: insertResult.rows[0].id,
    });
  } catch (error) {
    console.error("Error processing submission:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.put("/update-profile", isAuthenticated, async (req, res) => {
  const { city, college, profile_picture } = req.body;  // You may also include other profile data here
  
  // Validate the input data
  if (!city && !college && !profile_picture) {
    return res.status(400).json({ message: "No changes made." });
  }

  try {
    // Update the profile info for the logged-in user
    const result = await pool.query(
      `UPDATE users 
       SET city = COALESCE($1, city), college = COALESCE($2, college), profile_picture = COALESCE($3, profile_picture) 
       WHERE id = $4
       RETURNING id, handle, email, city, college, profile_picture`,
      [city || null, college || null, profile_picture || null, req.session.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Send back the updated profile
    res.status(200).json({
      message: "Profile updated successfully",
      profile: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile." });
  }
});

