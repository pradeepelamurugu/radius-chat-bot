from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat import router as chat_router
from app.api.auth import router as auth_router

import contextlib
from app.models.database import engine, Base

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup DB
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # We won't drop all here in production, but for simple task it's okay, or we just leave it.

app = FastAPI(lifespan=lifespan, title="Radius Chat API")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, use explicit origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])
# Also alias the websocket route since our test expects /ws/chat and frontend might want it
app.include_router(chat_router, prefix="/ws/chat")
