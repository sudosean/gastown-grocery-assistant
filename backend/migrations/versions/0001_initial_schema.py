"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-05-05
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "profiles",
        sa.Column("id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("full_name", sa.Text()),
        sa.Column("household_size", sa.SmallInteger(), server_default="2"),
        sa.Column("dietary_preferences", postgresql.ARRAY(sa.Text()), server_default="{}"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "meal_plans",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.Text()),
        sa.Column("week_start", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "meal_plan_days",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("meal_plan_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False),
        sa.Column("day_of_week", sa.SmallInteger(), nullable=False),
        sa.Column("meal_type", sa.String(), nullable=False),
        sa.Column("recipe_name", sa.Text(), nullable=False),
        sa.Column("servings", sa.SmallInteger(), server_default="2"),
        sa.Column("notes", sa.Text()),
    )

    op.create_table(
        "pantry_items",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("quantity", sa.Numeric(), nullable=False, server_default="1"),
        sa.Column("unit", sa.Text()),
        sa.Column("category", sa.Text()),
        sa.Column("expiry_date", sa.Date()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "grocery_lists",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("meal_plan_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("meal_plans.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.Text(), nullable=False, server_default="Shopping List"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "grocery_list_items",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("grocery_list_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("grocery_lists.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("quantity", sa.Numeric(), nullable=False, server_default="1"),
        sa.Column("unit", sa.Text()),
        sa.Column("category", sa.Text()),
        sa.Column("checked", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("notes", sa.Text()),
    )


def downgrade() -> None:
    op.drop_table("grocery_list_items")
    op.drop_table("grocery_lists")
    op.drop_table("pantry_items")
    op.drop_table("meal_plan_days")
    op.drop_table("meal_plans")
    op.drop_table("profiles")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
