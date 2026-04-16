import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.models.database import engine, Base

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_fetch_chat_history(client):
    response = client.get("/api/chat/history")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_websocket_chat(client):
    with client.websocket_connect("/api/chat/ws") as websocket:
        websocket.send_json({"type": "chat", "user": "TestUser", "text": "Hello User"})
        data = websocket.receive_json()
        assert data["user"] == "TestUser"
        assert data["text"] == "Hello User"
        assert "timestamp" in data

