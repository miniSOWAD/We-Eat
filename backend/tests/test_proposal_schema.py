from datetime import UTC, datetime, timedelta

import pytest
from pydantic import ValidationError

from app.schemas.transactions import HandoffDecision


def test_handoff_requires_future_timezone_aware_time() -> None:
    with pytest.raises(ValidationError):
        HandoffDecision(
            fulfillment_method="PICKUP",
            scheduled_for=datetime.now(UTC) - timedelta(minutes=1),
        )


def test_handoff_accepts_future_time() -> None:
    decision = HandoffDecision(
        fulfillment_method="DELIVERY",
        scheduled_for=datetime.now(UTC) + timedelta(hours=1),
        handoff_note="Call before arrival",
    )
    assert decision.fulfillment_method.value == "DELIVERY"
