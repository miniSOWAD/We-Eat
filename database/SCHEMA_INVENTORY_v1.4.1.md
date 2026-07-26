# We Eat database schema inventory — v1.4.1

This package matches the current backend and Alembic head `20260726_0005`.

## Database objects

- 13 application tables
- 1 Alembic migration table
- 10 PostgreSQL enum types
- Persistent green/red point notifications
- All proposal, cancellation, reputation, avatar, OTP, moderation, review, and audit fields
- All foreign keys, unique constraints, check constraints, and application indexes

## New in v1.4.1

`point_notifications` stores unseen green/red point messages for the affected user.  
It is required by the global “Green point received” and “Red point received” note.

## Migration chain

```text
20260725_0001
→ 20260726_0002
→ 20260726_0003
→ 20260726_0004
→ 20260726_0005
```

For an existing v1.4.0 database, run `20260726_v1_4_1_point_notifications.sql` or deploy with `alembic upgrade head`.

For a brand-new empty database, run `WeEat_complete_neon_schema_v1.4.1.sql`, then verify it with `WeEat_verify_neon_schema_v1.4.1.sql`.
