import asyncio
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv(override=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY or "TODO_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")
EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

TURSO_DATABASE_URL = os.getenv("TURSO_DATABASE_URL") or "file:local_scores.db"
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN") or ""

# Raise via OPENAI_SEMAPHORE_SIZE=10 in .env for paid-tier keys.
OPENAI_SEMAPHORE_SIZE = int(os.getenv("OPENAI_SEMAPHORE_SIZE", "3"))
openai_semaphore = asyncio.Semaphore(OPENAI_SEMAPHORE_SIZE)

# Additional OpenAI model variants used by multi-model benchmarking.
BENCHMARK_MODELS = [
    model.strip()
    for model in os.getenv("OPENAI_BENCHMARK_MODELS", "gpt-5.5").split(",")
    if model.strip()
]


def is_openai_mock_mode() -> bool:
    return (
        not OPENAI_API_KEY
        or OPENAI_API_KEY.startswith("mock")
        or OPENAI_API_KEY == "TODO_KEY"
        or len(OPENAI_API_KEY) < 40
    )
