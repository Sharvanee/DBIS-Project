const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const pool = require("../db"); // Ensure this correctly connects to your PostgreSQL database
const pool = require("../db.js");  // Ensure it matches the actual file name

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback", // Adjust to your server URL
      passReqToCallback: true, // Allows us to pass req to callback function
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;

        // Check if user exists in database
        let userQuery = await pool.query(
          "SELECT * FROM users WHERE google_id = $1",
          [googleId]
        );

        if (userQuery.rows.length > 0) {
          return done(null, userQuery.rows[0]); // User exists, proceed with login
        }

        // If user does not exist, insert into database
        let newUser = await pool.query(
          "INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING *",
          [name, email, googleId]
        );

        return done(null, newUser.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.user_id); // Assuming your table has `user_id` as primary key
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    if (user.rows.length > 0) {
      done(null, user.rows[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, false);
  }
});

module.exports = passport;
