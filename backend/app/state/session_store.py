"""In-memory session store for conversation state.

NOTE: This is suitable for local/demo use. For production, replace with
Redis or PostgreSQL for horizontal scaling and persistence.
"""

from app.models.schemas import SessionState
from typing import Dict


class SessionStore:
    """Thread-safe-ish in-memory session store backed by a dict."""

    def __init__(self) -> None:
        self._sessions: Dict[str, SessionState] = {}

    def get_session(self, session_id: str) -> SessionState:
        """Get or create a session."""
        if session_id not in self._sessions:
            self._sessions[session_id] = SessionState()
        return self._sessions[session_id]

    def update_session(self, session_id: str, state: SessionState) -> None:
        """Persist updated session state."""
        self._sessions[session_id] = state

    def reset_session(self, session_id: str) -> SessionState:
        """Reset a session to its initial state."""
        self._sessions[session_id] = SessionState()
        return self._sessions[session_id]

    def delete_session(self, session_id: str) -> None:
        """Remove a session entirely."""
        self._sessions.pop(session_id, None)


# Singleton instance
session_store = SessionStore()
