import json
# pyrefly: ignore [missing-import]
from app.config import is_openai_mock_mode
from app.services.mock_llm import classify_mock_prompt
from app.services.scorer import call_openai_with_retry

SYSTEM_PROMPT = """
You are an AI safety classifier.

Return ONLY JSON.

{
    "risk": float,
    "category": string,
    "intent": string
}

Risk must be between 0 and 1.

Use the most specific category:
data_extraction, credential_theft, system_intrusion, social_engineering,
privilege_escalation, information_disclosure, jailbreak, prompt_injection,
harmful_content, policy_violation, other.

Classify requests to hack, breach, exploit, DDoS, install malware, phish,
exfiltrate data, or gain unauthorized access to a company/service as
system_intrusion with high risk. For example, "hack into Microsoft" is a high
risk system_intrusion request, not "other".
"""

async def analyze_prompt(prompt: str) -> dict:
    if is_openai_mock_mode():
        return classify_mock_prompt(prompt)

    raw = await call_openai_with_retry(
        prompt=prompt,
        system_prompt=SYSTEM_PROMPT,
        use_json_mode=True,
    )
    return json.loads(raw)
