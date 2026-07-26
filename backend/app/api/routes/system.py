from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.db.session import engine
from app.schemas.common import HealthResponse, ReadinessResponse

router = APIRouter(prefix="/system", tags=["System"])
VERSION = "1.4.0"


@router.get("/health", response_model=HealthResponse)
async def api_health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=VERSION,
        environment=settings.app_env,
        timestamp=datetime.now(UTC),
    )


@router.get("/ready", response_model=ReadinessResponse)
async def api_readiness() -> ReadinessResponse:
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
            users_table = await connection.scalar(text("SELECT to_regclass('public.users')"))
            required_columns = await connection.scalar(
                text(
                    """
                    SELECT COUNT(*)
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND (
                        (table_name = 'users' AND column_name IN ('positive_points', 'negative_points'))
                        OR
                        (table_name = 'orders' AND column_name IN (
                          'cancelled_by_id', 'cancellation_note', 'rejection_reason',
                          'requester_notice_seen_at', 'points_awarded_at'
                        ))
                        OR
                        (table_name = 'exchange_requests' AND column_name IN (
                          'cancelled_by_id', 'cancellation_note', 'rejection_reason',
                          'requester_notice_seen_at', 'points_awarded_at'
                        ))
                      )
                    """
                )
            )
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="Database is unavailable") from exc

    if not users_table:
        raise HTTPException(
            status_code=503,
            detail="Database is connected but the schema is missing. Run: alembic upgrade head",
        )
    if int(required_columns or 0) < 12:
        raise HTTPException(
            status_code=503,
            detail="Database needs the v1.4 reputation and proposal migration. Run: alembic upgrade head",
        )

    return ReadinessResponse(
        status="ready",
        service=settings.app_name,
        version=VERSION,
        environment=settings.app_env,
        database="connected",
        schema_status="ready",
        timestamp=datetime.now(UTC),
    )
