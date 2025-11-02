import os
import time

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SCHEMA = os.getenv("SCHEMA", "public")

engine = create_engine(DATABASE_URL, future=True, echo=False)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_conn(retries=5, delay=5):
    for attempt in range(retries):
        try:
            conn = engine.connect()
            conn.execute(text(f"SET search_path TO {SCHEMA}"))
            return conn
        except Exception as e:
            print(f"DB not ready (attempt {attempt+1}): {e}")
            time.sleep(delay)
    raise RuntimeError("Database not ready after retries")
