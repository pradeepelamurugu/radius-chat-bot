from typing import Dict, List, Any
import json

class ConnectionManager:
    def __init__(self):
        # Maps username to a list of active websocket connections
        self.active_connections: Dict[str, List[Any]] = {}

    async def connect(self, websocket: Any, username: str):
        await websocket.accept()
        if username not in self.active_connections:
            self.active_connections[username] = []
        self.active_connections[username].append(websocket)

    def disconnect(self, websocket: Any, username: str):
        if username in self.active_connections:
            if websocket in self.active_connections[username]:
                self.active_connections[username].remove(websocket)
            if not self.active_connections[username]:
                del self.active_connections[username]

    async def broadcast(self, message: str):
        # Broadcast to all users (used for global events, but we might deprecate this in 1on1)
        for username, connections in self.active_connections.items():
            for connection in connections:
                await connection.send_text(message)

    async def send_personal_message(self, message: str, username: str):
        if username in self.active_connections:
            for connection in self.active_connections[username]:
                await connection.send_text(message)

manager = ConnectionManager()
