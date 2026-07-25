from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import UTC, datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.router import api_router
from app.core.config import settings
from app.db.session import engine
from app.schemas.common import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.is_production:
        if any("localhost" in origin for origin in settings.cors_origin_list) or "*" in settings.cors_origin_list:
            raise RuntimeError("Production CORS_ORIGINS must contain exact deployed origins")
        if settings.email_mode == "log":
            raise RuntimeError("Production EMAIL_MODE cannot be log")
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Food sharing, discounted surplus and food exchange marketplace API.",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health() -> HealthResponse:
    async with engine.connect() as connection:
        await connection.execute(text("SELECT 1"))
    return HealthResponse(status="ok", service=settings.app_name, timestamp=datetime.now(UTC))
