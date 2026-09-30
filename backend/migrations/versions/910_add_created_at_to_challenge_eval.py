"""Add created_at to challenge and evaluation"""
from alembic import op
import sqlalchemy as sa

revision = "910createdat"
down_revision = "900milestonefin"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('challenges', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column('evaluations', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))

def downgrade():
    op.drop_column('evaluations', 'created_at')
    op.drop_column('challenges', 'created_at')
