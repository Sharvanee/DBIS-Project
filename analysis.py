import json
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import ast


# Load the dataset
df = pd.read_csv("problems.csv")

# Database connection
conn = psycopg2.connect(
    dbname="codeforces",
    user="test",
    password="test",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# ==== INSERT CONTESTS ====
contest_query = """
INSERT INTO contests (contest_id, contest_name, contest_type, contest_year, start_time)
VALUES %s
ON CONFLICT (contest_id) DO NOTHING
"""
contest_values = df[['contest_id', 'contest_name', 'contest_type', 'contest_start_year', 'contest_start']].drop_duplicates()

# Convert timestamps
contest_values['contest_start'] = contest_values['contest_start'].apply(
    lambda x: pd.Timestamp.utcfromtimestamp(x) if pd.notna(x) else None
)

# Replace NaN with None for DB insertion
contest_values = contest_values.where(pd.notna(contest_values), None)

# Convert to tuple format
execute_values(cursor, contest_query, [tuple(row) for row in contest_values.itertuples(index=False)])
conn.commit()

def safe_parse_json(json_str):
    """Safely parse JSON-like strings, correcting common formatting issues."""
    if pd.notna(json_str):
        try:
            formatted_str = json_str.replace("'", '"')  # Convert single quotes to double quotes
            formatted_str = formatted_str.replace("} {", "}, {")  # Ensure valid JSON list
            return json.dumps(json.loads(formatted_str))  # Convert list to JSON string
        except json.JSONDecodeError:
            print(f"Invalid JSON format: {json_str}")
            exit(0)
            return None
    return None

# ==== INSERT PROBLEMS ====
problem_query = """
INSERT INTO problems (
    problem_id, problem_set_id, title, difficulty, time_limit, memory_limit,
    description, input_format, output_format, interaction_format, note,
    examples, editorial, testset_size, testcases
) VALUES %s
ON CONFLICT (problem_id) DO NOTHING
"""

problem_values = df[['id', 'contest_id', 'title', 'rating', 'time_limit', 'memory_limit',
                      'description', 'input_format', 'output_format', 'interaction_format',
                      'note', 'examples', 'editorial', 'testset_size', 'official_tests']]

# Convert values correctly
problem_values = problem_values.apply(lambda row: (
    row['id'], 
    row['contest_id'], 
    row['title'], 
    row['rating'] if not pd.isna(row['rating']) else None,  # Handle NaN ratings
    int(row['time_limit']) if not pd.isna(row['time_limit']) else 0,  # Default time limit
    int(row['memory_limit']) if not pd.isna(row['memory_limit']) else 0,  # Default memory limit
    row['description'], 
    row['input_format'], 
    row['output_format'], 
    row['interaction_format'] if pd.notna(row['interaction_format']) else None,
    row['note'] if pd.notna(row['note']) else None, 
    safe_parse_json(row['examples']),  # Use safe parsing function
    row['editorial'] if pd.notna(row['editorial']) else None, 
    row['testset_size'] if not pd.isna(row['testset_size']) else 0, 
    safe_parse_json(row['official_tests'])  # Use safe parsing function
), axis=1)

execute_values(cursor, problem_query, list(problem_values))
conn.commit()

# ==== INSERT TAGS ====
tag_query = """
INSERT INTO tags (name) VALUES (%s) ON CONFLICT (name) DO NOTHING
"""
tags = set(tag for tag_list in df['tags'].dropna().apply(eval) for tag in tag_list)
execute_values(cursor, tag_query, [(tag,) for tag in tags])

# ==== INSERT PROBLEM_TAGS ====
problem_tags_query = """
INSERT INTO problem_tags (problem_id, tag_id)
SELECT %s, id FROM tags WHERE name = %s
ON CONFLICT DO NOTHING
"""
problem_tags_values = []
for _, row in df[['id', 'tags']].dropna().iterrows():
    for tag in eval(row['tags']):
        problem_tags_values.append((row['id'], tag))
execute_values(cursor, problem_tags_query, problem_tags_values)

# Commit and close
conn.commit()
cursor.close()
conn.close()
