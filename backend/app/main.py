import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.startups import router as startups_router
from app.api.challenges import router as challenges_router
from app.api.applications import router as applications_router
from app.api.evaluations import router as evaluations_router
from app.api.pilots import router as pilots_router
from app.api.kpis import router as kpis_router
from app.api.evidence import router as evidence_router
from app.api.decisions import router as decisions_router
from app.api.uploads import router as uploads_router

app = FastAPI(
    title=settings.APP_NAME,
    description="SIH 26136 Challenge-to-Pilot Lifecycle Platform API",
    version="1.0.0"
)

# CORS Middleware to allow React / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(startups_router)
app.include_router(challenges_router)
app.include_router(applications_router)
app.include_router(evaluations_router)
app.include_router(pilots_router)
app.include_router(kpis_router)
app.include_router(evidence_router)
app.include_router(decisions_router)
app.include_router(uploads_router)

upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
app.mount("/static/uploads", StaticFiles(directory=upload_dir), name="uploads")

@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "demo_mode": settings.DEMO_MODE}
