import httpx
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import logging

from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/matching", tags=["AI Matching Service"])


class RecommendationItem(BaseModel):
    startup_id: int
    startup_name: str
    rank: int
    final_score: float
    semantic_score: float
    technology_match: float
    sector_match: float
    experience_score: float
    budget_score: float
    location_score: float
    reasons: List[str]


class MatchResponse(BaseModel):
    challenge_id: int
    challenge_title: str
    recommendations: List[RecommendationItem]
    ai_service_online: bool = True


@router.get("/health")
async def check_ai_health():
    """Verify connectivity with the AI Startup-Challenge Matching microservice."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.AI_SERVICE_URL}/health")
            if resp.status_code == 200:
                return {"status": "online", "ai_service_url": settings.AI_SERVICE_URL}
            return {"status": "unhealthy", "code": resp.status_code}
    except Exception as e:
        return {"status": "offline", "error": str(e), "ai_service_url": settings.AI_SERVICE_URL}


@router.get("/recommendations/{challenge_id}", response_model=MatchResponse)
async def get_challenge_recommendations(
    challenge_id: int,
    top_n: Optional[int] = Query(default=10, ge=1, le=50)
):
    """
    Fetch AI-ranked startup recommendations for a specific challenge.
    Proxies request directly to the StartupChallenge FastAPI microservice.
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            payload = {
                "challenge_id": challenge_id,
                "top_k_semantic": 20,
                "top_n_final": top_n
            }
            response = await client.post(
                f"{settings.AI_SERVICE_URL}/predict",
                json=payload
            )

            if response.status_code == 200:
                data = response.json()
                data["ai_service_online"] = True
                return data
            elif response.status_code == 404:
                raise HTTPException(
                    status_code=404,
                    detail=f"Challenge ID {challenge_id} not found in AI model index."
                )
            else:
                logger.warning(f"AI service returned status {response.status_code}: {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"AI Matching Service error: {response.text}"
                )

        except (httpx.RequestError, httpx.TimeoutException) as exc:
            logger.warning(f"AI service offline or unreachable at {settings.AI_SERVICE_URL}: {exc}")
            
            # Fallback demo mode if AI service is offline
            if settings.DEMO_MODE or True:
                return MatchResponse(
                    challenge_id=challenge_id,
                    challenge_title=f"Challenge #{challenge_id} (Demo Mode)",
                    ai_service_online=False,
                    recommendations=[
                        RecommendationItem(
                            startup_id=101,
                            startup_name="AeroSens Tech",
                            rank=1,
                            final_score=92.4,
                            semantic_score=95.0,
                            technology_match=90.0,
                            sector_match=100.0,
                            experience_score=85.0,
                            budget_score=90.0,
                            location_score=80.0,
                            reasons=[
                                "Strong NLP similarity in drone sensing algorithms",
                                "Proven experience with government trial requirements",
                                "Technology stack directly matches challenge prerequisites"
                            ]
                        ),
                        RecommendationItem(
                            startup_id=102,
                            startup_name="KisanAI Solutions",
                            rank=2,
                            final_score=88.1,
                            semantic_score=90.0,
                            technology_match=85.0,
                            sector_match=90.0,
                            experience_score=80.0,
                            budget_score=95.0,
                            location_score=85.0,
                            reasons=[
                                "High domain relevance in AI payload integration",
                                "Budget proposal within target parameters"
                            ]
                        )
                    ]
                )
            
            raise HTTPException(
                status_code=503,
                detail=f"AI Matching Microservice is offline at {settings.AI_SERVICE_URL}"
            )
