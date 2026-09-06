import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

passwords = ['postgres', '', 'admin', '1234', 'password']
connected = False

for pwd in passwords:
    try:
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            user='postgres',
            password=pwd,
            dbname='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname='ruralcare'")
        exists = cur.fetchone()
        if not exists:
            cur.execute("CREATE DATABASE ruralcare")
            print(f"SUCCESS: Database 'ruralcare' created! (password={repr(pwd)})")
        else:
            print(f"Database 'ruralcare' already exists. Good to go! (password={repr(pwd)})")
        conn.close()
        connected = True

        # Now update .env with working password
        env_content = f"""DATABASE_URL=postgresql://postgres:{pwd}@localhost:5432/ruralcare
SECRET_KEY=ruralcare-sih-hackathon-secret-key-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
"""
        with open('.env', 'w') as f:
            f.write(env_content)
        print(f"Updated .env with correct password.")
        break
    except psycopg2.OperationalError as e:
        print(f"Tried password={repr(pwd)}: failed")

if not connected:
    print("\nNone of the common default passwords matched.")
    user_pwd = input("Please enter your PostgreSQL 'postgres' user password: ").strip()
    try:
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            user='postgres',
            password=user_pwd,
            dbname='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname='ruralcare'")
        exists = cur.fetchone()
        if not exists:
            cur.execute("CREATE DATABASE ruralcare")
            print(f"SUCCESS: Database 'ruralcare' created!")
        else:
            print(f"Database 'ruralcare' already exists. Good to go!")
        conn.close()
        connected = True

        env_content = f"""DATABASE_URL=postgresql://postgres:{user_pwd}@localhost:5432/ruralcare
SECRET_KEY=ruralcare-sih-hackathon-secret-key-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
"""
        with open('.env', 'w') as f:
            f.write(env_content)
        print("Updated .env with your password successfully!")
    except Exception as e:
        print(f"\nFailed to connect with provided password: {e}")
        print("Please check your password or reset it in PostgreSQL.")
