from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from app.schemas.common import ORMModel


class PointNotificationView(ORMModel):
    id: UUID
    point_kind: Literal["POSITIVE", "NEGATIVE"]
    amount: int
    message: str
    created_at: datetime
