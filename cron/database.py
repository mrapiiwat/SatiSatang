from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SCHEMA = os.getenv("SCHEMA", "public")

engine = create_engine(DATABASE_URL, future=True, echo=False)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_conn():
    conn = engine.connect()
    conn.execute(text(f"SET search_path TO {SCHEMA}"))
    return conn
