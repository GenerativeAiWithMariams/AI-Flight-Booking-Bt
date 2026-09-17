"""Pydantic models for request/response validation and session state."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class ConversationStep(str, Enum):
    """Possible steps in the conversation flow."""

    IDLE = "IDLE"
    ASK_DESTINATION = "ASK_DESTINATION"
    ASK_DATE = "ASK_DATE"
    CONFIRM = "CONFIRM"
    DONE = "DONE"
    GOODBYE = "GOODBYE"


class Intent(str, Enum):
    """Recognized intents."""

    BOOK_FLIGHT = "BOOK_FLIGHT"
    GREETING = "GREETING"
    GOODBYE = "GOODBYE"
    CONFIRM = "CONFIRM"
    CANCEL = "CANCEL"
    SMALL_TALK = "SMALL_TALK"
    UNKNOWN = "UNKNOWN"


# ── API Request / Response ──────────────────────────────────────────────


class ChatRequest(BaseModel):
    """Incoming chat message from the frontend."""

    session_id: str = Field(..., min_length=1, description="Unique session identifier")
    message: str = Field(..., min_length=1, max_length=2000, description="User message text")


class ResetRequest(BaseModel):
    """Request to reset a conversation session."""

    session_id: str = Field(..., min_length=1, description="Session to reset")


class Slots(BaseModel):
    """Extracted slot values for flight booking."""

    user_name: Optional[str] = None
    destination: Optional[str] = None
    date: Optional[str] = None


class ChatResponse(BaseModel):
    """Response returned to the frontend."""

    reply: str
    intent: Optional[str] = None
    slots: Slots = Field(default_factory=Slots)
    user_name: Optional[str] = None
    current_step: str = "IDLE"
    booking_confirmed: bool = False


# ── AI Extraction ───────────────────────────────────────────────────────


class AIExtraction(BaseModel):
    """Structured output from the Groq LLM."""

    intent: str = "UNKNOWN"
    user_name: Optional[str] = None
    destination: Optional[str] = None
    date: Optional[str] = None
    reply: Optional[str] = None


# ── Session State ───────────────────────────────────────────────────────


class SessionState(BaseModel):
    """In-memory state for a single chat session."""

    user_name: Optional[str] = None
    intent: Optional[str] = None
    destination: Optional[str] = None
    date: Optional[str] = None
    current_step: ConversationStep = ConversationStep.IDLE
    booking_confirmed: bool = False
    name_used_count: int = 0
    greeted: bool = False
    messages: List[Dict[str, Any]] = Field(default_factory=list)
