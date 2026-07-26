"""add persistent point notifications

Revision ID: 20260726_0005
Revises: 20260726_0004
Create Date: 2026-07-26
"""

from alembic import op

revision = "20260726_0005"
down_revision = "20260726_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS public.point_notifications (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL
                REFERENCES public.users(id)
                ON DELETE CASCADE,
            point_kind VARCHAR(16) NOT NULL,
            amount INTEGER NOT NULL DEFAULT 1,
            message VARCHAR(220) NOT NULL,
            event_key VARCHAR(180) NOT NULL,
            source_type VARCHAR(40),
            source_id UUID,
            seen_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT ck_point_notification_kind
                CHECK (point_kind IN ('POSITIVE', 'NEGATIVE')),
            CONSTRAINT ck_point_notification_amount
                CHECK (amount > 0),
            CONSTRAINT uq_point_notification_event_key
                UNIQUE (event_key)
        )
        """
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_point_notifications_user_id "
        "ON public.point_notifications (user_id)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_point_notifications_user_unseen "
        "ON public.point_notifications (user_id, seen_at, created_at)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS public.ix_point_notifications_user_unseen")
    op.execute("DROP INDEX IF EXISTS public.ix_point_notifications_user_id")
    op.execute("DROP TABLE IF EXISTS public.point_notifications")
