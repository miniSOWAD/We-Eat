from __future__ import annotations

from sqlalchemy.engine import URL, make_url


class DatabaseUrlError(ValueError):
    """Raised when DATABASE_URL is not a supported PostgreSQL URL."""


def normalize_database_url(raw_url: str) -> str:
    """Return a SQLAlchemy asyncpg URL.

    Neon usually provides ``postgresql://`` plus libpq parameters such as
    ``sslmode`` and ``channel_binding``. SQLAlchemy's asyncpg dialect turns URL
    query parameters into keyword arguments for ``asyncpg.connect``. asyncpg
    accepts ``ssl`` but not an ``sslmode`` keyword, so SSL is configured through
    ``DATABASE_SSL_MODE`` and these libpq-only URL options are removed here.
    """

    value = raw_url.strip()
    if not value:
        raise DatabaseUrlError("DATABASE_URL is empty")

    if value.startswith("postgres://"):
        value = "postgresql://" + value.removeprefix("postgres://")

    try:
        url: URL = make_url(value)
    except Exception as exc:
        raise DatabaseUrlError("DATABASE_URL is not a valid database URL") from exc

    if url.drivername == "postgresql":
        url = url.set(drivername="postgresql+asyncpg")
    elif url.drivername != "postgresql+asyncpg":
        raise DatabaseUrlError(
            "DATABASE_URL must use postgresql:// or postgresql+asyncpg://"
        )

    query = dict(url.query)
    query.pop("sslmode", None)
    query.pop("channel_binding", None)
    url = url.set(query=query)
    return url.render_as_string(hide_password=False)
