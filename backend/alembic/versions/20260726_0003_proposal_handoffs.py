"""add proposal scheduling and handoff confirmation fields

Revision ID: 20260726_0003
Revises: 20260726_0002
Create Date: 2026-07-26
"""

from alembic import op

revision = "20260726_0003"
down_revision = "20260726_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ"
    )
    op.execute(
        "ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS handoff_note VARCHAR(500)"
    )
    op.execute(
        "ALTER TABLE public.exchange_requests ADD COLUMN IF NOT EXISTS fulfillment_method fulfillment_method"
    )
    op.execute(
        "ALTER TABLE public.exchange_requests ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ"
    )
    op.execute(
        "ALTER TABLE public.exchange_requests ADD COLUMN IF NOT EXISTS handoff_note VARCHAR(500)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_orders_listing_status ON public.orders (listing_id, status)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_exchange_listing_status ON public.exchange_requests (listing_id, status)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS public.ix_exchange_listing_status")
    op.execute("DROP INDEX IF EXISTS public.ix_orders_listing_status")
    op.execute(
        "ALTER TABLE public.exchange_requests DROP COLUMN IF EXISTS handoff_note"
    )
    op.execute(
        "ALTER TABLE public.exchange_requests DROP COLUMN IF EXISTS scheduled_for"
    )
    op.execute(
        "ALTER TABLE public.exchange_requests DROP COLUMN IF EXISTS fulfillment_method"
    )
    op.execute("ALTER TABLE public.orders DROP COLUMN IF EXISTS handoff_note")
    op.execute("ALTER TABLE public.orders DROP COLUMN IF EXISTS scheduled_for")
