"""Add created_at to applications"""
from alembic import op
import sqlalchemy as sa
revision = "800addappref"
down_revision = "4054b10e0623"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("applications", sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))

def downgrade():
    op.drop_column("applications", "created_at")

