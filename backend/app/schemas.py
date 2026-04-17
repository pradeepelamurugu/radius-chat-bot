from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    sender: str
    receiver: str
    text: str

class MessageResponse(MessageCreate):
    id: int
    timestamp: datetime
    read_by: List[str] = []

    class Config:
        from_attributes = True
