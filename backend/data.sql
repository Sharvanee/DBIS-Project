INSERT INTO users (handle, email, password_hash, rating, role)
VALUES
  ('alice', 'alice@example.com', 'hashed_pw_1', 1600, 'user'),
  ('bob', 'bob@example.com', 'hashed_pw_2', 1450, 'user'),
  ('admin', 'admin@example.com', 'hashed_pw_admin', 2000, 'admin');


INSERT INTO problems (title, description, difficulty, input_format, output_format)
VALUES
  ('Two Sum', 'Find indices of the two numbers that add up to a target.', 'Easy', 'Array nums, Integer target', 'Indices i, j'),
  ('Graph DFS', 'Perform a DFS on a given graph.', 'Medium', 'Graph as adjacency list', 'Visited order'),
  ('Segment Tree RMQ', 'Range Minimum Query using Segment Tree.', 'Hard', 'Array A, Queries Q', 'Minimum for each range');


INSERT INTO tags (name)
VALUES ('arrays'), ('graphs'), ('dfs'), ('segment-tree'), ('hashmap');


-- Two Sum: arrays, hashmap
INSERT INTO problem_tags (problem_id, tag_id) VALUES (1, 1), (1, 5);

-- Graph DFS: graphs, dfs
INSERT INTO problem_tags (problem_id, tag_id) VALUES (2, 2), (2, 3);

-- Segment Tree RMQ: arrays, segment-tree
INSERT INTO problem_tags (problem_id, tag_id) VALUES (3, 1), (3, 4);


INSERT INTO problem_sets (title, description, created_by)
VALUES
  ('Beginner Set', 'Starter problems for newbies.', 1),
  ('Advanced Data Structures', 'Problems on segment trees and more.', 3);


-- Beginner Set: Two Sum, Graph DFS
INSERT INTO problem_set_problems (problem_set_id, problem_id) VALUES (1, 1), (1, 2);

-- Advanced: Segment Tree RMQ
INSERT INTO problem_set_problems (problem_set_id, problem_id) VALUES (2, 3);


-- Alice solved Two Sum
INSERT INTO solved_problems (user_id, problem_id) VALUES (1, 1);

-- Bob solved Graph DFS
INSERT INTO solved_problems (user_id, problem_id) VALUES (2, 2);


INSERT INTO submissions (user_id, problem_id, code, language, verdict, runtime, memory)
VALUES
  (1, 1, 'code for two sum...', 'python', 'Accepted', '12ms', '5MB'),
  (2, 2, 'dfs code...', 'cpp', 'Wrong Answer', '22ms', '4MB'),
  (1, 2, 'dfs code again...', 'python', 'Accepted', '19ms', '4.5MB');
