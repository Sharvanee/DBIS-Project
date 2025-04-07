import pandas as pd

df = pd.read_csv('problems.csv')
df['problem_id'] = df['contest'].astype(str) + df['problem_name']
df.drop(columns=['contest', 'problem_name'], inplace=True)
df.to_csv('problems.csv', index=False)