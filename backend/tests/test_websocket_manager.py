import pytest
import asyncio
from app.websocket.manager import ConnectionManager
from fastapi import WebSocket

class MockWebSocket:
    def __init__(self):
        self.sent_messages = []
        self.client_state = 1  # CONNECTED
    
    async def send_text(self, data: str):
        self.sent_messages.append(data)
        
    async def accept(self):
        self.client_state = 1

@pytest.mark.asyncio
async def test_connect_and_disconnect():
    manager = ConnectionManager()
    ws1 = MockWebSocket()
    ws2 = MockWebSocket()
    
    await manager.connect(ws1)
    assert len(manager.active_connections) == 1
    
    await manager.connect(ws2)
    assert len(manager.active_connections) == 2
    
    manager.disconnect(ws1)
    assert len(manager.active_connections) == 1
    
@pytest.mark.asyncio
async def test_broadcast():
    manager = ConnectionManager()
    ws1 = MockWebSocket()
    ws2 = MockWebSocket()
    
    await manager.connect(ws1)
    await manager.connect(ws2)
    
    await manager.broadcast("Hello World")
    
    assert "Hello World" in ws1.sent_messages
    assert "Hello World" in ws2.sent_messages
