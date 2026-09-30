"""Add milestone financial tracking"""
from alembic import op
import sqlalchemy as sa
revision = "900milestonefin"
down_revision = "810startupelib"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("pilots", sa.Column("total_budget", sa.Numeric(precision=15, scale=2), nullable=True))
    op.create_table("milestones",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("pilot_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("percentage_of_budget", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("released_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("release_notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["pilot_id"], ["pilots.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_milestones_id"), "milestones", ["id"], unique=False)

    op.create_table("invoices",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("milestone_id", sa.Integer(), nullable=False),
        sa.Column("startup_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("file_url", sa.String(length=500), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["milestone_id"], ["milestones.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["startup_id"], ["startups.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_invoices_id"), "invoices", ["id"], unique=False)

def downgrade():
    op.drop_index(op.f("ix_invoices_id"), table_name="invoices")
    op.drop_table("invoices")
    op.drop_index(op.f("ix_milestones_id"), table_name="milestones")
    op.drop_table("milestones")
    op.drop_column("pilots", "total_budget")

