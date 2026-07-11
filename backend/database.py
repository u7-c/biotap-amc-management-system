import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

load_dotenv()

def get_database_url():
    db_url = (
        os.environ.get("DATABASE_URL")
        or os.environ.get("POSTGRES_URL_NON_POOLING")
        or os.environ.get("POSTGRES_URL")
        or os.environ.get("POSTGRES_PRISMA_URL")
    )

    if not db_url:
        raise RuntimeError(
            "DATABASE_URL is not set. Configure DATABASE_URL (or POSTGRES_URL_NON_POOLING) to a PostgreSQL connection string."
        )

    if os.environ.get("VERCEL") and "sslmode=" not in db_url:
        joiner = "&" if "?" in db_url else "?"
        db_url = f"{db_url}{joiner}sslmode=require"

    return db_url


db_url = get_database_url()

# SQLAlchemy 1.4+ requires 'postgresql://' instead of 'postgres://'
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

SQLALCHEMY_DATABASE_URL = db_url

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=NullPool,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
