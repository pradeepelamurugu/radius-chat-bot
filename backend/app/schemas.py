from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MessageCreate(BaseModel):
    user: str
    text: str

class MessageResponse(MessageCreate):
    id: int
    timestamp: datetime
    read_by: list[str] = []

    class Config:
        from_attributes = True
