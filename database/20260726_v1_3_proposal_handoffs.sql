BEGIN;

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS handoff_note VARCHAR(500);

ALTER TABLE public.exchange_requests
    ADD COLUMN IF NOT EXISTS fulfillment_method fulfillment_method;

ALTER TABLE public.exchange_requests
    ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

ALTER TABLE public.exchange_requests
    ADD COLUMN IF NOT EXISTS handoff_note VARCHAR(500);

CREATE INDEX IF NOT EXISTS ix_orders_listing_status
    ON public.orders (listing_id, status);

CREATE INDEX IF NOT EXISTS ix_exchange_listing_status
    ON public.exchange_requests (listing_id, status);

COMMIT;
