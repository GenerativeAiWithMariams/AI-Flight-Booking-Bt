"""Core conversation engine — natural, contextual slot filling & dialogue manager."""

import random
import logging
from typing import Optional
from app.models.schemas import (
    SessionState,
    AIExtraction,
    ChatResponse,
    Slots,
    ConversationStep,
)
from app.services.groq_service import extract_intent_and_slots
from app.state.session_store import session_store

logger = logging.getLogger(__name__)

# ── Response Variation Collections ──────────────────────────────────────

GREETINGS_WITHOUT_NAME = [
    "Hi! 👋 How can I help you today?",
    "Hey there! How can I assist you?",
    "Hello! Nice to see you. What can I help you with?",
    "Hi! What can I help you with today?",
]

GREETINGS_WITH_NAME = [
    "Hi {name}! 👋 Nice to meet you. How can I help you today?",
    "Hey {name}! Great to meet you. How can I assist you today?",
    "Hello {name}! Nice to meet you. What can I help you with?",
]

DESTINATION_ACKNOWLEDGMENTS = [
    "{dest} sounds like a great destination! What date would you like to travel?",
    "Great choice! What date would you like to fly to {dest}?",
    "{dest} is wonderful! And when would you like to travel?",
    "Sure thing! What date would you like to travel to {dest}?",
]

# ── Context Builder for LLM ─────────────────────────────────────────────


def _build_context(state: SessionState) -> str:
    """Provide current session memory & status so the LLM understands conversation progress."""
    parts = []
    if state.user_name:
        parts.append(f"User's name is '{state.user_name}'.")
    if state.destination:
        parts.append(f"Destination is already known: '{state.destination}'.")
    if state.date:
        parts.append(f"Travel date is already known: '{state.date}'.")
    parts.append(f"Current conversation step: '{state.current_step.value}'.")
    parts.append(f"Booking confirmed: {state.booking_confirmed}.")

    if state.current_step == ConversationStep.ASK_DESTINATION:
        parts.append("The bot just asked the user for destination.")
    elif state.current_step == ConversationStep.ASK_DATE:
        parts.append(f"The bot just asked the user for travel date to {state.destination}.")
    elif state.current_step == ConversationStep.CONFIRM:
        parts.append(f"The bot asked the user to confirm flight to {state.destination} on {state.date}.")

    return " ".join(parts)


def _make_response(reply: str, state: SessionState, intent: Optional[str] = None) -> ChatResponse:
    """Helper to build a ChatResponse reflecting current session state."""
    return ChatResponse(
        reply=reply,
        intent=intent or state.intent,
        slots=Slots(
            user_name=state.user_name,
            destination=state.destination,
            date=state.date,
        ),
        user_name=state.user_name,
        current_step=state.current_step.value,
        booking_confirmed=state.booking_confirmed,
    )


# ── Public Entry Point ──────────────────────────────────────────────────


def process_message(session_id: str, user_message: str) -> ChatResponse:
    """Process an incoming user message and return the bot's response."""
    state = session_store.get_session(session_id)

    # Record message in history
    state.messages.append({"role": "user", "content": user_message})

    # Prepare context and extract intent + entities
    context = _build_context(state)
    try:
        extraction = extract_intent_and_slots(user_message, context)
        logger.info(
            f"Extraction: intent={extraction.intent}, name={extraction.user_name}, "
            f"dest={extraction.destination}, date={extraction.date}"
        )
    except Exception as e:
        logger.error(f"Error in extraction: {e}")
        response = _make_response(
            "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
            state,
            intent="ERROR",
        )
        session_store.update_session(session_id, state)
        return response

    # Process conversation logic
    response = _handle_conversation(state, extraction, user_message)

    # Record assistant reply
    state.messages.append({"role": "assistant", "content": response.reply})
    session_store.update_session(session_id, state)

    return response


# ── Dialogue Routing ───────────────────────────────────────────────────


