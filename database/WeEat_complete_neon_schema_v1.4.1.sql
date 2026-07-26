-- ============================================================================
-- WE EAT — COMPLETE NEON POSTGRESQL SCHEMA
-- Backend compatibility target: We Eat backend v1.4.1
-- Alembic head: 20260726_0005
--
-- Source of truth used:
--   app/models/models.py
--   20260725_0001_initial.py
--   20260726_0002_usernames_avatars.py
--   20260726_0003_proposal_handoffs.py
--   20260726_0004_reputation_proposal_lifecycle.py
--   20260726_0005_point_notifications.py
--
-- Purpose:
--   Initialize a BRAND-NEW, EMPTY Neon PostgreSQL database so the current
--   backend can use it by changing DATABASE_URL only.
--
-- Important:
--   This creates the schema only. It does NOT copy users, listings, orders,
--   images, OTP records, reviews, reports, or any other existing data.
-- ============================================================================

BEGIN;

SET LOCAL search_path TO public;

-- Useful for direct administrative UUID generation with gen_random_uuid().
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Refuse to run over an existing or partially initialized We Eat schema.
DO $$
DECLARE
    conflicting_object TEXT;
BEGIN
    SELECT object_name
    INTO conflicting_object
    FROM (
        SELECT table_name AS object_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN (
              'users',
              'point_notifications',
              'otp_codes',
              'listings',
              'listing_images',
              'listing_private_details',
              'favorites',
              'comments',
              'orders',
              'exchange_requests',
              'reviews',
              'reports',
              'audit_logs',
              'alembic_version'
          )

        UNION ALL

        SELECT typname AS object_name
        FROM pg_type
        WHERE typnamespace = 'public'::regnamespace
          AND typname IN (
              'user_role',
              'user_status',
              'otp_purpose',
              'listing_type',
              'listing_status',
              'order_status',
              'fulfillment_method',
              'exchange_status',
              'report_target_type',
              'report_status'
          )
    ) AS conflicts
    LIMIT 1;

    IF conflicting_object IS NOT NULL THEN
        RAISE EXCEPTION
            'We Eat schema object "%" already exists. Run this script only in a new, empty database.',
            conflicting_object;
    END IF;
END
$$;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'USER',
    'MODERATOR',
    'ADMIN'
);

CREATE TYPE user_status AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'DELETED'
);

CREATE TYPE otp_purpose AS ENUM (
    'REGISTER',
    'RESET_PASSWORD'
);

CREATE TYPE listing_type AS ENUM (
    'FREE',
    'DISCOUNTED',
    'EXCHANGE'
);

CREATE TYPE listing_status AS ENUM (
    'ACTIVE',
    'RESERVED',
    'COMPLETED',
    'EXPIRED',
    'REMOVED'
);

