from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import json
from datetime import datetime

from app.models.database import get_db
from app.models.message import MessageModel
from app.schemas import MessageResponse
from app.websocket.manager import manager
from app.services.ai_service import process_ai_message

router = APIRouter()

@router.get("/history", response_model=List[MessageResponse])
async def get_chat_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MessageModel).order_by(MessageModel.timestamp.asc()).limit(50))
    messages = result.scalars().all()
    return messages

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            user = payload.get("user", "Anonymous")
            text = payload.get("text", "")
            
            # Save to DB
            new_message = MessageModel(user=user, text=text, timestamp=datetime.utcnow())
            db.add(new_message)
            await db.commit()
            await db.refresh(new_message)
            
            # Broadcast to everyone
            response_payload = {
                "id": new_message.id,
                "user": new_message.user,
                "text": new_message.text,
                "timestamp": new_message.timestamp.isoformat()
            }
            await manager.broadcast(json.dumps(response_payload))
            
            # Check for AI mention
            if "@ai" in text.lower():
                # Launch AI task in background
                # Note: background tasks attached to WebSocket routes might not execute as expected
                # since the route handles the loop. In FastAPI, WebSockets don't inherently process BackgroundTasks
                # the same way as HTTP. Let's use asyncio.create_task instead.
                import asyncio
                asyncio.create_task(process_ai_message(text))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
