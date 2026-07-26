"""add usernames and managed profile avatars

Revision ID: 20260726_0002
Revises: 20260725_0001
Create Date: 2026-07-26
"""

from alembic import op

revision = "20260726_0002"
down_revision = "20260725_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # IF NOT EXISTS keeps this migration compatible with the project's original
    # metadata-driven initial migration on completely new databases.
    op.execute("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username VARCHAR(30)")
    op.execute(
        "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_public_id VARCHAR(500)"
    )
    op.execute(
        """
        UPDATE public.users
        SET username =
            CASE
                WHEN length(lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'))) >= 3
                    THEN left(lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')), 20)
                ELSE 'user'
            END
            || '_' || substr(replace(id::text, '-', ''), 1, 6)
        WHERE username IS NULL OR btrim(username) = ''
        """
    )
    op.execute("UPDATE public.users SET username = lower(username)")
    op.execute("ALTER TABLE public.users ALTER COLUMN username SET NOT NULL")
    op.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON public.users (username)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS public.ix_users_username")
    op.execute("ALTER TABLE public.users DROP COLUMN IF EXISTS avatar_public_id")
    op.execute("ALTER TABLE public.users DROP COLUMN IF EXISTS username")
