"""Automated test script verifying 10+ natural conversational dialogue patterns."""

import os
import sys

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.chat_service import process_message
from app.state.session_store import session_store


def run_tests():
    print("========================================")
    print("RUNNING 10+ CONVERSATIONAL PATTERN TESTS")
    print("========================================\n")
    passed = 0
    total = 0

    # ──────────────────────────────────────────────────────────
    # Pattern 1-5: Full sequential flow with name
    # ──────────────────────────────────────────────────────────
    print("--- Flow 1: Name greeting -> Booking -> Dubai -> 25 Sept -> Confirm ---")
    s1 = "session_flow_1"
    session_store.reset_session(s1)

    # Step 1: Greeting with name
    total += 1
    r1 = process_message(s1, "Hello, I'm Riya")
    print(f"User: Hello, I'm Riya\nBot:  {r1.reply}\nState: name={r1.user_name}, step={r1.current_step}\n")
    assert r1.user_name == "Riya", f"Expected user_name Riya, got {r1.user_name}"
    assert "Riya" in r1.reply, "Expected name in greeting"
    assert "where would you like to" not in r1.reply.lower(), "Should not force destination question yet"
    passed += 1

    # Step 2: User requests booking
    total += 1
    r2 = process_message(s1, "I want to book a flight")
    print(f"User: I want to book a flight\nBot:  {r2.reply}\nState: step={r2.current_step}\n")
    assert r2.current_step == "ASK_DESTINATION", f"Expected ASK_DESTINATION, got {r2.current_step}"
    assert "fly" in r2.reply.lower() or "go" in r2.reply.lower() or "destination" in r2.reply.lower()
    passed += 1

    # Step 3: User specifies destination
    total += 1
    r3 = process_message(s1, "Dubai")
    print(f"User: Dubai\nBot:  {r3.reply}\nState: dest={r3.slots.destination}, step={r3.current_step}\n")
    assert r3.slots.destination == "Dubai", f"Expected destination Dubai, got {r3.slots.destination}"
    assert r3.current_step == "ASK_DATE", f"Expected ASK_DATE, got {r3.current_step}"
    assert "date" in r3.reply.lower() or "when" in r3.reply.lower(), "Should ask for date"
    assert "where would you like to go" not in r3.reply.lower(), "Should not ask destination again"
    passed += 1

    # Step 4: User specifies date
    total += 1
    r4 = process_message(s1, "25 September")
    print(f"User: 25 September\nBot:  {r4.reply}\nState: date={r4.slots.date}, step={r4.current_step}\n")
    assert r4.slots.date is not None and "September" in r4.slots.date
    assert r4.current_step == "CONFIRM", f"Expected CONFIRM, got {r4.current_step}"
    assert "Dubai" in r4.reply, "Should mention Dubai in confirmation"
    assert "confirm" in r4.reply.lower() or "details" in r4.reply.lower()
    passed += 1

    # Step 5: User confirms
    total += 1
    r5 = process_message(s1, "Yes")
    print(f"User: Yes\nBot:  {r5.reply}\nState: confirmed={r5.booking_confirmed}, step={r5.current_step}\n")
    assert r5.booking_confirmed is True
    assert r5.current_step == "DONE"
    assert "confirmed" in r5.reply.lower()
    passed += 1

    # ──────────────────────────────────────────────────────────
    # Pattern 6: Single utterance with both slots
    # ──────────────────────────────────────────────────────────
    print("--- Pattern 6: Single utterance with both slots ---")
    s2 = "session_flow_2"
    session_store.reset_session(s2)
    total += 1
    r6 = process_message(s2, "I want to fly to London on October 10")
    print(f"User: I want to fly to London on October 10\nBot:  {r6.reply}\nState: dest={r6.slots.destination}, date={r6.slots.date}, step={r6.current_step}\n")
    assert r6.slots.destination == "London"
    assert "October 10" in r6.slots.date
    assert r6.current_step == "CONFIRM"
    assert "where" not in r6.reply.lower(), "Must not ask for destination"
    assert "what date" not in r6.reply.lower(), "Must not ask for date"
    passed += 1

    # ──────────────────────────────────────────────────────────
    # Pattern 7: Natural simple greeting
    # ──────────────────────────────────────────────────────────
    print("--- Pattern 7: Simple greeting without name ---")
    s3 = "session_flow_3"
    session_store.reset_session(s3)
    total += 1
    r7 = process_message(s3, "Hi")
    print(f"User: Hi\nBot:  {r7.reply}\n")
    assert any(w in r7.reply.lower() for w in ["hi", "hello", "hey"])
    passed += 1

    # ──────────────────────────────────────────────────────────
    # Pattern 8: Small talk - How are you?
    # ──────────────────────────────────────────────────────────
    print("--- Pattern 8: Small talk - How are you? ---")
    total += 1
    r8 = process_message(s3, "How are you?")
    print(f"User: How are you?\nBot:  {r8.reply}\n")
    assert "doing great" in r8.reply.lower() or "good" in r8.reply.lower() or "help" in r8.reply.lower()
    passed += 1

    # ──────────────────────────────────────────────────────────
    # Pattern 9: Small talk - Thanks
    # ──────────────────────────────────────────────────────────
    print("--- Pattern 9: Small talk - Thanks ---")
    total += 1
    r9 = process_message(s3, "Thanks")
    print(f"User: Thanks\nBot:  {r9.reply}\n")
    assert "welcome" in r9.reply.lower()
    passed += 1

    # ──────────────────────────────────────────────────────────
    # Pattern 10: Small talk - Okay
    # ──────────────────────────────────────────────────────────
    print("--- Pattern 10: Small talk - Okay ---")
    total += 1
    r10 = process_message(s3, "Okay")
    print(f"User: Okay\nBot:  {r10.reply}\n")
    assert "ready" in r10.reply.lower() or "sure" in r10.reply.lower() or "let me know" in r10.reply.lower()
    passed += 1

    # ──────────────────────────────────────────────────────────
    # Pattern 11: Cancellation flow
    # ──────────────────────────────────────────────────────────
    print("--- Pattern 11: Cancellation flow ---")
    s4 = "session_flow_4"
    session_store.reset_session(s4)
    total += 1
    process_message(s4, "Book a flight to Paris on December 1")
    r11 = process_message(s4, "No, cancel it")
    print(f"User: No, cancel it\nBot:  {r11.reply}\nState: dest={r11.slots.destination}, step={r11.current_step}\n")
    assert r11.slots.destination is None
    assert r11.current_step == "IDLE"
    assert "cancel" in r11.reply.lower()
    passed += 1

    # ──────────────────────────────────────────────────────────
    # Pattern 12: Destination only given first
    # ──────────────────────────────────────────────────────────
    print("--- Pattern 12: Destination provided first ---")
    s5 = "session_flow_5"
    session_store.reset_session(s5)
    total += 1
    r12 = process_message(s5, "I need to go to Tokyo")
    print(f"User: I need to go to Tokyo\nBot:  {r12.reply}\nState: dest={r12.slots.destination}, step={r12.current_step}\n")
    assert r12.slots.destination == "Tokyo"
    assert r12.current_step == "ASK_DATE"
    assert "Tokyo" in r12.reply
    passed += 1

    print("========================================")
    print(f"ALL {passed}/{total} CONVERSATION TESTS PASSED SUCCESSFULLY!")
    print("========================================")


if __name__ == "__main__":
    run_tests()
