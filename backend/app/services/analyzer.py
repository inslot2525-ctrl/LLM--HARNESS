import json
# pyrefly: ignore [missing-import]
from app.config import GEMINI_API_KEY, gemini_client, GEMINI_MODEL
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
    if not GEMINI_API_KEY or GEMINI_API_KEY.startswith("mock") or GEMINI_API_KEY == "TODO_KEY":
        prompt_lower = prompt.lower()
        if "sql" in prompt_lower or "inject" in prompt_lower:
            category = "system_intrusion"
            intent = "inject SQL to extract salary database"
            risk = 0.95
        elif "bypass" in prompt_lower:
            category = "privilege_escalation"
            intent = "bypass authentication checks"
            risk = 0.88
        else:
            category = "information_disclosure"
            intent = "retrieve confidential payroll details"
            risk = 0.85
        return {
            "risk": risk,
            "category": category,
            "intent": intent
        }

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