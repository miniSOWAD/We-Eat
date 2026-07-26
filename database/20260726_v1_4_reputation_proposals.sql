BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS positive_points INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS negative_points INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS points_awarded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(80),
  ADD COLUMN IF NOT EXISTS requester_notice_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_note VARCHAR(800),
  ADD COLUMN IF NOT EXISTS cancellation_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_marked_at TIMESTAMPTZ;

ALTER TABLE public.exchange_requests
  ADD COLUMN IF NOT EXISTS points_awarded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(80),
  ADD COLUMN IF NOT EXISTS requester_notice_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_note VARCHAR(800),
  ADD COLUMN IF NOT EXISTS cancellation_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_marked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS ix_orders_cancelled_by_id
  ON public.orders (cancelled_by_id);
CREATE INDEX IF NOT EXISTS ix_exchange_requests_cancelled_by_id
  ON public.exchange_requests (cancelled_by_id);
CREATE INDEX IF NOT EXISTS ix_orders_requester_notice
  ON public.orders (requester_id, status, requester_notice_seen_at);
CREATE INDEX IF NOT EXISTS ix_exchange_requester_notice
  ON public.exchange_requests (requester_id, status, requester_notice_seen_at);

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
WHERE users.id = totals.user_id;

UPDATE public.orders
SET points_awarded_at = COALESCE(completed_at, NOW())
WHERE status = 'COMPLETED' AND points_awarded_at IS NULL;

UPDATE public.exchange_requests
SET points_awarded_at = COALESCE(completed_at, NOW())
WHERE status = 'COMPLETED' AND points_awarded_at IS NULL;

COMMIT;
