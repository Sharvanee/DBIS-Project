DROP TABLE IF EXISTS blog_reactions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS problem_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS solved_problems CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS contest_registrations CASCADE;
DROP TABLE IF EXISTS contests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  handle VARCHAR(50) UNIQUE,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT,
  google_id TEXT UNIQUE,
  rating INTEGER DEFAULT 1500,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  display_name TEXT,
  city TEXT,
  college TEXT,
  profile_pic TEXT,
  country TEXT,
  state TEXT
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
  testcases JSONB,
  model_solution TEXT
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
  verdict VARCHAR(50) CHECK (verdict IN ('Accepted',
    'Wrong Answer',
    'Time Limit Exceeded',
    'Memory Limit Exceeded',
    'Runtime Error','Compilation Error')),
  runtime VARCHAR(20),
  memory VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contest_registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  contest_id INTEGER REFERENCES contests(contest_id) ON DELETE CASCADE,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, contest_id)
);

CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tags TEXT[],
  is_published BOOLEAN DEFAULT true
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_reactions (
  id SERIAL PRIMARY KEY,
  blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_like BOOLEAN NOT NULL,
  UNIQUE (blog_id, user_id)
);

-- ✅ Insert Sample Users (required for author_id and user_id references)
INSERT INTO users (handle, email, password_hash) VALUES
('user1', 'user1@example.com', 'hash1'), -- id = 1
('user2', 'user2@example.com', 'hash2'), -- id = 2
('user3', 'user3@example.com', 'hash3'); -- id = 3

-- ✅ Insert Blogs
INSERT INTO blogs (title, content, author_id, created_at, updated_at, tags, is_published) VALUES
(
  'Top 5 Strategies for Winning ICPC',
  'The International Collegiate Programming Contest (ICPC) is one of the most prestigious competitive programming contests in the world. In this blog, we explore the top 5 strategies that can help you perform well in ICPC.',
  1, NOW(), NOW(),
  ARRAY['ICPC', 'Strategies', 'Competitive Programming'],
  true
),
(
  'The Importance of Data Structures in Competitive Programming',
  'Data structures are the foundation of any competitive programmer’s toolkit.',
  2, NOW(), NOW(),
  ARRAY['Data Structures', 'Algorithms', 'Competitive Programming'],
  true
),
(
  'How to Prepare for Google Code Jam',
  'Google Code Jam is a global competitive programming contest.',
  3, NOW(), NOW(),
  ARRAY['Google Code Jam', 'Preparation', 'Competitive Programming'],
  true
),
(
  'A Beginner’s Guide to Dynamic Programming',
  'Dynamic Programming (DP) is a powerful technique often used in coding contests.',
  1, NOW(), NOW(),
  ARRAY['Dynamic Programming', 'Algorithms', 'Competitive Programming'],
  true
),
(
  'Common Mistakes to Avoid in Coding Contests',
  'Even the best competitive programmers make mistakes.',
  2, NOW(), NOW(),
  ARRAY['Mistakes', 'Competitive Programming', 'Best Practices'],
  true
);

-- ✅ Insert Comments
INSERT INTO comments (blog_id, user_id, content, created_at) VALUES
(1, 2, 'Great tips! Time management really helped me in last years ICPC.', NOW()),
(1, 3, 'Thanks for sharing! Practicing mock contests is key.', NOW()),
(2, 1, 'Stacks and queues always trip me up. This was helpful.', NOW()),
(3, 2, 'I didnt know about the past archives. Thanks for the prep guide!', NOW()),
(4, 3, 'Dynamic programming finally makes sense now. Nice examples!', NOW()),
(5, 1, 'I always forget to read constraints. Thanks for the reminder.', NOW());

-- ✅ Insert Reactions
INSERT INTO blog_reactions (blog_id, user_id, is_like) VALUES
(1, 2, true),
(1, 3, true),
(2, 1, true),
(2, 3, false),
(3, 1, true),
(3, 2, true),
(4, 2, false),
(4, 3, true),
(5, 1, false),
(5, 3, true);
