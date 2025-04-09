import json
import psycopg2
from datasets import load_dataset

ds = load_dataset("open-r1/codeforces")

# Update with your database connection details
conn = psycopg2.connect(
    dbname="codeforces",
    user="test",
    password="test",
    host="localhost",
    port="5432"
)

cur = conn.cursor()

# Insert contests
contest_query = """
INSERT INTO contests (contest_id, contest_name, contest_type, contest_year, start_time)
VALUES (%s, %s, %s, %s, TO_TIMESTAMP(%s))
ON CONFLICT (contest_id) DO NOTHING;
"""
for split in ["train", "test"]:
    for row in ds[split]:
        cur.execute(contest_query, (
            row["contest_id"], row["contest_name"], row["contest_type"],
            row["contest_start_year"], row["contest_start"]
        ))
conn.commit()
print("Contests inserted successfully!")

# Insert problems
problem_query = """
INSERT INTO problems (problem_id, contest_id, title, difficulty, time_limit, memory_limit,
                      description, input_format, output_format, interaction_format, note, examples,
                      editorial, testset_size, testcases)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (problem_id) DO NOTHING;
"""

for split in ["train", "test"]:
    for row in ds[split]:
        if row["description"] is None or row["input_format"] is None or row["output_format"] is None:
            continue

        try:
            cur.execute(problem_query, (
                row["id"], row["contest_id"], row["title"], row["rating"], row["time_limit"],
                row["memory_limit"], row["description"], row["input_format"], row["output_format"],
                row["interaction_format"], row["note"], 
                json.dumps(row["examples"]) if row["examples"] else None,
                row["editorial"], row["testset_size"], 
                json.dumps(row["official_tests"]) if row["official_tests"] else None
            ))
            conn.commit()   
        except Exception as e:
            print(f"Error inserting row {row['id']}: {e}")
            conn.rollback()

print("Problems inserted successfully!")

# Insert tags
tag_query = "INSERT INTO tags (name) VALUES (%s) ON CONFLICT (name) DO NOTHING;"
problem_tag_query = """
INSERT INTO problem_tags (problem_id, tag_id)
SELECT %s, id FROM tags WHERE name=%s AND EXISTS (SELECT 1 FROM problems WHERE problem_id=%s)
ON CONFLICT DO NOTHING;
"""

for split in ["train", "test"]:
    for row in ds[split]:
        for tag in row["tags"]:
            cur.execute(tag_query, (tag,))
            cur.execute(problem_tag_query, (row["id"], tag, row["id"]))

conn.commit()
print("Tags inserted successfully!")

cur.close()
conn.close()
print("Database connection closed.")
