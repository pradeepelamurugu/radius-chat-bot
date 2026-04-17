import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

DB_DIR = os.getenv("DB_DIR", ".")
if not os.path.exists(DB_DIR):
    os.makedirs(DB_DIR, exist_ok=True)
db_path = os.path.join(DB_DIR, "chat.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{db_path}")

# For testing, we might want to use memory DB
if os.getenv("TESTING") == "1":
    DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
