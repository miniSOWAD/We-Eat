from uuid import uuid4

from app.models.models import ExchangeRequest, Order, PointNotification
from app.services.transactions import point_notification, transaction_source


def test_point_notification_model_exists() -> None:
    assert PointNotification.__tablename__ == "point_notifications"
    assert hasattr(PointNotification, "seen_at")
    assert hasattr(PointNotification, "event_key")


def test_transaction_source_labels() -> None:
    order = Order(id=uuid4())
    exchange = ExchangeRequest(id=uuid4())
    assert transaction_source(order)[0] == "ORDER"
    assert transaction_source(exchange)[0] == "EXCHANGE"


def test_point_notification_factory() -> None:
    user_id = uuid4()
    source_id = uuid4()
    row = point_notification(
        user_id=user_id,
        point_kind="POSITIVE",
        message="Green point received",
        event_key=f"ORDER:{source_id}:POSITIVE:{user_id}",
        source_type="ORDER",
        source_id=source_id,
    )
    assert row.user_id == user_id
    assert row.point_kind == "POSITIVE"
    assert row.amount == 1
