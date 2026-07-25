# We Eat API map

Base path: `/api/v1`

## Authentication

| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/request-registration-otp` | Public |
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/request-password-reset` | Public |
| POST | `/auth/reset-password` | Public |
| POST | `/auth/change-password` | User |
| GET | `/auth/me` | User |

## Listings and uploads

| Method | Endpoint | Access |
|---|---|---|
| GET | `/listings` | Public |
| GET | `/listings/{id}` | Public |
| GET | `/listings/mine` | User |
| POST | `/listings/upload` | User |
| POST | `/listings` | User |
| PATCH | `/listings/{id}` | Owner/Admin |
| DELETE | `/listings/{id}` | Owner/Moderator/Admin |
| GET | `/listings/{id}/pickup-details` | Authorized transaction participant |

## Community interaction

- `GET/POST/DELETE /favorites`
- `GET/POST/PATCH/DELETE /listings/{listing_id}/comments`
- `GET /reviews/user/{user_id}`
- `GET /reviews/user/{user_id}/summary`
- `POST /reviews`

## Orders

- `GET /orders/mine`
- `POST /orders`
- `POST /orders/{id}/accept`
- `POST /orders/{id}/reject`
- `POST /orders/{id}/ready`
- `POST /orders/{id}/confirm-completion`
- `POST /orders/{id}/cancel`

## Exchanges

- `GET /exchanges/mine`
- `POST /exchanges`
- `POST /exchanges/{id}/accept`
- `POST /exchanges/{id}/reject`
- `POST /exchanges/{id}/confirm-completion`
- `POST /exchanges/{id}/cancel`

## Moderation and administration

- `POST /reports`
- `GET /reports/moderation`
- `PATCH /reports/{id}`
- `GET /admin/stats`
- `GET/PATCH /admin/users`
- `GET /admin/listings`
- `GET /admin/audit-logs`

FastAPI generates interactive OpenAPI documentation at `/docs` when `APP_ENV` is not `production`.
