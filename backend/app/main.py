"""FastAPI application entry point."""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.chat import router as chat_router
from app.config import settings, validate_settings

# ── Logging ─────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ── App ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="AI Flight Booking Bot",
    description="An AI-powered conversational flight booking chatbot using Groq LLM",
    version="1.0.0",
)

# ── CORS ────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ──────────────────────────────────────────────────────────────

app.include_router(chat_router)


# ── Lifecycle Events ────────────────────────────────────────────────────


@app.on_event("startup")
async def startup() -> None:
    """Validate configuration on startup."""
    try:
        validate_settings()
        logger.info("✅  Groq API key loaded successfully")
        logger.info(f"📋  Using model: {settings.GROQ_MODEL}")
    except ValueError as e:
        logger.error(f"❌  Configuration error: {e}")
        raise


# ── Health ──────────────────────────────────────────────────────────────


@app.get("/")
async def root():
    return {"status": "running", "service": "AI Flight Booking Bot"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
