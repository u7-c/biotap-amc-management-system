import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Use Vercel's /tmp directory for SQLite if running on Vercel without a Postgres DB
if os.environ.get("VERCEL"):
    default_db = "sqlite:////tmp/amc.db"
else:
    default_db = "sqlite:///./amc.db"

# Use POSTGRES_URL (Vercel Postgres default) or DATABASE_URL if provided
db_url = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL") or default_db

# SQLAlchemy 1.4+ requires 'postgresql://' instead of 'postgres://'
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

SQLALCHEMY_DATABASE_URL = db_url

# Only use check_same_thread for SQLite
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
