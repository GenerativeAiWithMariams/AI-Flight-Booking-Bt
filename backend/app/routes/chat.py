"""Chat API routes."""

import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ResetRequest, ChatResponse
from app.services.chat_service import process_message
from app.state.session_store import session_store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Process a chat message and return the bot's response.

    - Validates the incoming request.
    - Delegates to the conversation engine.
    - Returns structured response with intent, slots, and step info.
    """
    try:
        response = process_message(request.session_id, request.message)
        return response
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request. Please try again.",
        )


@router.post("/reset")
async def reset(request: ResetRequest):
    """Reset a conversation session to its initial state."""
    session_store.reset_session(request.session_id)
    return {"status": "success", "message": "Session has been reset."}