CREATE TYPE order_status AS ENUM (
    'REQUESTED',
    'ACCEPTED',
    'REJECTED',
    'READY',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE fulfillment_method AS ENUM (
    'PICKUP',
    'DELIVERY'
);

CREATE TYPE exchange_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE report_target_type AS ENUM (
    'LISTING',
    'USER',
    'COMMENT'
);

CREATE TYPE report_status AS ENUM (
    'OPEN',
    'IN_REVIEW',
    'RESOLVED',
    'DISMISSED'
);

-- ============================================================================
-- TABLE: users
-- ============================================================================

CREATE TABLE users (
    id UUID NOT NULL,
    email VARCHAR(320) NOT NULL,
    username VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30),
    avatar_url VARCHAR(1000),
    avatar_public_id VARCHAR(500),
    bio VARCHAR(500),
    city VARCHAR(100),
    area VARCHAR(100),
    role user_role NOT NULL,
    status user_status NOT NULL,
    token_version INTEGER NOT NULL,
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    positive_points INTEGER DEFAULT 0 NOT NULL,
    negative_points INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_users_email
    ON users (email);

CREATE UNIQUE INDEX ix_users_username
    ON users (username);


-- ============================================================================
-- TABLE: point_notifications
-- ============================================================================

CREATE TABLE point_notifications (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    point_kind VARCHAR(16) NOT NULL,
    amount INTEGER DEFAULT 1 NOT NULL,
    message VARCHAR(220) NOT NULL,
    event_key VARCHAR(180) NOT NULL,
    source_type VARCHAR(40),
    source_id UUID,
    seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT point_notifications_pkey PRIMARY KEY (id),

    CONSTRAINT fk_point_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT ck_point_notification_kind
        CHECK (point_kind IN ('POSITIVE', 'NEGATIVE')),

    CONSTRAINT ck_point_notification_amount
        CHECK (amount > 0),

    CONSTRAINT uq_point_notification_event_key
        UNIQUE (event_key)
);

CREATE INDEX ix_point_notifications_user_id
    ON point_notifications (user_id);

CREATE INDEX ix_point_notifications_user_unseen
    ON point_notifications (user_id, seen_at, created_at);


-- ============================================================================
-- TABLE: otp_codes
-- ============================================================================

CREATE TABLE otp_codes (
    id UUID NOT NULL,
    email VARCHAR(320) NOT NULL,
    purpose otp_purpose NOT NULL,
    code_hash VARCHAR(64) NOT NULL,
    attempts INTEGER NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT otp_codes_pkey PRIMARY KEY (id)
);

CREATE INDEX ix_otp_email_purpose_created
    ON otp_codes (email, purpose, created_at);

-- ============================================================================
-- TABLE: listings
-- ============================================================================

CREATE TABLE listings (
    id UUID NOT NULL,
    owner_id UUID NOT NULL,
    listing_type listing_type NOT NULL,
    status listing_status NOT NULL,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(40) NOT NULL,
    original_price NUMERIC(12, 2),
    discounted_price NUMERIC(12, 2),
    exchange_for VARCHAR(300),
    prepared_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    is_vegetarian BOOLEAN NOT NULL,
    allergens VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT listings_pkey PRIMARY KEY (id),

    CONSTRAINT fk_listings_owner
        FOREIGN KEY (owner_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT ck_listing_quantity_positive
        CHECK (quantity > 0),

    CONSTRAINT ck_discounted_listing_price
        CHECK (
            listing_type <> 'DISCOUNTED'
            OR (
                discounted_price IS NOT NULL
                AND discounted_price >= 0
            )
        )
);

CREATE INDEX ix_listings_owner_id
    ON listings (owner_id);

CREATE INDEX ix_listings_listing_type
    ON listings (listing_type);

CREATE INDEX ix_listings_status
    ON listings (status);

CREATE INDEX ix_listings_category
    ON listings (category);

CREATE INDEX ix_listings_expires_at
    ON listings (expires_at);

CREATE INDEX ix_listings_city
    ON listings (city);

CREATE INDEX ix_listings_area
    ON listings (area);

CREATE INDEX ix_listings_browse
    ON listings (status, listing_type, city, created_at);

-- ============================================================================
-- TABLE: audit_logs
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID NOT NULL,
    actor_id UUID,
    action VARCHAR(120) NOT NULL,
    target_type VARCHAR(80) NOT NULL,
    target_id UUID,
    metadata_json JSON,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT audit_logs_pkey PRIMARY KEY (id),

    CONSTRAINT fk_audit_logs_actor
        FOREIGN KEY (actor_id)
        REFERENCES users (id)
        ON DELETE SET NULL
);

CREATE INDEX ix_audit_logs_actor_id
    ON audit_logs (actor_id);

CREATE INDEX ix_audit_logs_action
    ON audit_logs (action);

CREATE INDEX ix_audit_target
    ON audit_logs (target_type, target_id);

-- ============================================================================
-- TABLE: listing_images
-- ============================================================================

CREATE TABLE listing_images (
    id UUID NOT NULL,
    listing_id UUID NOT NULL,
    secure_url VARCHAR(1000) NOT NULL,
    public_id VARCHAR(500) NOT NULL,
    position INTEGER NOT NULL,

    CONSTRAINT listing_images_pkey PRIMARY KEY (id),

    CONSTRAINT fk_listing_images_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings (id)
        ON DELETE CASCADE,

    CONSTRAINT uq_listing_image_position
        UNIQUE (listing_id, position)
);

CREATE INDEX ix_listing_images_listing_id
    ON listing_images (listing_id);

-- ============================================================================
-- TABLE: listing_private_details
-- ============================================================================

CREATE TABLE listing_private_details (
    listing_id UUID NOT NULL,
    pickup_address VARCHAR(500) NOT NULL,
    contact_phone VARCHAR(30),
    delivery_notes VARCHAR(500),

    CONSTRAINT listing_private_details_pkey PRIMARY KEY (listing_id),

    CONSTRAINT fk_listing_private_details_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings (id)
        ON DELETE CASCADE
);

-- ============================================================================
-- TABLE: favorites
-- ============================================================================

CREATE TABLE favorites (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    listing_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT favorites_pkey PRIMARY KEY (id),

    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorites_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings (id)
        ON DELETE CASCADE,

    CONSTRAINT uq_favorite_user_listing
        UNIQUE (user_id, listing_id)
);

CREATE INDEX ix_favorites_user_id
    ON favorites (user_id);

CREATE INDEX ix_favorites_listing_id
    ON favorites (listing_id);

-- ============================================================================
-- TABLE: comments
-- ============================================================================

CREATE TABLE comments (
    id UUID NOT NULL,
    listing_id UUID NOT NULL,
    user_id UUID NOT NULL,
    parent_comment_id UUID,
    content VARCHAR(1200) NOT NULL,
    is_deleted BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT comments_pkey PRIMARY KEY (id),

    CONSTRAINT fk_comments_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_parent
        FOREIGN KEY (parent_comment_id)
        REFERENCES comments (id)
        ON DELETE CASCADE
);

CREATE INDEX ix_comments_listing_id
    ON comments (listing_id);

CREATE INDEX ix_comments_user_id
    ON comments (user_id);

CREATE INDEX ix_comments_parent_comment_id
    ON comments (parent_comment_id);

-- ============================================================================
-- TABLE: orders
-- ============================================================================

CREATE TABLE orders (
    id UUID NOT NULL,
    listing_id UUID NOT NULL,
    requester_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    status order_status NOT NULL,
    quantity INTEGER NOT NULL,
    agreed_price NUMERIC(12, 2) NOT NULL,
    fulfillment_method fulfillment_method NOT NULL,
    message VARCHAR(500),
    delivery_address VARCHAR(500),
    scheduled_for TIMESTAMPTZ,
    handoff_note VARCHAR(500),
    requester_confirmed_at TIMESTAMPTZ,
    provider_confirmed_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    points_awarded_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason VARCHAR(80),
    requester_notice_seen_at TIMESTAMPTZ,
    cancelled_by_id UUID,
    cancelled_at TIMESTAMPTZ,
    cancellation_note VARCHAR(800),
    cancellation_reviewed_at TIMESTAMPTZ,
    cancellation_marked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT orders_pkey PRIMARY KEY (id),

    CONSTRAINT fk_orders_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_orders_requester
        FOREIGN KEY (requester_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_orders_provider
        FOREIGN KEY (provider_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_orders_cancelled_by
        FOREIGN KEY (cancelled_by_id)
        REFERENCES users (id)
        ON DELETE SET NULL,

    CONSTRAINT ck_order_quantity_positive
        CHECK (quantity > 0)
);

CREATE INDEX ix_orders_listing_id
    ON orders (listing_id);

CREATE INDEX ix_orders_requester_id
    ON orders (requester_id);

CREATE INDEX ix_orders_provider_id
    ON orders (provider_id);

CREATE INDEX ix_orders_cancelled_by_id
    ON orders (cancelled_by_id);

CREATE INDEX ix_orders_provider_status
    ON orders (provider_id, status);

CREATE INDEX ix_orders_requester_status
    ON orders (requester_id, status);

-- Added by proposal-handoff migration.
CREATE INDEX ix_orders_listing_status
    ON orders (listing_id, status);

-- Added by reputation/proposal-lifecycle migration.
CREATE INDEX ix_orders_requester_notice
    ON orders (requester_id, status, requester_notice_seen_at);

-- ============================================================================
-- TABLE: exchange_requests
-- ============================================================================

CREATE TABLE exchange_requests (
    id UUID NOT NULL,
    listing_id UUID NOT NULL,
    offered_listing_id UUID,
    requester_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    status exchange_status NOT NULL,
    offered_description VARCHAR(500),
    message VARCHAR(500),
    fulfillment_method fulfillment_method,
    scheduled_for TIMESTAMPTZ,
    handoff_note VARCHAR(500),
    requester_confirmed_at TIMESTAMPTZ,
    provider_confirmed_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    points_awarded_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason VARCHAR(80),
    requester_notice_seen_at TIMESTAMPTZ,
    cancelled_by_id UUID,
    cancelled_at TIMESTAMPTZ,
    cancellation_note VARCHAR(800),
    cancellation_reviewed_at TIMESTAMPTZ,
    cancellation_marked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT exchange_requests_pkey PRIMARY KEY (id),

    CONSTRAINT fk_exchange_requests_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_exchange_requests_offered_listing
        FOREIGN KEY (offered_listing_id)
        REFERENCES listings (id)
        ON DELETE SET NULL,

    CONSTRAINT fk_exchange_requests_requester
        FOREIGN KEY (requester_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_exchange_requests_provider
        FOREIGN KEY (provider_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_exchange_requests_cancelled_by
        FOREIGN KEY (cancelled_by_id)
        REFERENCES users (id)
        ON DELETE SET NULL,

    CONSTRAINT ck_exchange_offer_present
        CHECK (
            offered_listing_id IS NOT NULL
            OR offered_description IS NOT NULL
        )
);

CREATE INDEX ix_exchange_requests_listing_id
    ON exchange_requests (listing_id);

CREATE INDEX ix_exchange_requests_offered_listing_id
    ON exchange_requests (offered_listing_id);

CREATE INDEX ix_exchange_requests_requester_id
    ON exchange_requests (requester_id);

CREATE INDEX ix_exchange_requests_provider_id
    ON exchange_requests (provider_id);

CREATE INDEX ix_exchange_requests_cancelled_by_id
    ON exchange_requests (cancelled_by_id);

CREATE INDEX ix_exchange_provider_status
    ON exchange_requests (provider_id, status);

CREATE INDEX ix_exchange_requester_status
    ON exchange_requests (requester_id, status);

-- Added by proposal-handoff migration.
CREATE INDEX ix_exchange_listing_status
    ON exchange_requests (listing_id, status);

-- Added by reputation/proposal-lifecycle migration.
CREATE INDEX ix_exchange_requester_notice
    ON exchange_requests (requester_id, status, requester_notice_seen_at);

-- ============================================================================
-- TABLE: reviews
-- ============================================================================

CREATE TABLE reviews (
    id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    reviewee_id UUID NOT NULL,
    order_id UUID,
    exchange_request_id UUID,
    rating INTEGER NOT NULL,
    comment VARCHAR(1000),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT reviews_pkey PRIMARY KEY (id),

    CONSTRAINT fk_reviews_reviewer
        FOREIGN KEY (reviewer_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_reviews_reviewee
        FOREIGN KEY (reviewee_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_reviews_order
        FOREIGN KEY (order_id)
        REFERENCES orders (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reviews_exchange_request
        FOREIGN KEY (exchange_request_id)
        REFERENCES exchange_requests (id)
        ON DELETE CASCADE,

    CONSTRAINT ck_review_rating
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT ck_review_one_transaction
        CHECK (
            (
                order_id IS NOT NULL
                AND exchange_request_id IS NULL
            )
            OR
            (
                order_id IS NULL
                AND exchange_request_id IS NOT NULL
            )
        ),

    CONSTRAINT uq_review_order_reviewer
        UNIQUE (reviewer_id, order_id),

    CONSTRAINT uq_review_exchange_reviewer
        UNIQUE (reviewer_id, exchange_request_id)
);

CREATE INDEX ix_reviews_reviewer_id
    ON reviews (reviewer_id);

CREATE INDEX ix_reviews_reviewee_id
    ON reviews (reviewee_id);

CREATE INDEX ix_reviews_order_id
    ON reviews (order_id);

CREATE INDEX ix_reviews_exchange_request_id
    ON reviews (exchange_request_id);

-- ============================================================================
-- TABLE: reports
-- ============================================================================

CREATE TABLE reports (
    id UUID NOT NULL,
    reporter_id UUID NOT NULL,
    target_type report_target_type NOT NULL,
    listing_id UUID,
    user_id UUID,
    comment_id UUID,
    reason VARCHAR(120) NOT NULL,
    details VARCHAR(1000),
    status report_status NOT NULL,
    resolution_note VARCHAR(1000),
    handled_by_id UUID,
    handled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT reports_pkey PRIMARY KEY (id),

    CONSTRAINT fk_reports_reporter
        FOREIGN KEY (reporter_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_reports_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reports_comment
        FOREIGN KEY (comment_id)
        REFERENCES comments (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reports_handled_by
        FOREIGN KEY (handled_by_id)
        REFERENCES users (id)
        ON DELETE SET NULL,

    CONSTRAINT ck_report_target
        CHECK (
            (
                target_type = 'LISTING'
                AND listing_id IS NOT NULL
                AND user_id IS NULL
                AND comment_id IS NULL
            )
            OR
            (
                target_type = 'USER'
                AND user_id IS NOT NULL
                AND listing_id IS NULL
                AND comment_id IS NULL
            )
            OR
            (
                target_type = 'COMMENT'
                AND comment_id IS NOT NULL
                AND listing_id IS NULL
                AND user_id IS NULL
            )
        )
);

CREATE INDEX ix_reports_reporter_id
    ON reports (reporter_id);

CREATE INDEX ix_reports_status_created
    ON reports (status, created_at);

-- ============================================================================
-- ALEMBIC VERSION MARKER
-- ============================================================================

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL,

    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

INSERT INTO alembic_version (version_num)
VALUES ('20260726_0005');

COMMIT;

-- ============================================================================
-- POST-INSTALL SUMMARY
-- Expected:
--   14 tables total (13 application tables + alembic_version)
--   10 enum types
--   Alembic head 20260726_0005
-- ============================================================================

SELECT
    COUNT(*) FILTER (
        WHERE table_name <> 'alembic_version'
    ) AS application_tables,
    COUNT(*) FILTER (
        WHERE table_name = 'alembic_version'
    ) AS alembic_tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'users',
      'point_notifications',
      'otp_codes',
      'listings',
      'listing_images',
      'listing_private_details',
      'favorites',
      'comments',
      'orders',
      'exchange_requests',
      'reviews',
      'reports',
      'audit_logs',
      'alembic_version'
  );

SELECT version_num
FROM alembic_version;
