"""initial We Eat schema

Revision ID: 20260725_0001
Revises:
Create Date: 2026-07-25
"""

from alembic import op

from app.db.base import Base
from app.models import models  # noqa: F401

revision = "20260725_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind(), checkfirst=True)


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind(), checkfirst=True)
