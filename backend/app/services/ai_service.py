import asyncio
from app.websocket.manager import manager

async def process_ai_message(message_text: str):
    """
    Simulates sending the message to an AI model and broadcasting the response.
    """
    # Simulate processing delay
    await asyncio.sleep(2)
    
    # Simple rule-based response for demonstration
    lower_text = message_text.lower()
    if "hello" in lower_text or "hi" in lower_text:
        response = "Hello! I am the Radius AI Assistant. How can I help you today?"
    elif "price" in lower_text:
        response = "Pricing depends on the property features. Let me look that up for you!"
    else:
        response = "I see. Could you provide more details about what you're looking for?"

    # In a real system, we might persist this AI response to the database too.
    # For now, we'll just broadcast it so everyone sees it.
    import json
    from datetime import datetime
    
    ai_payload = {
        "user": "System AI",
        "text": response,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.broadcast(json.dumps(ai_payload))
