-- Function to move contest problems to practice problems
CREATE OR REPLACE FUNCTION move_contest_problems()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert problems into the practice problems table (removing contest_id)
    INSERT INTO problems (title, statement, category, division, difficulty, tags, author_id, testcases, solution, editorial)
    SELECT title, statement, category, division, difficulty, tags, author_id, testcases, solution, editorial
    FROM problems
    WHERE contest_id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the function when a contest ends
CREATE TRIGGER contest_ended_trigger
AFTER UPDATE ON contests
FOR EACH ROW
WHEN (OLD.status <> 'Ended' AND NEW.status = 'Ended') -- Detects status change to 'Ended'
EXECUTE FUNCTION move_contest_problems();
