BEGIN;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS username VARCHAR(30);

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS avatar_public_id VARCHAR(500);

UPDATE public.users
SET username =
    CASE
        WHEN length(lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'))) >= 3
            THEN left(lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')), 20)
        ELSE 'user'
    END
    || '_' || substr(replace(id::text, '-', ''), 1, 6)
WHERE username IS NULL OR btrim(username) = '';

UPDATE public.users SET username = lower(username);

ALTER TABLE public.users
    ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username
    ON public.users (username);

COMMIT;

-- Verify:
SELECT id, email, username, role, status, avatar_url
FROM public.users
ORDER BY created_at DESC;
