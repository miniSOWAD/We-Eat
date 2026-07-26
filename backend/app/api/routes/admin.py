from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import require_roles
from app.core.config import settings
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
    UserStatus,
)
from app.schemas.auth import EmailRequest
from app.schemas.common import MessageResponse
from app.schemas.listings import ListingCard
from app.schemas.moderation import (
    AdminStats,
    AuditLogView,
    CloudinaryDeliveryStatus,
    EmailDeliveryStatus,
    IntegrationStatus,
)
from app.schemas.users import UserAdminUpdate, UserAdminView
from app.services.audit import write_audit
from app.services.email import send_test_email

router = APIRouter(prefix="/admin", tags=["Administration"])


async def _load_user(session: AsyncSession, user_id: UUID) -> User:
    target = await session.scalar(select(User).where(User.id == user_id).with_for_update())
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    return target


def _assert_status_permission(actor: User, target: User) -> None:
    if target.id == actor.id:
        raise HTTPException(status_code=400, detail="You cannot suspend your own account")
    if target.role == UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Administrator accounts cannot be managed here")
    if actor.role == UserRole.MODERATOR and target.role != UserRole.USER:
        raise HTTPException(status_code=403, detail="Moderators can manage basic users only")


async def _commit_access_change(
    *,
    session: AsyncSession,
    actor: User,
    target: User,
    action: str,
    before: dict[str, str],
) -> UserAdminView:
    target.token_version += 1
    after = {"role": target.role.value, "status": target.status.value}
    await write_audit(
        session,
        actor_id=actor.id,
        action=action,
        target_type="USER",
        target_id=target.id,
        metadata={"before": before, "after": after},
    )
    await session.commit()
    await session.refresh(target)
    return UserAdminView.model_validate(target)


