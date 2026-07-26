from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import PointNotification, User
from app.schemas.common import MessageResponse
from app.schemas.reputation import PointNotificationView

router = APIRouter(prefix="/reputation", tags=["Reputation"])


@router.get("/notifications", response_model=list[PointNotificationView])
async def unseen_point_notifications(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[PointNotificationView]:
    rows = (
        await session.scalars(
            select(PointNotification)
            .where(
                PointNotification.user_id == user.id,
                PointNotification.seen_at.is_(None),
            )
            .order_by(PointNotification.created_at.asc())
            .limit(20)
        )
    ).all()
    return [PointNotificationView.model_validate(row) for row in rows]


@router.post(
    "/notifications/{notification_id}/acknowledge",
    response_model=MessageResponse,
)
async def acknowledge_point_notification(
    notification_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    row = await session.scalar(
        select(PointNotification)
        .where(
            PointNotification.id == notification_id,
            PointNotification.user_id == user.id,
        )
        .with_for_update()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Point notification not found")
    if not row.seen_at:
        row.seen_at = datetime.now(UTC)
        await session.commit()
    return MessageResponse(message="Point notification acknowledged")
