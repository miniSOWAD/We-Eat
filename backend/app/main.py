from __future__ import annotations

import logging
import uuid
from contextlib import asynccontextmanager
from datetime import UTC, datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.router import api_router
from app.core.config import settings
from app.db.session import engine
from app.schemas.common import HealthResponse, ReadinessResponse

VERSION = "1.3.0"
logger = logging.getLogger("we_eat")


async def check_database(*, require_schema: bool) -> bool:
    async with engine.connect() as connection:
        await connection.execute(text("SELECT 1"))
        if require_schema:
            users_table = await connection.scalar(text("SELECT to_regclass('public.users')"))
            if not users_table:
                return False
            required_columns = await connection.scalar(
                text(
                    """
                    SELECT COUNT(*) = 5
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND (
                        (table_name = 'orders' AND column_name IN ('scheduled_for', 'handoff_note'))
                        OR
                        (table_name = 'exchange_requests' AND column_name IN ('fulfillment_method', 'scheduled_for', 'handoff_note'))
                      )
                    """
                )
            )
            return bool(required_columns)
    return True


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "Integration configuration: email_mode=%s email_configured=%s cloudinary_configured=%s cloudinary_source=%s",
        settings.effective_email_mode,
        settings.email_is_configured,
        settings.cloudinary_is_configured,
        settings.cloudinary_configuration_source,
    )
    if settings.is_production:
        if any("localhost" in origin for origin in settings.cors_origin_list):
            raise RuntimeError("Production CORS_ORIGINS must contain deployed origins only")
        if "*" in settings.cors_origin_list:
            raise RuntimeError("Wildcard CORS is not allowed in production")
        if not settings.email_is_configured:
            raise RuntimeError("Production email delivery is not configured")

    if settings.check_database_on_startup:
        try:
            await check_database(require_schema=False)
        except Exception as exc:
            raise RuntimeError(
                "Unable to connect to PostgreSQL. Check DATABASE_URL, internet access, "
                "Neon project status, and SSL parameters."
            ) from exc

    yield
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version=VERSION,
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
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = request_id
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled request error", extra={"request_id": request_id})
        raise
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    logger.exception("Database request failed", extra={"request_id": request_id})
    return JSONResponse(
        status_code=503,
        content={
            "detail": "Database service is temporarily unavailable",
            "request_id": request_id,
        },
    )


app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/", response_model=HealthResponse, tags=["System"])
async def root() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=VERSION,
        environment=settings.app_env,
        timestamp=datetime.now(UTC),
    )


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health() -> HealthResponse:
    return await root()


@app.get("/ready", response_model=ReadinessResponse, tags=["System"])
async def readiness() -> ReadinessResponse:
    try:
        schema_ready = await check_database(require_schema=True)
    except SQLAlchemyError:
        return JSONResponse(status_code=503, content={"detail": "Database is unavailable"})  # type: ignore[return-value]

    if not schema_ready:
        return JSONResponse(
            status_code=503,
            content={"detail": "Database schema update is required"},
        )  # type: ignore[return-value]

    return ReadinessResponse(
        status="ready",
        service=settings.app_name,
        version=VERSION,
        environment=settings.app_env,
        database="connected",
        schema_status="ready",
        timestamp=datetime.now(UTC),
    )