def _handle_conversation(
    state: SessionState, extraction: AIExtraction, user_message: str
) -> ChatResponse:
    """Route conversation based on current step, detected intent, and collected entities."""
    intent = extraction.intent.upper()

    # 1. Update user_name if detected anywhere
    if extraction.user_name and not state.user_name:
        state.user_name = extraction.user_name

    # 2. If waiting for confirmation
    if state.current_step == ConversationStep.CONFIRM:
        return _handle_confirmation(state, intent, user_message)

    # 3. If in active slot filling
    if state.current_step in (ConversationStep.ASK_DESTINATION, ConversationStep.ASK_DATE):
        return _handle_slot_filling(state, extraction, user_message)

    # 4. Greeting intent
    if intent == "GREETING":
        return _handle_greeting(state, extraction)

    # 5. Goodbye intent
    if intent == "GOODBYE":
        return _handle_goodbye(state)

    # 6. Small talk intent
    if intent == "SMALL_TALK":
        return _handle_small_talk(state, extraction, user_message)

    # 7. Booking intent or spontaneous destination mention
    if intent == "BOOK_FLIGHT" or extraction.destination:
        return _handle_book_flight(state, extraction, user_message)

    # 8. If user introduced name without greeting keyword (e.g. "My name is Riya")
    if extraction.user_name:
        return _handle_name_introduction(state)

    # 9. Fallback
    return _handle_fallback(state, extraction)


# ── Intent Handlers ─────────────────────────────────────────────────────


def _handle_greeting(state: SessionState, extraction: AIExtraction) -> ChatResponse:
    """Handle natural greetings with varied responses and name awareness."""
    state.intent = "GREETING"
    state.greeted = True

    # If the user also specified booking info right in the greeting (e.g. "Hi, I want to book a flight")
    if extraction.destination or extraction.date:
        state.intent = "BOOK_FLIGHT"
        if extraction.destination:
            state.destination = extraction.destination
        if extraction.date:
            state.date = extraction.date
        return _determine_next_step(state, is_initial_booking=True)

    if state.user_name:
        template = random.choice(GREETINGS_WITH_NAME)
        reply = template.format(name=state.user_name)
    else:
        reply = random.choice(GREETINGS_WITHOUT_NAME)

    return _make_response(reply, state, intent="GREETING")


def _handle_name_introduction(state: SessionState) -> ChatResponse:
    """Handle isolated name introductions like 'My name is Riya'."""
    reply = f"Nice to meet you, {state.user_name}! How can I help you today?"
    return _make_response(reply, state, intent="GREETING")


def _handle_goodbye(state: SessionState) -> ChatResponse:
    """Handle natural farewells."""
    state.current_step = ConversationStep.GOODBYE
    reply = "You're very welcome! Have a great day and safe travels whenever you fly. Goodbye! 👋"
    return _make_response(reply, state, intent="GOODBYE")


def _handle_small_talk(
    state: SessionState, extraction: AIExtraction, user_message: str
) -> ChatResponse:
    """Handle casual chit-chat, thanks, and acknowledgements without forcing booking."""
    lowered = user_message.lower().strip().strip(".!?")

    if any(p in lowered for p in ["how are you", "how're you", "how r u", "how are you doing"]):
        reply = "I'm doing great, thanks for asking! 😊 How can I help you today?"
    elif any(p in lowered for p in ["thank you", "thanks", "thx", "appreciate it"]):
        reply = "You're very welcome!"
    elif lowered in ["okay", "ok", "alright", "sure", "got it", "fine"]:
        reply = "Sure! Just let me know whenever you're ready."
    elif any(p in lowered for p in ["that's nice", "thats nice", "cool", "awesome", "great", "nice"]):
        reply = "Glad to hear that! 😊"
    elif extraction.reply:
        reply = extraction.reply
    else:
        reply = "I'm here whenever you need assistance! Feel free to ask me anything about booking a flight."

    return _make_response(reply, state, intent="SMALL_TALK")


def _handle_book_flight(
    state: SessionState, extraction: AIExtraction, user_message: str
) -> ChatResponse:
    """Initiate or advance flight booking flow without repeating existing slots."""
    state.intent = "BOOK_FLIGHT"

    # Merge extracted slots — never overwrite existing valid slots with None
    if extraction.destination:
        state.destination = extraction.destination
    if extraction.date:
        state.date = extraction.date

    return _determine_next_step(state, is_initial_booking=True)


