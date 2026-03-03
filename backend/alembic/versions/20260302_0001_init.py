"""init schema

Revision ID: 20260302_0001
Revises: 
Create Date: 2026-03-02

"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "20260302_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "users",
    sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
    sa.Column("email", sa.String(length=320), nullable=False),
    sa.Column("hashed_password", sa.String(length=255), nullable=False),
    sa.Column("full_name", sa.String(length=200), nullable=True),
    sa.Column("role", sa.Enum("student", "admin", name="user_role"), nullable=False),
    sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    sa.Column("target_role", sa.String(length=120), nullable=True),
    sa.Column("xp", sa.Integer(), nullable=False, server_default="0"),
    sa.Column("streak_days", sa.Integer(), nullable=False, server_default="0"),
    sa.Column("last_activity_at", sa.DateTime(timezone=True), nullable=True),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    sa.UniqueConstraint("email", name="uq_users_email"),
  )
  op.create_index("ix_users_email", "users", ["email"])

  op.create_table(
    "resumes",
    sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
    sa.Column("user_id", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    sa.Column("filename", sa.String(length=260), nullable=False),
    sa.Column("content_type", sa.String(length=120), nullable=True),
    sa.Column("extracted_text", sa.Text(), nullable=False, server_default=""),
    sa.Column("ats_score", sa.Float(), nullable=True),
    sa.Column("industry_compatibility", sa.Float(), nullable=True),
    sa.Column("suggestions_json", sa.Text(), nullable=True),
    sa.Column("skills_json", sa.Text(), nullable=True),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
  )
  op.create_index("ix_resumes_user_id", "resumes", ["user_id"])

  op.create_table(
    "xp_events",
    sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
    sa.Column("user_id", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    sa.Column("kind", sa.String(length=64), nullable=False),
    sa.Column("points", sa.Integer(), nullable=False, server_default="0"),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
  )
  op.create_index("ix_xp_events_user_id", "xp_events", ["user_id"])

  op.create_table(
    "badges",
    sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
    sa.Column("code", sa.String(length=64), nullable=False),
    sa.Column("name", sa.String(length=120), nullable=False),
    sa.Column("description", sa.String(length=280), nullable=False),
    sa.UniqueConstraint("code", name="uq_badges_code"),
  )

  op.create_table(
    "user_badges",
    sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
    sa.Column("user_id", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    sa.Column("badge_id", sa.Uuid(as_uuid=True), sa.ForeignKey("badges.id", ondelete="CASCADE"), nullable=False),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    sa.UniqueConstraint("user_id", "badge_id", name="uq_user_badges_user_badge"),
  )
  op.create_index("ix_user_badges_user_id", "user_badges", ["user_id"])
  op.create_index("ix_user_badges_badge_id", "user_badges", ["badge_id"])


def downgrade() -> None:
  op.drop_index("ix_user_badges_badge_id", table_name="user_badges")
  op.drop_index("ix_user_badges_user_id", table_name="user_badges")
  op.drop_table("user_badges")
  op.drop_table("badges")
  op.drop_index("ix_xp_events_user_id", table_name="xp_events")
  op.drop_table("xp_events")
  op.drop_index("ix_resumes_user_id", table_name="resumes")
  op.drop_table("resumes")
  op.drop_index("ix_users_email", table_name="users")
  op.drop_table("users")
  op.execute("DROP TYPE IF EXISTS user_role")

