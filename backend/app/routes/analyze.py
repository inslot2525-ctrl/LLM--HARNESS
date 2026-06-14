from fastapi import APIRouter, HTTPException
from app.models.schemas import PromptRequest, PromptResponse
from app.services.analyzer import analyze_prompt
from app.services.mock_llm import classify_mock_prompt

router = APIRouter()


@router.post("/analyze", response_model=PromptResponse)
async def analyze(data: PromptRequest):
    try:
        return await analyze_prompt(data.prompt)
    except RuntimeError as e:
        if "cyber_policy" in str(e).lower() or "cybersecurity risk" in str(e).lower():
            return classify_mock_prompt(data.prompt)
        raise HTTPException(status_code=503, detail=str(e))
