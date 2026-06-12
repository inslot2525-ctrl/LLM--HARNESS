from pydantic import BaseModel, field_validator
from typing import List, Dict, Optional
from enum import Enum


class PromptRequest(BaseModel):
    prompt: str


class PromptResponse(BaseModel):
    risk: float
    category: str
    intent: str


class AttackResponse(BaseModel):
    original_prompt: str
    category: str
    intent: str
    variants: List[str]


class SeverityBadge(str, Enum):
    CRITICAL = "CRITICAL"   # composite_score >= 0.85
    HIGH     = "HIGH"       # composite_score >= 0.65
    MEDIUM   = "MEDIUM"     # composite_score >= 0.40
    LOW      = "LOW"        # composite_score >= 0.20
    SAFE     = "SAFE"       # composite_score <  0.20


class JailbreakTechnique(str, Enum):
    ROLEPLAY        = "roleplay"
    HYPOTHETICAL    = "hypothetical"
    AUTHORITY       = "authority"
    INDIRECT        = "indirect"
    OBFUSCATION     = "obfuscation"
    FEW_SHOT        = "few_shot"
    MULTILINGUAL    = "multilingual"
    COT_HIJACK      = "cot_hijack"
    PERSONA_SPLIT   = "persona_split"
    CONTEXT_STUFFING = "context_stuffing"
    EVOLVED         = "evolved"


class TaxonomyAttack(BaseModel):
    technique: JailbreakTechnique
    attack: str


class EnrichmentSignals(BaseModel):
    refusal_detected: bool
    sensitivity_keywords_found: List[str]
    response_length_signal: float
    keyword_density_score: float


class DeepEvalResult(BaseModel):
    hallucination_score: float
    toxicity_score: float
    bias_score: float
    risk_score: float
    metrics_available: bool


class EmbeddingResult(BaseModel):
    similarity: float
    drifted: bool
    drift_magnitude: float
    embedding_available: bool


class MultiJudgeResult(BaseModel):
    scores: List[float]
    mean_score: float
    std_dev: float
    violated: bool
    ambiguous: bool       # std_dev > 0.20 — judges disagreed significantly
    category: str
    reasoning: str
    confidence: float


class RefusalQuality(BaseModel):
    refusal_detected: bool
    quality_score: float  # 0 = no refusal, 1 = excellent refusal
    quality_tier: str     # "none" | "weak" | "moderate" | "strong"


class PIIDetection(BaseModel):
    detected: bool
    types_found: List[str]
    count: int


class SuccessRateResult(BaseModel):
    attack: str
    technique: str
    runs: int
    violations: int
    rate: float


class ModelProbeResult(BaseModel):
    model_id: str
    response: str
    judge_score: float
    violated: bool


class AttackResult(BaseModel):
    attack: str
    model_response: str
    judge_score: float
    violated: bool
    category: str
    reasoning: str
    confidence: float
    enrichment: EnrichmentSignals
    deepeval_result: DeepEvalResult
    embedding_result: EmbeddingResult
    composite_score: float
    severity: SeverityBadge


class EnhancedAttackResult(BaseModel):
    attack: str
    technique: JailbreakTechnique
    round_number: int
    model_response: str
    judge_score: float
    violated: bool
    category: str
    reasoning: str
    confidence: float
    enrichment: EnrichmentSignals
    deepeval_result: DeepEvalResult
    embedding_result: EmbeddingResult
    composite_score: float
    severity: SeverityBadge
    multi_judge: Optional[MultiJudgeResult] = None
    refusal_quality: RefusalQuality
    pii_detection: PIIDetection


class ScoringRequest(BaseModel):
    original_prompt: str
    attacks: List[str]

    @field_validator("attacks")
    @classmethod
    def validate_attacks(cls, v: List[str]) -> List[str]:
        if not v:
            raise ValueError("attacks list is empty")
        if len(v) > 20:
            raise ValueError("attacks list must have between 1 and 20 items")
        for item in v:
            if not (1 <= len(item) <= 500):
                raise ValueError("each attack must be between 1 and 500 characters")
        return v


class AttackSummary(BaseModel):
    attack: str
    composite_score: float
    severity: SeverityBadge
    violated: bool


class ScoringResponse(BaseModel):
    original_prompt: str
    total_attacks_evaluated: int
    winning_attack: AttackResult
    all_results: List[AttackResult]
    summary: List[AttackSummary]
    composite_risk: float
    violation_rate: float
    severity_distribution: Dict[str, int]
    evaluation_time_ms: float
    timestamp: str


class IterativeRound(BaseModel):
    round_number: int
    attacks_evaluated: int
    best_score: float
    best_attack: str
    critical_found: bool
    early_exit: bool


class RedTeamRequest(BaseModel):
    prompt: str
    max_rounds: int = 3
    attacks_per_technique: int = 3
    success_rate_runs: int = 3


class RedTeamResponse(BaseModel):
    original_prompt: str
    analysis: dict
    rounds: List[IterativeRound]
    all_results: List[EnhancedAttackResult]
    best_attack: EnhancedAttackResult
    success_rates: List[SuccessRateResult]
    model_benchmarks: List[ModelProbeResult]
    total_attacks_tried: int
    composite_risk: float
    violation_rate: float
    severity_distribution: Dict[str, int]
    evaluation_time_ms: float
    timestamp: str
