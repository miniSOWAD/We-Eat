-- ============================================================================
-- WE EAT v1.4.1 SCHEMA VERIFICATION
-- Run after the complete schema script.
-- An empty "missing_*" result means that section is complete.
-- ============================================================================

-- 1. Missing tables
WITH expected(table_name) AS (
    VALUES
        ('users'),
        ('point_notifications'),
        ('otp_codes'),
        ('listings'),
        ('listing_images'),
        ('listing_private_details'),
        ('favorites'),
        ('comments'),
        ('orders'),
        ('exchange_requests'),
        ('reviews'),
        ('reports'),
        ('audit_logs'),
        ('alembic_version')
)
SELECT expected.table_name AS missing_table
FROM expected
LEFT JOIN information_schema.tables actual
    ON actual.table_schema = 'public'
   AND actual.table_name = expected.table_name
WHERE actual.table_name IS NULL
ORDER BY expected.table_name;

-- 2. Missing enum types
WITH expected(type_name) AS (
    VALUES
        ('user_role'),
        ('user_status'),
        ('otp_purpose'),
        ('listing_type'),
        ('listing_status'),
        ('order_status'),
        ('fulfillment_method'),
        ('exchange_status'),
        ('report_target_type'),
        ('report_status')
)
SELECT expected.type_name AS missing_enum
FROM expected
LEFT JOIN pg_type actual
    ON actual.typnamespace = 'public'::regnamespace
   AND actual.typname = expected.type_name
WHERE actual.oid IS NULL
ORDER BY expected.type_name;

-- 3. Missing columns
WITH expected(table_name, column_name) AS (
    VALUES
        ('users', 'id'),
        ('users', 'email'),
        ('users', 'username'),
        ('users', 'password_hash'),
        ('users', 'display_name'),
        ('users', 'phone'),
        ('users', 'avatar_url'),
        ('users', 'avatar_public_id'),
        ('users', 'bio'),
        ('users', 'city'),
        ('users', 'area'),
        ('users', 'role'),
        ('users', 'status'),
        ('users', 'token_version'),
        ('users', 'email_verified_at'),
        ('users', 'last_login_at'),
        ('users', 'positive_points'),
        ('users', 'negative_points'),
        ('users', 'created_at'),
        ('users', 'updated_at'),

        ('point_notifications', 'id'),
        ('point_notifications', 'user_id'),
        ('point_notifications', 'point_kind'),
        ('point_notifications', 'amount'),
        ('point_notifications', 'message'),
        ('point_notifications', 'event_key'),
        ('point_notifications', 'source_type'),
        ('point_notifications', 'source_id'),
        ('point_notifications', 'seen_at'),
        ('point_notifications', 'created_at'),

        ('otp_codes', 'id'),
        ('otp_codes', 'email'),
        ('otp_codes', 'purpose'),
        ('otp_codes', 'code_hash'),
        ('otp_codes', 'attempts'),
        ('otp_codes', 'expires_at'),
        ('otp_codes', 'consumed_at'),
        ('otp_codes', 'created_at'),

        ('listings', 'id'),
        ('listings', 'owner_id'),
        ('listings', 'listing_type'),
        ('listings', 'status'),
        ('listings', 'title'),
        ('listings', 'description'),
        ('listings', 'category'),
        ('listings', 'quantity'),
        ('listings', 'unit'),
        ('listings', 'original_price'),
        ('listings', 'discounted_price'),
        ('listings', 'exchange_for'),
        ('listings', 'prepared_at'),
        ('listings', 'expires_at'),
        ('listings', 'city'),
        ('listings', 'area'),
        ('listings', 'is_vegetarian'),
        ('listings', 'allergens'),
        ('listings', 'created_at'),
        ('listings', 'updated_at'),

        ('listing_images', 'id'),
        ('listing_images', 'listing_id'),
        ('listing_images', 'secure_url'),
        ('listing_images', 'public_id'),
        ('listing_images', 'position'),

        ('listing_private_details', 'listing_id'),
        ('listing_private_details', 'pickup_address'),
        ('listing_private_details', 'contact_phone'),
        ('listing_private_details', 'delivery_notes'),

        ('favorites', 'id'),
        ('favorites', 'user_id'),
        ('favorites', 'listing_id'),
        ('favorites', 'created_at'),

        ('comments', 'id'),
        ('comments', 'listing_id'),
        ('comments', 'user_id'),
        ('comments', 'parent_comment_id'),
        ('comments', 'content'),
        ('comments', 'is_deleted'),
        ('comments', 'created_at'),
        ('comments', 'updated_at'),

        ('orders', 'id'),
        ('orders', 'listing_id'),
        ('orders', 'requester_id'),
        ('orders', 'provider_id'),
        ('orders', 'status'),
        ('orders', 'quantity'),
        ('orders', 'agreed_price'),
        ('orders', 'fulfillment_method'),
        ('orders', 'message'),
        ('orders', 'delivery_address'),
        ('orders', 'scheduled_for'),
        ('orders', 'handoff_note'),
        ('orders', 'requester_confirmed_at'),
        ('orders', 'provider_confirmed_at'),
        ('orders', 'accepted_at'),
        ('orders', 'completed_at'),
        ('orders', 'points_awarded_at'),
        ('orders', 'rejected_at'),
        ('orders', 'rejection_reason'),
        ('orders', 'requester_notice_seen_at'),
        ('orders', 'cancelled_by_id'),
        ('orders', 'cancelled_at'),
        ('orders', 'cancellation_note'),
        ('orders', 'cancellation_reviewed_at'),
        ('orders', 'cancellation_marked_at'),
        ('orders', 'created_at'),
        ('orders', 'updated_at'),

        ('exchange_requests', 'id'),
        ('exchange_requests', 'listing_id'),
        ('exchange_requests', 'offered_listing_id'),
        ('exchange_requests', 'requester_id'),
        ('exchange_requests', 'provider_id'),
        ('exchange_requests', 'status'),
        ('exchange_requests', 'offered_description'),
        ('exchange_requests', 'message'),
        ('exchange_requests', 'fulfillment_method'),
        ('exchange_requests', 'scheduled_for'),
        ('exchange_requests', 'handoff_note'),
        ('exchange_requests', 'requester_confirmed_at'),
        ('exchange_requests', 'provider_confirmed_at'),
        ('exchange_requests', 'accepted_at'),
        ('exchange_requests', 'completed_at'),
        ('exchange_requests', 'points_awarded_at'),
        ('exchange_requests', 'rejected_at'),
        ('exchange_requests', 'rejection_reason'),
        ('exchange_requests', 'requester_notice_seen_at'),
        ('exchange_requests', 'cancelled_by_id'),
        ('exchange_requests', 'cancelled_at'),
        ('exchange_requests', 'cancellation_note'),
        ('exchange_requests', 'cancellation_reviewed_at'),
        ('exchange_requests', 'cancellation_marked_at'),
        ('exchange_requests', 'created_at'),
        ('exchange_requests', 'updated_at'),

        ('reviews', 'id'),
        ('reviews', 'reviewer_id'),
        ('reviews', 'reviewee_id'),
        ('reviews', 'order_id'),
        ('reviews', 'exchange_request_id'),
        ('reviews', 'rating'),
        ('reviews', 'comment'),
        ('reviews', 'created_at'),
        ('reviews', 'updated_at'),

        ('reports', 'id'),
        ('reports', 'reporter_id'),
        ('reports', 'target_type'),
        ('reports', 'listing_id'),
        ('reports', 'user_id'),
        ('reports', 'comment_id'),
        ('reports', 'reason'),
        ('reports', 'details'),
        ('reports', 'status'),
        ('reports', 'resolution_note'),
        ('reports', 'handled_by_id'),
        ('reports', 'handled_at'),
        ('reports', 'created_at'),
        ('reports', 'updated_at'),

        ('audit_logs', 'id'),
        ('audit_logs', 'actor_id'),
        ('audit_logs', 'action'),
        ('audit_logs', 'target_type'),
        ('audit_logs', 'target_id'),
        ('audit_logs', 'metadata_json'),
        ('audit_logs', 'created_at'),

        ('alembic_version', 'version_num')
)
SELECT
    expected.table_name,
    expected.column_name AS missing_column
