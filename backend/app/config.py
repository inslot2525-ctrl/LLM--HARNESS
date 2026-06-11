import asyncio
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv(override=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set in environment")

gemini_client = genai.Client(api_key=GEMINI_API_KEY)
GEMINI_MODEL = "gemini-2.5-flash"
EMBEDDING_MODEL = "gemini-embedding-001"

TURSO_DATABASE_URL = os.getenv("TURSO_DATABASE_URL") or "file:local_scores.db"
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN") or ""

# Shared semaphore: caps concurrent Gemini API calls across all services.
# Free tier allows 5 RPM; 3 slots keeps bursts under the limit while
# still running attacks in parallel.
gemini_semaphore = asyncio.Semaphore(3)