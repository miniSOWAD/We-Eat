from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import User, UserStatus
from app.schemas.users import UserMe, UserPublic, UserUpdate
from app.services.cloudinary import delete_image, upload_image

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
    changes = payload.model_dump(exclude_unset=True)
    if "username" in changes and changes["username"] != user.username:
        exists = await session.scalar(
            select(User.id).where(User.username == changes["username"], User.id != user.id)
        )
        if exists:
            raise HTTPException(status_code=409, detail="Username is already in use")

    for key, value in changes.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(user, key, value)

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Username is already in use") from exc
    await session.refresh(user)
    return UserMe.model_validate(user)


@router.post("/avatar", response_model=UserMe)
async def upload_profile_avatar(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> UserMe:
    uploaded = await upload_image(file, owner_id=str(user.id), resource_group="users")
    previous_public_id = user.avatar_public_id
    user.avatar_url = uploaded["secure_url"]
    user.avatar_public_id = uploaded["public_id"]
    await session.commit()
    await session.refresh(user)

    if previous_public_id and previous_public_id != user.avatar_public_id:
        try:
            await delete_image(previous_public_id)
        except Exception:
            # The new avatar is already stored. Old-file cleanup must not break profile updates.
            pass

    return UserMe.model_validate(user)


@router.get("/{user_id}", response_model=UserPublic)
async def public_profile(user_id: UUID, session: AsyncSession = Depends(get_db)) -> UserPublic:
    user = await session.scalar(
        select(User).where(User.id == user_id, User.status == UserStatus.ACTIVE)
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublic.model_validate(user)