@router.get("/stats", response_model=AdminStats)
async def stats(
    actor: User = Depends(require_roles(UserRole.MODERATOR, UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> AdminStats:
    users = int(
        await session.scalar(select(func.count(User.id)).where(User.role == UserRole.USER)) or 0
    )
    moderators = int(
        await session.scalar(select(func.count(User.id)).where(User.role == UserRole.MODERATOR)) or 0
    )
    suspended_users = int(
        await session.scalar(select(func.count(User.id)).where(User.status == UserStatus.SUSPENDED))
        or 0
    )
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
        moderators=moderators,
        suspended_users=suspended_users,
        active_listings=active_listings,
        open_reports=open_reports,
        completed_orders=completed_orders,
        completed_exchanges=completed_exchanges,
        rescued_items=rescued_items,
    )


@router.get("/users", response_model=list[UserAdminView])
async def list_users(
    search: str | None = Query(None, max_length=100),
    role_filter: UserRole | None = Query(None, alias="role"),
    status_filter: UserStatus | None = Query(None, alias="status"),
    actor: User = Depends(require_roles(UserRole.MODERATOR, UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> list[UserAdminView]:
    query = select(User)
    if actor.role == UserRole.MODERATOR:
        query = query.where(User.role == UserRole.USER)
    elif role_filter:
        query = query.where(User.role == role_filter)
    if status_filter:
        query = query.where(User.status == status_filter)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(User.email).like(term),
                func.lower(User.username).like(term),
                func.lower(User.display_name).like(term),
            )
        )
    rows = (await session.scalars(query.order_by(User.created_at.desc()).limit(500))).all()
    return [UserAdminView.model_validate(row) for row in rows]


@router.get("/moderators", response_model=list[UserAdminView])
async def list_moderators(
    search: str | None = Query(None, max_length=100),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> list[UserAdminView]:
    query = select(User).where(User.role == UserRole.MODERATOR)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(User.email).like(term),
                func.lower(User.username).like(term),
                func.lower(User.display_name).like(term),
            )
        )
    rows = (await session.scalars(query.order_by(User.created_at.desc()).limit(500))).all()
    return [UserAdminView.model_validate(row) for row in rows]


@router.post("/users/{user_id}/make-moderator", response_model=UserAdminView)
async def make_moderator(
    user_id: UUID,
    admin: User = Depends(require_roles(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> UserAdminView:
    target = await _load_user(session, user_id)
    if target.role != UserRole.USER:
        raise HTTPException(status_code=409, detail="Only basic users can be promoted")
    if target.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="Unsuspend the user before promotion")
    before = {"role": target.role.value, "status": target.status.value}
    target.role = UserRole.MODERATOR
    return await _commit_access_change(
        session=session,
        actor=admin,
        target=target,
        action="MODERATOR_GRANTED",
        before=before,
    )


@router.post("/users/{user_id}/revoke-moderator", response_model=UserAdminView)
async def revoke_moderator(
    user_id: UUID,
    admin: User = Depends(require_roles(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> UserAdminView:
    target = await _load_user(session, user_id)
    if target.role != UserRole.MODERATOR:
        raise HTTPException(status_code=409, detail="The selected account is not a moderator")
    before = {"role": target.role.value, "status": target.status.value}
    target.role = UserRole.USER
    return await _commit_access_change(
        session=session,
        actor=admin,
        target=target,
        action="MODERATOR_REVOKED",
        before=before,
    )


@router.post("/users/{user_id}/suspend", response_model=UserAdminView)
async def suspend_user(
    user_id: UUID,
    actor: User = Depends(require_roles(UserRole.MODERATOR, UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> UserAdminView:
    target = await _load_user(session, user_id)
    _assert_status_permission(actor, target)
    if target.status == UserStatus.SUSPENDED:
        return UserAdminView.model_validate(target)
    before = {"role": target.role.value, "status": target.status.value}
    target.status = UserStatus.SUSPENDED
    return await _commit_access_change(
        session=session,
        actor=actor,
        target=target,
        action="USER_SUSPENDED",
        before=before,
    )


@router.post("/users/{user_id}/unsuspend", response_model=UserAdminView)
async def unsuspend_user(
    user_id: UUID,
    actor: User = Depends(require_roles(UserRole.MODERATOR, UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> UserAdminView:
    target = await _load_user(session, user_id)
    _assert_status_permission(actor, target)
    if target.status == UserStatus.ACTIVE:
        return UserAdminView.model_validate(target)
    if target.status != UserStatus.SUSPENDED:
        raise HTTPException(status_code=409, detail="Only suspended users can be restored")
    before = {"role": target.role.value, "status": target.status.value}
    target.status = UserStatus.ACTIVE
    return await _commit_access_change(
        session=session,
        actor=actor,
        target=target,
        action="USER_UNSUSPENDED",
        before=before,
    )


@router.patch("/users/{user_id}", response_model=UserAdminView)
async def update_user_compatibility(
    user_id: UUID,
    payload: UserAdminUpdate,
    admin: User = Depends(require_roles(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> UserAdminView:
    """Backward-compatible route. New clients should use the explicit action endpoints."""
    target = await _load_user(session, user_id)
    if target.role == UserRole.ADMIN or target.id == admin.id:
        raise HTTPException(status_code=403, detail="Administrator accounts cannot be changed here")
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        return UserAdminView.model_validate(target)
    if changes.get("role") == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Creating additional admins is not supported")
    before = {"role": target.role.value, "status": target.status.value}
    for key, value in changes.items():
        setattr(target, key, value)
    return await _commit_access_change(
        session=session,
        actor=admin,
        target=target,
        action="USER_ACCESS_UPDATED",
        before=before,
    )


@router.get("/listings", response_model=list[ListingCard])
async def all_listings(
    actor: User = Depends(require_roles(UserRole.MODERATOR, UserRole.ADMIN)),
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
    actor: User = Depends(require_roles(UserRole.MODERATOR, UserRole.ADMIN)),
    session: AsyncSession = Depends(get_db),
) -> list[AuditLogView]:
    rows = (
        await session.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(500))
    ).all()
    return [AuditLogView.model_validate(row) for row in rows]


@router.get("/email/status", response_model=EmailDeliveryStatus)
async def email_status(
    admin: User = Depends(require_roles(UserRole.ADMIN)),
) -> EmailDeliveryStatus:
    return EmailDeliveryStatus(
        mode=settings.effective_email_mode,
        configured=settings.email_is_configured,
        sender=settings.smtp_from_email,
        smtp_host=settings.effective_smtp_host or None,
        missing_settings=settings.email_configuration_errors,
    )




@router.get("/integrations/status", response_model=IntegrationStatus)
async def integration_status(
    admin: User = Depends(require_roles(UserRole.ADMIN)),
) -> IntegrationStatus:
    return IntegrationStatus(
        email=EmailDeliveryStatus(
            mode=settings.effective_email_mode,
            configured=settings.email_is_configured,
            sender=settings.smtp_from_email,
            smtp_host=settings.effective_smtp_host or None,
            missing_settings=settings.email_configuration_errors,
        ),
        cloudinary=CloudinaryDeliveryStatus(
            configured=settings.cloudinary_is_configured,
            cloud_name=settings.effective_cloudinary_cloud_name or None,
            configuration_source=settings.cloudinary_configuration_source,
        ),
    )

@router.post("/email/test", response_model=MessageResponse)
async def test_email_delivery(
    payload: EmailRequest,
    admin: User = Depends(require_roles(UserRole.ADMIN)),
) -> MessageResponse:
    try:
        await send_test_email(to_email=payload.email.lower().strip())
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Test email failed. Check EMAIL_MODE and provider credentials.",
        ) from exc
    return MessageResponse(message="Test email sent")
