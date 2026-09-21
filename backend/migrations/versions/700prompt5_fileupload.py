"""prompt5_fileupload

Revision ID: 700prompt5fileupload
Revises: 600prompt3auth
Create Date: 2024-01-01 00:00:03.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '700prompt5fileupload'
down_revision = '600prompt3auth'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add file_url to applications
    op.add_column('applications', sa.Column('file_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column('applications', 'file_url')
