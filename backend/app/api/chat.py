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
            
            msg_type = payload.get("type", "chat")
            
            if msg_type == "chat":
                user = payload.get("user", "Anonymous")
                text = payload.get("text", "")
                
                # Save to DB
                new_message = MessageModel(user=user, text=text, timestamp=datetime.utcnow(), read_by=[])
                db.add(new_message)
                await db.commit()
                await db.refresh(new_message)
                
                # Broadcast to everyone
                response_payload = {
                    "type": "chat",
                    "id": new_message.id,
                    "user": new_message.user,
                    "text": new_message.text,
                    "timestamp": new_message.timestamp.isoformat(),
                    "read_by": new_message.read_by
                }
                await manager.broadcast(json.dumps(response_payload))
                
                # Check for AI mention
                if "@ai" in text.lower():
                    import asyncio
                    asyncio.create_task(process_ai_message(text))
                    
            elif msg_type == "read":
                message_id = payload.get("message_id")
                user = payload.get("user")
                
                if message_id and user:
                    # Update DB
                    result = await db.execute(select(MessageModel).where(MessageModel.id == message_id))
                    msg = result.scalars().first()
                    
                    if msg:
                        read_by_list = msg.read_by or []
                        if user not in read_by_list and user != msg.user:
                            # Need to re-assign to trigger SQLAlchemy JSON mutation detection
                            new_read_by = list(read_by_list)
                            new_read_by.append(user)
                            msg.read_by = new_read_by
                            await db.commit()
                            await db.refresh(msg)
                            
                            # Broadcast update
                            update_payload = {
                                "type": "message_updated",
                                "id": msg.id,
                                "read_by": msg.read_by
                            }
                            await manager.broadcast(json.dumps(update_payload))
                            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
