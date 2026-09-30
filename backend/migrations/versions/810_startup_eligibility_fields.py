"""Add startup eligibility fields"""
from alembic import op
import sqlalchemy as sa
revision = "810startupelib"
down_revision = "800addappref"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("startups", sa.Column("msme_reg_no", sa.String(length=30), nullable=True))
    op.add_column("startups", sa.Column("women_led", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("startups", sa.Column("make_in_india_class", sa.String(length=20), nullable=True))

def downgrade():
    op.drop_column("startups", "make_in_india_class")
    op.drop_column("startups", "women_led")
    op.drop_column("startups", "msme_reg_no")

