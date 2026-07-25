from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.models import (
    Comment,
    Listing,
    Report,
    ReportStatus,
    ReportTargetType,
    User,
    UserRole,
)
from app.schemas.moderation import ReportCreate, ReportUpdate, ReportView
from app.services.audit import write_audit

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("", response_model=ReportView, status_code=201)
async def create_report(
    payload: ReportCreate,
    reporter: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ReportView:
    target_columns = {"listing_id": None, "user_id": None, "comment_id": None}
    if payload.target_type == ReportTargetType.LISTING:
        exists = await session.scalar(select(Listing.id).where(Listing.id == payload.target_id))
        target_columns["listing_id"] = payload.target_id
    elif payload.target_type == ReportTargetType.USER:
        exists = await session.scalar(select(User.id).where(User.id == payload.target_id))
        if payload.target_id == reporter.id:
            raise HTTPException(status_code=400, detail="You cannot report yourself")
        target_columns["user_id"] = payload.target_id
    else:
        exists = await session.scalar(select(Comment.id).where(Comment.id == payload.target_id))
        target_columns["comment_id"] = payload.target_id
    if not exists:
        raise HTTPException(status_code=404, detail="Report target not found")

    report = Report(
        reporter_id=reporter.id,
        target_type=payload.target_type,
        reason=payload.reason.strip(),
        details=payload.details,
        **target_columns,
    )
    session.add(report)
    await session.commit()
    await session.refresh(report)
    return ReportView.model_validate(report)


@router.get("/moderation", response_model=list[ReportView])
async def moderation_queue(
    status_filter: ReportStatus | None = Query(None, alias="status"),
    moderator: User = Depends(require_roles(UserRole.MODERATOR, UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> list[ReportView]:
    query = select(Report)
    if status_filter:
        query = query.where(Report.status == status_filter)
    rows = (await session.scalars(query.order_by(Report.created_at.desc()).limit(250))).all()
    return [ReportView.model_validate(row) for row in rows]


@router.patch("/{report_id}", response_model=ReportView)
async def resolve_report(
    report_id: UUID,
    payload: ReportUpdate,
    moderator: User = Depends(require_roles(UserRole.MODERATOR, UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> ReportView:
    report = await session.scalar(select(Report).where(Report.id == report_id).with_for_update())
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = payload.status
    report.resolution_note = payload.resolution_note
    report.handled_by_id = moderator.id
    report.handled_at = datetime.now(UTC)
    await write_audit(
        session,
        actor_id=moderator.id,
        action="REPORT_STATUS_UPDATED",
        target_type="REPORT",
        target_id=report.id,
        metadata={"status": payload.status.value},
    )
    await session.commit()
    return ReportView.model_validate(report)
