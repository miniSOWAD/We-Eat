# We Eat API Endpoint Map v1.1.0

Base URL locally: `http://127.0.0.1:8000/api/v1`

## System

| Method | Path | Access |
|---|---|---|
| GET | `/system/health` | Public |
| GET | `/system/ready` | Public |

Root-level aliases are also available at `/health` and `/ready`.

## Authentication

| Method | Path | Access |
|---|---|---|
| POST | `/auth/request-registration-otp` | Public |
| POST | `/auth/verify-otp` | Public |
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/logout` | Public; frontend clears cookie |
| POST | `/auth/request-password-reset` | Public |
| POST | `/auth/reset-password` | Public |
| POST | `/auth/change-password` | User |
| GET | `/auth/me` | User |

## Users

| Method | Path | Access |
|---|---|---|
| GET | `/users/profile` | User |
| PATCH | `/users/profile` | User |
| GET | `/users/{user_id}` | Public |

## Listings

| Method | Path | Access |
|---|---|---|
| GET | `/listings` | Public |
| GET | `/listings/mine` | User |
| POST | `/listings/upload` | User |
| POST | `/listings` | User |
| GET | `/listings/{listing_id}` | Public/optional user |
| PATCH | `/listings/{listing_id}` | Owner/Admin |
| DELETE | `/listings/{listing_id}` | Owner/Moderator/Admin |
| GET | `/listings/{listing_id}/pickup-details` | Authorized transaction party |

## Favorites

| Method | Path | Access |
|---|---|---|
| GET | `/favorites` | User |
| POST | `/favorites/{listing_id}` | User |
| DELETE | `/favorites/{listing_id}` | User |

## Comments

| Method | Path | Access |
|---|---|---|
| GET | `/listings/{listing_id}/comments` | Public |
| POST | `/listings/{listing_id}/comments` | User |
| PATCH | `/listings/{listing_id}/comments/{comment_id}` | Author |
| DELETE | `/listings/{listing_id}/comments/{comment_id}` | Author/Moderator/Admin |

## Orders

|Method| Path                                    | Access            |
|------|-----------------------------------------|-------------------|
| GET  | `/orders/mine`                          | User              |
| POST | `/orders`                               | User              |
| POST | `/orders/{order_id}/accept`             | Provider          |
| POST | `/orders/{order_id}/reject`             | Provider          |
| POST | `/orders/{order_id}/ready`              | Provider          |
| POST | `/orders/{order_id}/confirm-completion` | Transaction party |
| POST | `/orders/{order_id}/cancel`             | Transaction party |

## Exchanges

| Method | Path | Access |
|---|---|---|
| GET | `/exchanges/mine` | User |
| POST | `/exchanges` | User |
| POST | `/exchanges/{exchange_id}/accept` | Provider |
| POST | `/exchanges/{exchange_id}/reject` | Provider |
| POST | `/exchanges/{exchange_id}/confirm-completion` | Transaction party |
| POST | `/exchanges/{exchange_id}/cancel` | Transaction party |

## Reviews

| Method | Path | Access |
|---|---|---|
| GET | `/reviews/user/{user_id}` | Public |
| GET | `/reviews/user/{user_id}/summary` | Public |
| POST | `/reviews` | Completed transaction party |

## Reports and moderation

| Method | Path | Access |
|---|---|---|
| POST | `/reports` | User |
| GET | `/reports/moderation` | Moderator/Admin |
| PATCH | `/reports/{report_id}` | Moderator/Admin |

## Administration

| Method | Path | Access |
|---|---|---|
| GET | `/admin/stats` | Admin |
| GET | `/admin/users` | Admin |
| PATCH | `/admin/users/{user_id}` | Admin |
| GET | `/admin/listings` | Admin |
| GET | `/admin/audit-logs` | Admin |
