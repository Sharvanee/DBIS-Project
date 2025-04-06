-- Users
INSERT INTO users (handle, email, password_hash, rating, created_at) VALUES
  ('alice', 'alice@example.com', 'hashed_pw_1', 1600, NOW()),
  ('bob', 'bob@example.com', 'hashed_pw_2', 1450, NOW()),
  ('admin', 'admin@example.com', 'hashed_pw_admin', 2000, NOW() );

-- Problems (add input_format column if needed, or remove it from query)
-- If input_format is needed, uncomment the ALTER TABLE below:
-- ALTER TABLE problems ADD COLUMN input_format TEXT;

INSERT INTO problems (id, title, description, difficulty) VALUES
  (1, 'Two Sum', 'Find indices of the two numbers that add up to a target.', 'Easy'),
  (2, 'Graph DFS', 'Perform a DFS on a given graph.', 'Medium'),
  (3, 'Segment Tree RMQ', 'Range Minimum Query using Segment Tree.', 'Hard');

INSERT INTO contests (title, start_time, duration, division) VALUES
('Code Sprint 2025', '2025-04-10 14:00:00', 120, 1),
('AI Hackathon', '2025-04-12 16:30:00', 180, 2),
('Data Structures Challenge', '2025-04-15 10:00:00', 90, 1),
('Competitive Programming Cup', '2025-04-18 20:00:00', 150, 3),
('Beginner Coding Contest', '2025-04-20 08:00:00', 60, 1);


-- Tags
INSERT INTO tags (id, name) VALUES
  (1, 'arrays'),
  (2, 'graphs'),
  (3, 'dfs'),
  (4, 'segment-tree'),
  (5, 'hashmap');

-- Problem Tags
-- Two Sum: arrays, hashmap
INSERT INTO problem_tags (problem_id, tag_id) VALUES (1, 1), (1, 5);
-- Graph DFS: graphs, dfs
INSERT INTO problem_tags (problem_id, tag_id) VALUES (2, 2), (2, 3);
-- Segment Tree RMQ: arrays, segment-tree
INSERT INTO problem_tags (problem_id, tag_id) VALUES (3, 1), (3, 4);

-- Problem Sets
INSERT INTO problem_sets (id, title, description, created_by) VALUES
  (1, 'Beginner Set', 'Starter problems for newbies.', 1),
  (2, 'Advanced Data Structures', 'Problems on segment trees and more.', 3);

-- Problem Set - Problems
-- Beginner Set: Two Sum, Graph DFS
INSERT INTO problem_set_problems (problem_set_id, problem_id) VALUES (1, 1), (1, 2);
-- Advanced: Segment Tree RMQ
INSERT INTO problem_set_problems (problem_set_id, problem_id) VALUES (2, 3);

-- Solved Problems
-- Alice solved Two Sum
INSERT INTO solved_problems (user_id, problem_id) VALUES (1, 1);
-- Bob solved Graph DFS
INSERT INTO solved_problems (user_id, problem_id) VALUES (2, 2);

-- Submissions
INSERT INTO submissions (user_id, problem_id, code, language, verdict, runtime, memory) VALUES
  (1, 1, 'code for two sum...', 'python', 'Accepted', '12ms', '5MB'),
  (2, 2, 'dfs code...', 'cpp', 'Wrong Answer', '22ms', '4MB'),
  (1, 2, 'dfs code again...', 'python', 'Accepted', '19ms', '4.5MB');
