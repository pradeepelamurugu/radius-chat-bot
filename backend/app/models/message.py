from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.models.database import Base

class MessageModel(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String, index=True)
    text = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
