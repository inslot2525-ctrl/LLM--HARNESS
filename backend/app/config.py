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

# Raise via GEMINI_SEMAPHORE_SIZE=10 in .env for paid-tier keys.
GEMINI_SEMAPHORE_SIZE = int(os.getenv("GEMINI_SEMAPHORE_SIZE", "3"))
gemini_semaphore = asyncio.Semaphore(GEMINI_SEMAPHORE_SIZE)

# Additional Gemini model variants used by multi-model benchmarking.
BENCHMARK_MODELS = ["gemini-2.0-flash-lite", "gemini-2.5-pro"]