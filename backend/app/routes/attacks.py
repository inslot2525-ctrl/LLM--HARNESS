from fastapi import APIRouter, HTTPException
from app.models.schemas import PromptRequest
from app.services.analyzer import analyze_prompt
from app.services.attacker import generate_attacks
from app.services.mock_llm import classify_mock_prompt, mock_attack_variants

router = APIRouter()


@router.post("/attacks")
async def create_attacks(data: PromptRequest):
    try:
        analysis = await analyze_prompt(data.prompt)
        return await generate_attacks(
            prompt=data.prompt,
            category=analysis["category"],
            intent=analysis["intent"]
        )
    except RuntimeError as e:
        analysis = classify_mock_prompt(data.prompt)
        return {
            "original_prompt": data.prompt,
            "category": analysis["category"],
            "intent": analysis["intent"],
            "variants": mock_attack_variants(
                data.prompt,
                analysis["category"],
                analysis["intent"],
            ),
        }
    except (KeyError, ValueError) as e:
        raise HTTPException(status_code=502, detail=f"Invalid attack generation response: {e}")
