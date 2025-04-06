DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS problem_tags CASCADE;
DROP TABLE IF EXISTS problem_sets CASCADE;
DROP TABLE IF EXISTS contests CASCADE;
DROP TABLE IF EXISTS problem_set_problems CASCADE;
DROP TABLE IF EXISTS solved_problems CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;


CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  handle VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rating INTEGER DEFAULT 1500,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE problems (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty VARCHAR(10) CHECK (difficulty IN ('Easy', 'Medium', 'Hard'))
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE problem_tags (
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, tag_id)
);

CREATE TABLE problem_sets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration INTEGER,
  division INTEGER
);

CREATE TABLE problem_set_problems (
  problem_set_id INTEGER REFERENCES problem_sets(id) ON DELETE CASCADE,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_set_id, problem_id)
);

CREATE TABLE solved_problems (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
  solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, problem_id)
);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language VARCHAR(20) CHECK (language IN ('cpp', 'python', 'java', 'js')),
  verdict VARCHAR(50) CHECK (verdict IN ('Accepted', 'Wrong Answer', 'TLE', 'Compilation Error')),
  runtime VARCHAR(20),
  memory VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

