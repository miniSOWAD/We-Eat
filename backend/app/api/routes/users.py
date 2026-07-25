from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import User, UserStatus
from app.schemas.users import UserMe, UserPublic, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserMe)
async def my_profile(user: User = Depends(get_current_user)) -> UserMe:
    return UserMe.model_validate(user)


@router.patch("/profile", response_model=UserMe)
async def update_profile(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> UserMe:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value.strip() if isinstance(value, str) else value)
    await session.commit()
    return UserMe.model_validate(user)


@router.get("/{user_id}", response_model=UserPublic)
async def public_profile(user_id: UUID, session: AsyncSession = Depends(get_db)) -> UserPublic:
    user = await session.scalar(
        select(User).where(User.id == user_id, User.status == UserStatus.ACTIVE)
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublic.model_validate(user)
