from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.models import (
    AuditLog,
    ExchangeRequest,
    ExchangeStatus,
    Listing,
    ListingStatus,
    Order,
    OrderStatus,
    Report,
    ReportStatus,
    User,
    UserRole,
)
from app.schemas.listings import ListingCard
from app.schemas.moderation import AdminStats, AuditLogView
from app.schemas.users import UserAdminUpdate, UserAdminView
from app.services.audit import write_audit

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/stats", response_model=AdminStats)
async def stats(
    admin: User = Depends(require_roles(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> AdminStats:
    users = int(await session.scalar(select(func.count(User.id))) or 0)
    active_listings = int(
        await session.scalar(
            select(func.count(Listing.id)).where(Listing.status == ListingStatus.ACTIVE)
        )
        or 0
    )
    open_reports = int(
        await session.scalar(
            select(func.count(Report.id)).where(
                Report.status.in_([ReportStatus.OPEN, ReportStatus.IN_REVIEW])
            )
        )
        or 0
    )
    completed_orders = int(
        await session.scalar(
            select(func.count(Order.id)).where(Order.status == OrderStatus.COMPLETED)
        )
        or 0
    )
    completed_exchanges = int(
        await session.scalar(
            select(func.count(ExchangeRequest.id)).where(
                ExchangeRequest.status == ExchangeStatus.COMPLETED
            )
        )
        or 0
    )
    rescued_items = int(
        await session.scalar(
            select(func.coalesce(func.sum(Order.quantity), 0)).where(
                Order.status == OrderStatus.COMPLETED
            )
        )
        or 0
    )
    return AdminStats(
        users=users,
        active_listings=active_listings,
        open_reports=open_reports,
        completed_orders=completed_orders,
        completed_exchanges=completed_exchanges,
        rescued_items=rescued_items,
    )


@router.get("/users", response_model=list[UserAdminView])
async def list_users(
    search: str | None = Query(None, max_length=100),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> list[UserAdminView]:
    query = select(User)
    if search:
        term = f"%{search.strip()}%"
        query = query.where(User.email.ilike(term) | User.display_name.ilike(term))
    rows = (await session.scalars(query.order_by(User.created_at.desc()).limit(500))).all()
    return [UserAdminView.model_validate(row) for row in rows]


@router.patch("/users/{user_id}", response_model=UserAdminView)
async def update_user(
    user_id: UUID,
    payload: UserAdminUpdate,
    admin: User = Depends(require_roles(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> UserAdminView:
    target = await session.scalar(select(User).where(User.id == user_id).with_for_update())
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == admin.id and payload.status and payload.status.value != "ACTIVE":
        raise HTTPException(status_code=400, detail="You cannot disable your own account")
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        return UserAdminView.model_validate(target)
    before = {"role": target.role.value, "status": target.status.value}
    for key, value in changes.items():
        setattr(target, key, value)
    target.token_version += 1
    await write_audit(
        session,
        actor_id=admin.id,
        action="USER_ACCESS_UPDATED",
        target_type="USER",
        target_id=target.id,
        metadata={"before": before, "after": {k: v.value for k, v in changes.items()}},
    )
    await session.commit()
    return UserAdminView.model_validate(target)


@router.get("/listings", response_model=list[ListingCard])
async def all_listings(
    admin: User = Depends(require_roles(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> list[ListingCard]:
    rows = (
        await session.scalars(
            select(Listing)
            .options(selectinload(Listing.images), selectinload(Listing.owner))
            .order_by(Listing.created_at.desc())
            .limit(500)
        )
    ).all()
    return [ListingCard.model_validate(row) for row in rows]


@router.get("/audit-logs", response_model=list[AuditLogView])
async def audit_logs(
    admin: User = Depends(require_roles(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> list[AuditLogView]:
    rows = (
        await session.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(500))
    ).all()
    return [AuditLogView.model_validate(row) for row in rows]
