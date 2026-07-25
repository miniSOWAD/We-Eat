from __future__ import annotations

from collections.abc import Callable
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.models import User, UserRole, UserStatus

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = UUID(payload["sub"])
        token_version = int(payload["tv"])
    except (ValueError, KeyError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token")

    user = await session.scalar(select(User).where(User.id == user_id))
    if not user or user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is unavailable")
    if user.token_version != token_version:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session has been revoked")
    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    return await get_current_user(credentials, session)


def require_roles(*roles: UserRole) -> Callable:
    async def dependency(user: User = Depends(get_current_user)) -> User:
        # This intentionally checks the role loaded from the current database row.
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permission")
        return user

    return dependency


CurrentUser = Depends(get_current_user)
AdminUser = Depends(require_roles(UserRole.ADMIN))
ModeratorUser = Depends(require_roles(UserRole.MODERATOR, UserRole.ADMIN))
