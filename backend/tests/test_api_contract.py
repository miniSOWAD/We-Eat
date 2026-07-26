from app.main import app


REQUIRED_OPERATIONS = {
    ("post", "/api/v1/auth/request-registration-otp"),
    ("post", "/api/v1/auth/verify-otp"),
    ("post", "/api/v1/auth/register"),
    ("post", "/api/v1/auth/login"),
    ("get", "/api/v1/auth/me"),
    ("get", "/api/v1/listings"),
    ("post", "/api/v1/listings"),
    ("post", "/api/v1/listings/upload"),
    ("get", "/api/v1/listings/mine"),
    ("get", "/api/v1/favorites"),
    ("post", "/api/v1/orders"),
    ("get", "/api/v1/orders/mine"),
    ("post", "/api/v1/exchanges"),
    ("get", "/api/v1/exchanges/mine"),
    ("get", "/api/v1/proposals/listing/{listing_id}"),
    ("get", "/api/v1/proposals/active"),
    ("get", "/api/v1/proposals/mine"),
    ("post", "/api/v1/proposals/{kind}/{proposal_id}/review-cancellation"),
    ("post", "/api/v1/proposals/{kind}/{proposal_id}/dismiss"),
    ("post", "/api/v1/listings/{listing_id}/remove"),
    ("post", "/api/v1/orders/{order_id}/received"),
    ("post", "/api/v1/orders/{order_id}/delivered"),
    ("post", "/api/v1/exchanges/{exchange_id}/received"),
    ("post", "/api/v1/exchanges/{exchange_id}/delivered"),
    ("post", "/api/v1/reviews"),
    ("post", "/api/v1/reports"),
    ("get", "/api/v1/reports/moderation"),
    ("get", "/api/v1/admin/stats"),
    ("get", "/api/v1/admin/users"),
    ("get", "/api/v1/admin/moderators"),
    ("post", "/api/v1/admin/users/{user_id}/make-moderator"),
    ("post", "/api/v1/admin/users/{user_id}/revoke-moderator"),
    ("post", "/api/v1/admin/users/{user_id}/suspend"),
    ("post", "/api/v1/admin/users/{user_id}/unsuspend"),
    ("post", "/api/v1/users/avatar"),
    ("get", "/api/v1/system/ready"),
}


def test_frontend_required_operations_exist() -> None:
    document = app.openapi()
    operations = {
        (method.lower(), path)
        for path, path_item in document["paths"].items()
        for method in path_item
        if method.lower() in {"get", "post", "patch", "delete", "put"}
    }
    missing = REQUIRED_OPERATIONS - operations
    assert not missing, f"Missing API operations: {sorted(missing)}"
