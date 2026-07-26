-- We Eat v1.4.1 — persistent point notifications
-- Run once after the v1.4.0 migration. Safe to rerun.

BEGIN;

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
);

CREATE INDEX IF NOT EXISTS ix_point_notifications_user_id
    ON public.point_notifications (user_id);

CREATE INDEX IF NOT EXISTS ix_point_notifications_user_unseen
    ON public.point_notifications (user_id, seen_at, created_at);

COMMIT;
