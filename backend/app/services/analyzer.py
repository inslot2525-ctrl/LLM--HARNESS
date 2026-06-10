import json
# pyrefly: ignore [missing-import]
from app.config import gemini_client, GEMINI_MODEL
from google.genai import types

SYSTEM_PROMPT = """
You are an AI safety classifier.

Return ONLY JSON.

{
    "risk": float,
    "category": string,
    "intent": string
}

Risk must be between 0 and 1.
"""

def analyze_prompt(prompt: str):
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        response_mime_type="application/json"
    )
    response = gemini_client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=config
    )

    result = response.text

    return json.loads(result)