FROM expected
LEFT JOIN information_schema.columns actual
    ON actual.table_schema = 'public'
   AND actual.table_name = expected.table_name
   AND actual.column_name = expected.column_name
WHERE actual.column_name IS NULL
ORDER BY expected.table_name, expected.column_name;

-- 4. Missing required indexes
WITH expected(index_name) AS (
    VALUES
        ('ix_users_email'),
        ('ix_users_username'),
        ('ix_point_notifications_user_id'),
        ('ix_point_notifications_user_unseen'),
        ('ix_otp_email_purpose_created'),
        ('ix_listings_owner_id'),
        ('ix_listings_listing_type'),
        ('ix_listings_status'),
        ('ix_listings_category'),
        ('ix_listings_expires_at'),
        ('ix_listings_city'),
        ('ix_listings_area'),
        ('ix_listings_browse'),
        ('ix_audit_logs_actor_id'),
        ('ix_audit_logs_action'),
        ('ix_audit_target'),
        ('ix_listing_images_listing_id'),
        ('ix_favorites_user_id'),
        ('ix_favorites_listing_id'),
        ('ix_comments_listing_id'),
        ('ix_comments_user_id'),
        ('ix_comments_parent_comment_id'),
        ('ix_orders_listing_id'),
        ('ix_orders_requester_id'),
        ('ix_orders_provider_id'),
        ('ix_orders_cancelled_by_id'),
        ('ix_orders_provider_status'),
        ('ix_orders_requester_status'),
        ('ix_orders_listing_status'),
        ('ix_orders_requester_notice'),
        ('ix_exchange_requests_listing_id'),
        ('ix_exchange_requests_offered_listing_id'),
        ('ix_exchange_requests_requester_id'),
        ('ix_exchange_requests_provider_id'),
        ('ix_exchange_requests_cancelled_by_id'),
        ('ix_exchange_provider_status'),
        ('ix_exchange_requester_status'),
        ('ix_exchange_listing_status'),
        ('ix_exchange_requester_notice'),
        ('ix_reviews_reviewer_id'),
        ('ix_reviews_reviewee_id'),
        ('ix_reviews_order_id'),
        ('ix_reviews_exchange_request_id'),
        ('ix_reports_reporter_id'),
        ('ix_reports_status_created')
)
SELECT expected.index_name AS missing_index
FROM expected
LEFT JOIN pg_indexes actual
    ON actual.schemaname = 'public'
   AND actual.indexname = expected.index_name
WHERE actual.indexname IS NULL
ORDER BY expected.index_name;

-- 5. Alembic head
SELECT
    version_num,
    CASE
        WHEN version_num = '20260726_0005' THEN 'OK'
        ELSE 'WRONG HEAD'
    END AS status
FROM alembic_version;

-- 6. Compact inventory
SELECT
    table_name,
    COUNT(*) AS column_count
FROM information_schema.columns
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
GROUP BY table_name
ORDER BY table_name;
