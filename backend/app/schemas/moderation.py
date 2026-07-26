from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.models import ReportStatus, ReportTargetType
from app.schemas.common import ORMModel


class ReportCreate(BaseModel):
    target_type: ReportTargetType
    target_id: UUID
    reason: str = Field(min_length=3, max_length=120)
    details: str | None = Field(default=None, max_length=1000)


class ReportUpdate(BaseModel):
    status: ReportStatus
    resolution_note: str | None = Field(default=None, max_length=1000)


class ReportView(ORMModel):
    id: UUID
    reporter_id: UUID
    target_type: ReportTargetType
    listing_id: UUID | None = None
    user_id: UUID | None = None
    comment_id: UUID | None = None
    reason: str
    details: str | None = None
    status: ReportStatus
    resolution_note: str | None = None
    handled_by_id: UUID | None = None
    handled_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class AuditLogView(ORMModel):
    id: UUID
    actor_id: UUID | None = None
    action: str
    target_type: str
    target_id: UUID | None = None
    metadata_json: dict[str, Any] | None = None
    created_at: datetime


class AdminStats(BaseModel):
    users: int
    moderators: int
    suspended_users: int
    active_listings: int
    open_reports: int
    completed_orders: int
    completed_exchanges: int
    rescued_items: int


class EmailDeliveryStatus(BaseModel):
    mode: str
    configured: bool
    sender: str
    smtp_host: str | None = None
    missing_settings: list[str] = Field(default_factory=list)


class CloudinaryDeliveryStatus(BaseModel):
    configured: bool
    cloud_name: str | None = None
    configuration_source: str


class IntegrationStatus(BaseModel):
    email: EmailDeliveryStatus
    cloudinary: CloudinaryDeliveryStatus
