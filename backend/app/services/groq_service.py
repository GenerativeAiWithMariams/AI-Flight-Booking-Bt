"""Groq LLM service for intent classification, entity extraction, and conversational understanding."""

import json
import re
import logging
from typing import Optional
from groq import Groq
from app.config import settings
from app.models.schemas import AIExtraction

logger = logging.getLogger(__name__)

# ── System Prompt ───────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a friendly AI flight booking assistant. Have a natural conversation with the user. Remember information already provided during the current session. Never ask for information that has already been provided. Ask only for missing booking information. Do not repeat greetings or instructions unnecessarily. Respond naturally to greetings, small talk, acknowledgements, and booking requests. Use the user's name occasionally if known, but do not overuse it.

Analyze the user's message in the context of the conversation and return a JSON object with:
- "intent": one of BOOK_FLIGHT, GREETING, GOODBYE, CONFIRM, CANCEL, SMALL_TALK, UNKNOWN
- "user_name": string or null. If the user introduces themselves (e.g. "I'm Riya", "my name is Sarah", "Hey, I'm Alex"), extract their first name.
- "destination": string or null. Extract travel destination city or country (e.g. "Dubai", "London", "Paris").
- "date": string or null. Extract travel date/time expression (e.g. "September 25", "tomorrow", "next Friday", "25th of Oct").
- "reply": string or null. A natural, friendly, concise 1-2 sentence response adhering to the context.

## INTENT RULES

- GREETING: "hi", "hello", "hey", "good morning", "hello, I'm Riya", "hey there", "good afternoon"
- GOODBYE: "bye", "goodbye", "see you later", "thanks bye", "take care", "that's all for now"
- BOOK_FLIGHT: any interest in booking, finding, or reserving a flight/ticket. Examples:
  "I want to book a flight", "Book me a flight to Dubai", "I need to fly to London",
  "Reserve a plane ticket", "Fly to Paris on Oct 10", "I need a ticket"
- CONFIRM: "yes", "confirm", "sure", "correct", "yep", "yeah", "absolutely", "that looks right"
- CANCEL: "no", "cancel", "wrong", "nope", "not right", "start over", "never mind"
- SMALL_TALK: casual pleasantries or acknowledgements like:
  "how are you?", "thanks", "thank you", "okay", "ok", "that's nice", "cool", "great"
- UNKNOWN: anything completely unrelated or uninterpretable

## ENTITY RULES

- "user_name": Extract when user says "I am [Name]", "I'm [Name]", "My name is [Name]". Title-case it.
- "destination": ONLY extract if an actual location is mentioned. Never guess.
- "date": ONLY extract if an actual date/time expression is mentioned. Keep user's wording.

## CONTEXT OF CURRENT SESSION
{context}

Return ONLY valid JSON. No markdown fences, no explanation.

Example JSON output:
{{"intent":"GREETING","user_name":"Riya","destination":null,"date":null,"reply":"Hi Riya! 👋 Nice to meet you. How can I help you today?"}}
"""

VALID_INTENTS = {
    "BOOK_FLIGHT",
    "GREETING",
    "GOODBYE",
    "CONFIRM",
    "CANCEL",
    "SMALL_TALK",
    "UNKNOWN",
}

NAME_PATTERNS = [
    re.compile(r"(?:i am|i'm|im|my name is|this is)\s+([A-Z][a-zA-Z]+)", re.IGNORECASE),
    re.compile(r"^(?:hello|hi|hey)[,\s]+(?:i am|i'm|im)\s+([A-Z][a-zA-Z]+)", re.IGNORECASE),
]


def _extract_name_fallback(text: str) -> Optional[str]:
    """Fallback regex extractor for common name introduction patterns."""
    for pattern in NAME_PATTERNS:
        match = pattern.search(text)
        if match:
            name = match.group(1).strip().capitalize()
            # Avoid matching common words
            if name.lower() not in {"here", "interested", "looking", "ready", "booking", "going"}:
                return name
    return None


def get_groq_client() -> Groq:
    """Create a Groq client with the configured API key."""
    return Groq(api_key=settings.GROQ_API_KEY)


def extract_intent_and_slots(user_message: str, context: str = "") -> AIExtraction:
    """Send user message to Groq and extract intent, user_name, destination, date, and natural reply."""
    try:
        client = get_groq_client()
        system_msg = SYSTEM_PROMPT.format(context=context or "New conversation")

        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
            max_tokens=250,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content.strip()
        logger.info(f"Groq raw response: {content}")

        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse Groq JSON: {content}")
            data = {}

        intent_raw = str(data.get("intent", "UNKNOWN")).upper()
        if intent_raw not in VALID_INTENTS:
            intent_raw = "UNKNOWN"

        user_name = data.get("user_name") or _extract_name_fallback(user_message)
        if user_name:
            user_name = str(user_name).strip().capitalize()

        destination = data.get("destination") or None
        if destination:
            destination = str(destination).strip()

        date = data.get("date") or None
        if date:
            date = str(date).strip()

        reply = data.get("reply") or None
        if reply:
            reply = str(reply).strip()

        return AIExtraction(
            intent=intent_raw,
            user_name=user_name,
            destination=destination,
            date=date,
            reply=reply,
        )

    except Exception as e:
        logger.error(f"Groq API error: {e}")
        # If API fails, attempt basic fallback extraction so user isn't stranded
        fallback_name = _extract_name_fallback(user_message)
        lowered = user_message.lower().strip()
        if any(w in lowered for w in ["hi", "hello", "hey"]):
            return AIExtraction(intent="GREETING", user_name=fallback_name)
        if any(w in lowered for w in ["bye", "goodbye"]):
            return AIExtraction(intent="GOODBYE")
        if any(w in lowered for w in ["yes", "confirm", "yep", "sure"]):
            return AIExtraction(intent="CONFIRM")
        if any(w in lowered for w in ["no", "cancel"]):
            return AIExtraction(intent="CANCEL")
        raise RuntimeError(f"AI service error: {e}")
