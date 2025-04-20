import random
from faker import Faker
import psycopg2
from bcrypt import hashpw, gensalt

fake = Faker()

conn = psycopg2.connect(
    dbname="users",
    user="test",
    password="test",
    host="localhost",
    port="5432"
)

def hash_password(password):

    return hashpw(password.encode(), gensalt()).decode()

def create_fake_users(n):
    try:
        with conn.cursor() as cur:
            for _ in range(n):
                username = fake.unique.user_name()
                name = fake.name()
                location = fake.city()
                division = random.randint(1, 3)
                badges = [fake.word() for _ in range(random.randint(0, 3))] 
                email = fake.unique.email()
                password_hash = hash_password(fake.password(length=10))
                merch_points = random.randint(0, 100) 
                rating = random.randint(1200, 1800) 

                cur.execute("""
                    INSERT INTO users (
                        username, name, location, division, badges,
                        rating, email, password_hash, merch_points
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    username, name, location, division,
                    badges, rating, email, password_hash, merch_points
                ))
                #print(f"inserting user: {username} (email: {email})")
        conn.commit()
        #print("fake users inserted into the database")
    except Exception as e:
        #print(f"error during insertion: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_fake_users(100)
