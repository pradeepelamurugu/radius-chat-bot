from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_
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
async def get_chat_history(
    user1: str = Query(...), 
    user2: str = Query(...), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(MessageModel)
        .where(
            or_(
                and_(MessageModel.sender == user1, MessageModel.receiver == user2),
                and_(MessageModel.sender == user2, MessageModel.receiver == user1)
            )
        )
        .order_by(MessageModel.timestamp.asc())
        .limit(100)
    )
    messages = result.scalars().all()
    return messages

@router.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    await manager.connect(websocket, username)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            msg_type = payload.get("type", "chat")
            
            if msg_type == "chat":
                sender = username
                receiver = payload.get("receiver", "")
                text = payload.get("text", "")
                
                # Save to DB
                new_message = MessageModel(sender=sender, receiver=receiver, text=text, timestamp=datetime.utcnow(), read_by=[])
                db.add(new_message)
                await db.commit()
                await db.refresh(new_message)
                
                response_payload = {
                    "type": "chat",
                    "id": new_message.id,
                    "sender": new_message.sender,
                    "receiver": new_message.receiver,
                    "text": new_message.text,
                    "timestamp": new_message.timestamp.isoformat(),
                    "read_by": new_message.read_by
                }
                response_str = json.dumps(response_payload)
                
                # Send to receiver and back to sender
                await manager.send_personal_message(response_str, sender)
                if receiver != sender:
                    await manager.send_personal_message(response_str, receiver)
                
                # Check for AI mention
                if "@ai" in text.lower():
                    import asyncio
                    asyncio.create_task(process_ai_message(text, sender, receiver))
                    
            elif msg_type == "read":
                message_id = payload.get("message_id")
                user = username # the person reading it
                
                if message_id and user:
                    # Update DB
                    result = await db.execute(select(MessageModel).where(MessageModel.id == message_id))
                    msg = result.scalars().first()
                    
                    if msg:
                        read_by_list = msg.read_by or []
                        if user not in read_by_list and user != msg.sender:
                            new_read_by = list(read_by_list)
                            new_read_by.append(user)
                            msg.read_by = new_read_by
                            await db.commit()
                            await db.refresh(msg)
                            
                            update_payload = {
                                "type": "message_updated",
                                "id": msg.id,
                                "read_by": msg.read_by
                            }
                            update_str = json.dumps(update_payload)
                            
                            await manager.send_personal_message(update_str, msg.sender)
                            await manager.send_personal_message(update_str, msg.receiver)
                            
    except WebSocketDisconnect:
        manager.disconnect(websocket, username)
