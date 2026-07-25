from datetime import UTC, datetime, timedelta

import pytest
from pydantic import ValidationError

from app.schemas.listings import ListingCreate


BASE = {
    "title": "Fresh cooked meal",
    "description": "Prepared today and stored safely for collection.",
    "category": "Cooked meal",
    "quantity": 2,
    "unit": "portions",
    "expires_at": datetime.now(UTC) + timedelta(hours=4),
    "city": "Dhaka",
    "area": "Dhanmondi",
    "images": [{"secure_url": "https://example.test/a.jpg", "public_id": "x", "position": 0}],
    "private_details": {"pickup_address": "Private pickup location"},
}


def test_discounted_requires_price() -> None:
    with pytest.raises(ValidationError):
        ListingCreate(listing_type="DISCOUNTED", **BASE)


def test_exchange_requires_requested_item() -> None:
    with pytest.raises(ValidationError):
        ListingCreate(listing_type="EXCHANGE", **BASE)


def test_free_listing_is_valid() -> None:
    listing = ListingCreate(listing_type="FREE", **BASE)
    assert listing.quantity == 2


def test_private_details_support_orm_objects() -> None:
    from app.schemas.listings import ListingPrivateView

    class PrivateDetails:
        pickup_address = "Road 12, Dhanmondi"
        contact_phone = "+8801700000000"
        delivery_notes = "Call after arrival"

    view = ListingPrivateView.model_validate(PrivateDetails())
    assert view.pickup_address == "Road 12, Dhanmondi"
