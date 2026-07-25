from app.core.database_url import DatabaseUrlError, normalize_database_url


def test_normalizes_neon_url() -> None:
    url = normalize_database_url(
        "postgresql://user:pass@example.neon.tech/db?sslmode=require&channel_binding=require"
    )
    assert url.startswith("postgresql+asyncpg://")
    assert "sslmode" not in url
    assert "channel_binding" not in url


def test_keeps_supported_query_options() -> None:
    url = normalize_database_url(
        "postgresql+asyncpg://user:pass@example.neon.tech/db?prepared_statement_cache_size=0"
    )
    assert "prepared_statement_cache_size=0" in url


def test_rejects_non_postgres_url() -> None:
    try:
        normalize_database_url("sqlite:///app.db")
    except DatabaseUrlError:
        return
    raise AssertionError("Expected DatabaseUrlError")
