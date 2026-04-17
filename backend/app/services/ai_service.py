import asyncio
from app.websocket.manager import manager
import json
from datetime import datetime

async def process_ai_message(message_text: str, current_user: str, conversation_with: str):
    """
    Simulates sending the message to an AI model and sending the response.
    """
    await asyncio.sleep(2)
    
    lower_text = message_text.lower()
    if "hello" in lower_text or "hi" in lower_text:
        response = "Hello! I am the Radius AI Assistant. How can I help you today?"
    elif "price" in lower_text:
        response = "Pricing depends on the property features. Let me look that up for you!"
    else:
        response = "I see. Could you provide more details about what you're looking for?"

    # We send it back as if it's from the person/context they were talking to
    ai_payload = {
        "type": "chat",
        "id": int(datetime.utcnow().timestamp()), # fake ID for unsaved AI msg
        "sender": "System AI",
        "receiver": current_user,
        "conversation_with": conversation_with,
        "text": response,
        "timestamp": datetime.utcnow().isoformat(),
        "read_by": []
    }
    
    response_str = json.dumps(ai_payload)
    
    # Send it only to the user who invoked it
    await manager.send_personal_message(response_str, current_user)
