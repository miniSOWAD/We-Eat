from pathlib import Path

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.models.models import ExchangeRequest, Order, PointNotification, User
from app.schemas.transactions import CancellationReviewRequest
from app.schemas.users import UserPublic
from app.services.transactions import cleaned_cancellation_note


def test_reputation_columns_exist() -> None:
    assert hasattr(User, "positive_points")
    assert hasattr(User, "negative_points")
    assert PointNotification.__tablename__ == "point_notifications"


def test_transaction_notice_columns_exist() -> None:
    for model in (Order, ExchangeRequest):
        for name in (
            "points_awarded_at",
            "rejection_reason",
            "requester_notice_seen_at",
            "cancelled_by_id",
            "cancellation_note",
            "cancellation_reviewed_at",
            "cancellation_marked_at",
        ):
            assert hasattr(model, name)


def test_public_user_exposes_only_point_totals() -> None:
    assert "positive_points" in UserPublic.model_fields
    assert "negative_points" in UserPublic.model_fields
    assert "password_hash" not in UserPublic.model_fields


def test_cancellation_review_actions_are_restricted() -> None:
    assert CancellationReviewRequest(action="MARK").action == "MARK"
    assert CancellationReviewRequest(action="OK").action == "OK"
    with pytest.raises(ValidationError):
        CancellationReviewRequest(action="PUNISH")


def test_accepted_cancellation_requires_a_meaningful_note() -> None:
    with pytest.raises(HTTPException):
        cleaned_cancellation_note("short", required=True)
    assert cleaned_cancellation_note("Plans changed unexpectedly", required=True) == "Plans changed unexpectedly"


def test_accept_routes_do_not_auto_reject_competing_proposals() -> None:
    root = Path(__file__).resolve().parents[1]
    order_source = (root / "app/api/routes/orders.py").read_text(encoding="utf-8")
    exchange_source = (root / "app/api/routes/exchanges.py").read_text(encoding="utf-8")
    order_accept = order_source.split('@router.post("/{order_id}/accept"', 1)[1].split('@router.post("/{order_id}/reject"', 1)[0]
    exchange_accept = exchange_source.split('@router.post("/{exchange_id}/accept"', 1)[1].split('@router.post("/{exchange_id}/reject"', 1)[0]
    assert "reject_competing" not in order_accept
    assert "reject_competing" not in exchange_accept
