"""Unit tests for the chat service — slot filling, intents, and conversation flow.

All tests mock the Groq API call so they run offline and for free.
"""

import pytest
from unittest.mock import patch
from app.models.schemas import AIExtraction, SessionState, ConversationStep
from app.services.chat_service import process_message
from app.state.session_store import session_store


# ── Helpers ──────────────────────────────────────────────────────────────


def _extraction(intent="UNKNOWN", destination=None, date=None):
    """Shorthand for creating a mock AIExtraction."""
    return AIExtraction(intent=intent, destination=destination, date=date)


MOCK_PATH = "app.services.chat_service.extract_intent_and_slots"


# ── Tests ────────────────────────────────────────────────────────────────


class TestGreeting:
    def setup_method(self):
        session_store._sessions = {}

    @patch(MOCK_PATH)
    def test_greeting_response(self, mock_extract):
        mock_extract.return_value = _extraction(intent="GREETING")
        resp = process_message("t-greet", "Hello")
        assert resp.intent == "GREETING"
        assert "hello" in resp.reply.lower() or "hi" in resp.reply.lower()


class TestBookFlightIntent:
    def setup_method(self):
        session_store._sessions = {}

    @patch(MOCK_PATH)
    def test_intent_detected(self, mock_extract):
        mock_extract.return_value = _extraction(intent="BOOK_FLIGHT")
        resp = process_message("t-bf", "I want to book a flight")
        assert resp.intent == "BOOK_FLIGHT"
        assert resp.current_step == "ASK_DESTINATION"

    @patch(MOCK_PATH)
    def test_destination_extraction(self, mock_extract):
        mock_extract.return_value = _extraction(intent="BOOK_FLIGHT", destination="Dubai")
        resp = process_message("t-dest", "I want to fly to Dubai")
        assert resp.slots.destination == "Dubai"
        assert resp.current_step == "ASK_DATE"

    @patch(MOCK_PATH)
    def test_date_extraction(self, mock_extract):
        # Step 1: provide destination
        mock_extract.return_value = _extraction(intent="BOOK_FLIGHT", destination="Dubai")
        process_message("t-date", "Fly to Dubai")

        # Step 2: provide date
        mock_extract.return_value = _extraction(intent="BOOK_FLIGHT", date="September 25")
        resp = process_message("t-date", "September 25")
        assert resp.slots.date == "September 25"
        assert resp.current_step == "CONFIRM"


class TestMissingSlots:
    def setup_method(self):
        session_store._sessions = {}

    @patch(MOCK_PATH)
    def test_missing_destination(self, mock_extract):
        mock_extract.return_value = _extraction(intent="BOOK_FLIGHT")
        resp = process_message("t-md", "Book a flight")
        assert resp.current_step == "ASK_DESTINATION"
        assert resp.slots.destination is None

    @patch(MOCK_PATH)
    def test_missing_date(self, mock_extract):
        mock_extract.return_value = _extraction(intent="BOOK_FLIGHT", destination="London")
        resp = process_message("t-mdate", "Book a flight to London")
        assert resp.current_step == "ASK_DATE"
        assert resp.slots.destination == "London"
        assert resp.slots.date is None


class TestBothSlotsProvided:
    def setup_method(self):
        session_store._sessions = {}

    @patch(MOCK_PATH)
    def test_skip_to_confirm(self, mock_extract):
        mock_extract.return_value = _extraction(
            intent="BOOK_FLIGHT", destination="Dubai", date="September 25"
        )
        resp = process_message("t-both", "Book a flight to Dubai on September 25")
        assert resp.slots.destination == "Dubai"
        assert resp.slots.date == "September 25"
        assert resp.current_step == "CONFIRM"


class TestFallback:
    def setup_method(self):
        session_store._sessions = {}

    @patch(MOCK_PATH)
    def test_unknown_message(self, mock_extract):
        mock_extract.return_value = _extraction(intent="UNKNOWN")
        resp = process_message("t-fb", "What's the weather?")
        assert resp.intent == "UNKNOWN"
        assert "sorry" in resp.reply.lower() or "didn't understand" in resp.reply.lower()


class TestGoodbye:
    def setup_method(self):
        session_store._sessions = {}

    @patch(MOCK_PATH)
    def test_goodbye_response(self, mock_extract):
        mock_extract.return_value = _extraction(intent="GOODBYE")
        resp = process_message("t-bye", "Goodbye")
        assert "goodbye" in resp.reply.lower() or "bye" in resp.reply.lower()


class TestConfirmation:
    def setup_method(self):
        session_store._sessions = {}

    @patch(MOCK_PATH)
    def test_confirm_booking(self, mock_extract):
        # Set up: both slots → confirmation
        mock_extract.return_value = _extraction(
            intent="BOOK_FLIGHT", destination="Dubai", date="September 25"
        )
        process_message("t-conf", "Book to Dubai Sep 25")

        # Confirm
        mock_extract.return_value = _extraction(intent="CONFIRM")
        resp = process_message("t-conf", "Yes")
        assert resp.booking_confirmed is True
        assert resp.current_step == "DONE"

    @patch(MOCK_PATH)
    def test_cancel_booking(self, mock_extract):
        # Set up: both slots → confirmation
        mock_extract.return_value = _extraction(
            intent="BOOK_FLIGHT", destination="Dubai", date="September 25"
        )
        process_message("t-canc", "Book to Dubai Sep 25")

        # Cancel
        mock_extract.return_value = _extraction(intent="CANCEL")
        resp = process_message("t-canc", "No, cancel")
        assert resp.booking_confirmed is False
        assert resp.slots.destination is None
        assert resp.slots.date is None


class TestSessionReset:
    def setup_method(self):
        session_store._sessions = {}

    def test_reset_clears_state(self):
        # Create state with data
        state = SessionState(
            intent="BOOK_FLIGHT",
            destination="Dubai",
            date="September 25",
            current_step=ConversationStep.CONFIRM,
        )
        session_store.update_session("t-reset", state)

        # Reset
        new_state = session_store.reset_session("t-reset")
        assert new_state.destination is None
        assert new_state.date is None
        assert new_state.current_step == ConversationStep.IDLE
        assert new_state.booking_confirmed is False
