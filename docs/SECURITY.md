# Security model

- JWT is stored only in a Next.js HTTP-only cookie.
- FastAPI re-reads the current user, status, role and token version from PostgreSQL on every authenticated request.
- Password changes, suspension and role changes revoke existing sessions by incrementing `token_version`.
- OTP codes are stored as hashes, expire, have attempt limits and have request-window limits.
- Exact pickup details live in `listing_private_details`, outside public listing responses.
- Delivery addresses are visible only through authenticated order endpoints used by the involved parties.
- Image uploads require authentication, content-type allowlisting, a size limit, image decoding verification and a user-specific Cloudinary folder.
- Favorites use PostgreSQL as the source of truth.
- Reviews require completed orders or exchanges and are unique per reviewer and transaction.
- Moderator and administrator changes are written to `audit_logs`.
- The Next.js catch-all proxy exposes only explicit route prefixes.

## Still required at infrastructure level

Application code is not a substitute for infrastructure controls. Configure a WAF or reverse-proxy rate limit, centralized logs, alerts, backups, secret rotation, dependency scanning and periodic security testing before a public launch.
