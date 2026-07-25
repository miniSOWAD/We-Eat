from __future__ import annotations

import asyncio
import sys

from sqlalchemy import text

from app.db.session import engine


async def check() -> int:
    try:
        async with engine.connect() as connection:
            version = await connection.scalar(text("SELECT version()"))
            users_table = await connection.scalar(text("SELECT to_regclass('public.users')"))
    except Exception as exc:
        print(f"DATABASE CONNECTION FAILED: {type(exc).__name__}: {exc}")
        return 1
    finally:
        await engine.dispose()

    print("Database connection: OK")
    print(f"PostgreSQL: {str(version).split(',')[0]}")
    if users_table:
        print("We Eat schema: OK")
        return 0

    print("We Eat schema: MISSING")
    print("Run: alembic upgrade head")
    return 2


if __name__ == "__main__":
    sys.exit(asyncio.run(check()))
