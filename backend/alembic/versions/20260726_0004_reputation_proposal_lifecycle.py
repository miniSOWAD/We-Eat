"""add reputation points and resilient proposal lifecycle

Revision ID: 20260726_0004
Revises: 20260726_0003
Create Date: 2026-07-26
"""

from alembic import op

revision = "20260726_0004"
down_revision = "20260726_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS positive_points INTEGER NOT NULL DEFAULT 0"
    )
    op.execute(
        "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS negative_points INTEGER NOT NULL DEFAULT 0"
    )

    for table in ("orders", "exchange_requests"):
        op.execute(
            f"ALTER TABLE public.{table} ADD COLUMN IF NOT EXISTS points_awarded_at TIMESTAMPTZ"
        )
        op.execute(
            f"ALTER TABLE public.{table} ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ"
        )
        op.execute(
            f"ALTER TABLE public.{table} ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(80)"
        )
        op.execute(
            f"ALTER TABLE public.{table} ADD COLUMN IF NOT EXISTS requester_notice_seen_at TIMESTAMPTZ"
        )
        op.execute(
            f"ALTER TABLE public.{table} ADD COLUMN IF NOT EXISTS cancelled_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL"
        )
        op.execute(
            f"ALTER TABLE public.{table} ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ"
        )
        op.execute(
            f"ALTER TABLE public.{table} ADD COLUMN IF NOT EXISTS cancellation_note VARCHAR(800)"
        )
        op.execute(
            f"ALTER TABLE public.{table} ADD COLUMN IF NOT EXISTS cancellation_reviewed_at TIMESTAMPTZ"
        )
        op.execute(
            f"ALTER TABLE public.{table} ADD COLUMN IF NOT EXISTS cancellation_marked_at TIMESTAMPTZ"
        )

    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_orders_cancelled_by_id ON public.orders (cancelled_by_id)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_exchange_requests_cancelled_by_id ON public.exchange_requests (cancelled_by_id)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_orders_requester_notice ON public.orders (requester_id, status, requester_notice_seen_at)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_exchange_requester_notice ON public.exchange_requests (requester_id, status, requester_notice_seen_at)"
    )

    # Credit historical completed handovers once. The points_awarded_at marker
    # makes the standalone SQL safe to rerun without duplicating points.
    op.execute(
        """
        WITH point_rows AS (
            SELECT requester_id AS user_id FROM public.orders
            WHERE status = 'COMPLETED' AND points_awarded_at IS NULL
            UNION ALL
            SELECT provider_id AS user_id FROM public.orders
            WHERE status = 'COMPLETED' AND points_awarded_at IS NULL
            UNION ALL
            SELECT requester_id AS user_id FROM public.exchange_requests
            WHERE status = 'COMPLETED' AND points_awarded_at IS NULL
            UNION ALL
            SELECT provider_id AS user_id FROM public.exchange_requests
            WHERE status = 'COMPLETED' AND points_awarded_at IS NULL
        ), totals AS (
            SELECT user_id, COUNT(*)::INTEGER AS amount
            FROM point_rows
            GROUP BY user_id
        )
        UPDATE public.users AS users
        SET positive_points = users.positive_points + totals.amount
        FROM totals
        WHERE users.id = totals.user_id
        """
    )
    op.execute(
        """
        UPDATE public.orders
        SET points_awarded_at = COALESCE(completed_at, NOW())
        WHERE status = 'COMPLETED' AND points_awarded_at IS NULL
        """
    )
    op.execute(
        """
        UPDATE public.exchange_requests
        SET points_awarded_at = COALESCE(completed_at, NOW())
        WHERE status = 'COMPLETED' AND points_awarded_at IS NULL
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS public.ix_exchange_requester_notice")
    op.execute("DROP INDEX IF EXISTS public.ix_orders_requester_notice")
    op.execute("DROP INDEX IF EXISTS public.ix_exchange_requests_cancelled_by_id")
    op.execute("DROP INDEX IF EXISTS public.ix_orders_cancelled_by_id")

    for table in ("exchange_requests", "orders"):
        for column in (
            "cancellation_marked_at",
            "cancellation_reviewed_at",
            "cancellation_note",
            "cancelled_at",
            "cancelled_by_id",
            "requester_notice_seen_at",
            "rejection_reason",
            "rejected_at",
            "points_awarded_at",
        ):
            op.execute(f"ALTER TABLE public.{table} DROP COLUMN IF EXISTS {column}")

    op.execute("ALTER TABLE public.users DROP COLUMN IF EXISTS negative_points")
    op.execute("ALTER TABLE public.users DROP COLUMN IF EXISTS positive_points")
