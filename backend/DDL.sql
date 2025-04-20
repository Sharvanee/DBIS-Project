DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS problem_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS solved_problems CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS contests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  handle VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rating INTEGER DEFAULT 1500,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contests (
  contest_id SERIAL PRIMARY KEY,
  contest_name VARCHAR(255) NOT NULL,
  contest_type VARCHAR(5),
  contest_year INTEGER,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration INTEGER,
  division INTEGER,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE problems (
  problem_id VARCHAR(10) UNIQUE NOT NULL,
  contest_id INTEGER REFERENCES contests(contest_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  difficulty INTEGER,
  time_limit INTEGER,
  memory_limit INTEGER,
  description TEXT NOT NULL,
  input_format TEXT,
  output_format TEXT,
  interaction_format TEXT,
  note TEXT,
  examples TEXT,
  editorial TEXT,
  testset_size INTEGER,
  testcases JSONB
);

CREATE TABLE solved_problems (
  submission_id SERIAL PRIMARY KEY,
  problem_id VARCHAR(10) REFERENCES problems(problem_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  verdict VARCHAR(50) CHECK (verdict IN ('Accepted', 'Wrong Answer', 'TLE', 'Compilation Error')),
  solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE problem_tags (
  problem_id VARCHAR(10) REFERENCES problems(problem_id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, tag_id)
);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  problem_id VARCHAR(10) REFERENCES problems(problem_id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language VARCHAR(20) CHECK (language IN ('cpp', 'python', 'java', 'js')),
  verdict VARCHAR(50) CHECK (verdict IN ('Accepted', 'Wrong Answer', 'TLE', 'Compilation Error')),
  runtime VARCHAR(20),
  memory VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

