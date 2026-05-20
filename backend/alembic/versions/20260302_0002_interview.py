"""add interview tables

Revision ID: 20260302_0002
Revises: 20260302_0001
Create Date: 2026-03-02

"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "20260302_0002"
down_revision = "20260302_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "interview_sessions",
    sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
    sa.Column("user_id", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    sa.Column("target_role", sa.String(length=120), nullable=False),
    sa.Column("mode", sa.String(length=16), nullable=False, server_default="text"),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
  )
  op.create_index("ix_interview_sessions_user_id", "interview_sessions", ["user_id"])

  op.create_table(
    "interview_qas",
    sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
    sa.Column(
      "session_id",
      sa.Uuid(as_uuid=True),
      sa.ForeignKey("interview_sessions.id", ondelete="CASCADE"),
      nullable=False,
    ),
    sa.Column("question", sa.Text(), nullable=False),
    sa.Column("answer", sa.Text(), nullable=True),
    sa.Column("feedback_json", sa.Text(), nullable=True),
    sa.Column("score", sa.Float(), nullable=True),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
  )
  op.create_index("ix_interview_qas_session_id", "interview_qas", ["session_id"])


def downgrade() -> None:
  op.drop_index("ix_interview_qas_session_id", table_name="interview_qas")
  op.drop_table("interview_qas")
  op.drop_index("ix_interview_sessions_user_id", table_name="interview_sessions")
  op.drop_table("interview_sessions")

