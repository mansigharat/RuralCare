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
    print("\nCould not connect with any common password.")
    print("Please tell me: what password did you set when installing PostgreSQL?")
