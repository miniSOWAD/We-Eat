from __future__ import annotations

import asyncio
from datetime import UTC, datetime

from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.models import User, UserRole, UserStatus


async def main() -> None:
    async with SessionLocal() as session:
        email = settings.admin_email.lower().strip()
        username = settings.admin_username.lower().strip()
        user = await session.scalar(select(User).where(User.email == email))
        if user:
            user.username = username
            user.role = UserRole.ADMIN
            user.status = UserStatus.ACTIVE
            user.password_hash = hash_password(settings.admin_password)
            user.token_version += 1
            print(f"Updated admin: {email}")
        else:
            user = User(
                email=email,
                username=username,
                password_hash=hash_password(settings.admin_password),
                display_name=settings.admin_name,
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
                email_verified_at=datetime.now(UTC),
            )
            session.add(user)
            print(f"Created admin: {email}")
        await session.commit()


if __name__ == "__main__":
    asyncio.run(main())
