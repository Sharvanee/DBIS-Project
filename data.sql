CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    division INT CHECK (division BETWEEN 1 AND 3), -- Div 1, 2, 3
    badges TEXT[], -- Array of badge names
    rating INT DEFAULT 1500,
    joining_date TIMESTAMP DEFAULT NOW(),        
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    merch_points INT DEFAULT 0, -- Points for winning
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    statement TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    division INT CHECK (division BETWEEN 1 AND 3), -- Div 1, 2, 3
    difficulty INT CHECK (difficulty BETWEEN 800 AND 3500),
    tags TEXT[],
    author_id INT REFERENCES users(id) ON DELETE SET NULL,
    testcases TEXT[], -- Array of test case inputs
    solution TEXT, -- Solution code
    editorial TEXT, -- Editorial explanation
    contest_id INT REFERENCES contests(id) ON DELETE CASCADE -- Nullable for non-contest problems
);

CREATE TABLE contests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    division INT CHECK (division BETWEEN 1 AND 3), -- Div 1, 2, 3
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Upcoming', 'Ongoing', 'Ended')),
    created_by INT REFERENCES users(id) ON DELETE CASCADE,
    merch_points INT DEFAULT 0 -- Points for winning
);

CREATE TABLE contest_problems (
    contest_id INT REFERENCES contests(id) ON DELETE CASCADE,
    problem_id INT REFERENCES problems(id) ON DELETE CASCADE,
    points INT NOT NULL, -- Points awarded for solving the problem
    PRIMARY KEY (contest_id, problem_id)
);

CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    problem_id INT REFERENCES problems(id) ON DELETE CASCADE,
    contest_id INT REFERENCES contests(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(20) NOT NULL,
    verdict VARCHAR(20) CHECK (verdict IN ('Accepted', 'Wrong Answer', 'TLE', 'Runtime Error', 'Compilation Error')),
    submission_time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contest_rankings (
    contest_id INT REFERENCES contests(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    rank INT NOT NULL,
    score INT NOT NULL,
    merch_points_awarded INT DEFAULT 0,
    PRIMARY KEY (contest_id, user_id)
);