def _handle_slot_filling(
    state: SessionState, extraction: AIExtraction, user_message: str
) -> ChatResponse:
    """Fill missing slots with user's contextual input and advance."""
    cleaned = user_message.strip().strip(".!?,").strip()

    # Slot filling for DESTINATION
    if state.current_step == ConversationStep.ASK_DESTINATION:
        dest = extraction.destination or cleaned.title()
        if dest:
            state.destination = dest
        if extraction.date and not state.date:
            state.date = extraction.date

    # Slot filling for DATE
    elif state.current_step == ConversationStep.ASK_DATE:
        travel_date = extraction.date or cleaned
        if travel_date:
            state.date = travel_date
        if extraction.destination and not state.destination:
            state.destination = extraction.destination

    return _determine_next_step(state, is_initial_booking=False)


def _handle_confirmation(
    state: SessionState, intent: str, user_message: str
) -> ChatResponse:
    """Handle confirmation step gracefully."""
    lowered = user_message.lower().strip()

    is_confirm = intent == "CONFIRM" or any(w in lowered for w in ["yes", "yep", "yeah", "confirm", "sure", "correct", "ok", "okay", "please do", "sounds good"])
    is_cancel = intent == "CANCEL" or any(w in lowered for w in ["no", "nope", "cancel", "wrong", "change", "stop", "nevermind", "never mind"])

    if is_confirm:
        state.booking_confirmed = True
        state.current_step = ConversationStep.DONE
        reply = (
            f"You're all set! Your flight request to **{state.destination}** for "
            f"**{state.date}** has been confirmed. ✈️"
        )
        return _make_response(reply, state, intent="BOOK_FLIGHT")

    if is_cancel:
        dest = state.destination
        state.destination = None
        state.date = None
        state.intent = None
        state.booking_confirmed = False
        state.current_step = ConversationStep.IDLE
        reply = "No problem at all. The booking request has been cancelled. Just let me know whenever you'd like to plan another trip!"
        return _make_response(reply, state, intent="CANCEL")

    # If neither confirm nor cancel, clarify politely
    reply = (
        f"Shall I go ahead and confirm your flight to **{state.destination}** on "
        f"**{state.date}**? You can say 'Yes' to confirm or 'No' to cancel."
    )
    return _make_response(reply, state, intent="BOOK_FLIGHT")


def _handle_fallback(state: SessionState, extraction: AIExtraction) -> ChatResponse:
    """Natural fallback when intent is unknown."""
    if extraction.reply:
        reply = extraction.reply
    else:
        reply = (
            "I'm here to help with flight bookings and travel planning! ✈️ "
            "Where are you thinking of traveling?"
        )
    return _make_response(reply, state, intent="UNKNOWN")


# ── Slot Logic & Follow-Up Questions ────────────────────────────────────


def _determine_next_step(state: SessionState, is_initial_booking: bool = False) -> ChatResponse:
    """Decide what to ask next based on missing slots, with natural conversational phrasing."""

    # 1. Missing Destination
    if not state.destination:
        state.current_step = ConversationStep.ASK_DESTINATION

        # If user has a name and this is initial booking, address them naturally
        if state.user_name and state.name_used_count == 0:
            state.name_used_count += 1
            reply = f"Absolutely, {state.user_name}! Where would you like to fly?"
        elif is_initial_booking:
            reply = "Absolutely! Where would you like to fly?"
        else:
            reply = "Sure! Where are you planning to fly?"

        return _make_response(reply, state, intent="BOOK_FLIGHT")

    # 2. Missing Date (Destination already provided)
    if not state.date:
        state.current_step = ConversationStep.ASK_DATE

        # Acknowledge the destination naturally
        template = random.choice(DESTINATION_ACKNOWLEDGMENTS)
        reply = template.format(dest=f"**{state.destination}**")
        return _make_response(reply, state, intent="BOOK_FLIGHT")

    # 3. Both Slots Filled -> Transition to Confirmation
    state.current_step = ConversationStep.CONFIRM

    if is_initial_booking:
        # User provided both destination and date in one utterance!
        reply = (
            f"Perfect! I have **{state.destination}** as your destination and "
            f"**{state.date}** as your travel date. Would you like me to confirm those details?"
        )
    else:
        # User just supplied the date after destination
        reply = (
            f"Got it — **{state.destination}** on **{state.date}**. "
            f"Shall I confirm your flight details?"
        )

    return _make_response(reply, state, intent="BOOK_FLIGHT")
