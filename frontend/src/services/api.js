/**
 * API service layer — handles all communication with the FastAPI backend.
 *
 * The backend runs on http://localhost:8000. No secrets are stored here.
 */

const API_BASE = 'http://localhost:8000/api';

/**
 * Send a chat message to the backend.
 * @param {string} sessionId  Unique session identifier
 * @param {string} message    User's message text
 * @returns {Promise<Object>} ChatResponse from the backend
 */
export async function sendMessage(sessionId, message) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message }),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || 'Failed to send message. Please try again.');
  }

  return res.json();
}

/**
 * Reset the conversation session.
 * @param {string} sessionId  Session to reset
 * @returns {Promise<Object>}
 */
export async function resetSession(sessionId) {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!res.ok) {
    throw new Error('Failed to reset session.');
  }

  return res.json();
}

/**
 * Generate a unique session ID.
 * @returns {string}
 */
export function generateSessionId() {
  return 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
}
