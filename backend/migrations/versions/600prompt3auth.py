"""Prompt3 Objects Auth

Revision ID: 600prompt3auth
Revises: 500prompt2auth
Create Date: 2026-09-20 12:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '600prompt3auth'
down_revision: Union[str, None] = '500prompt2auth'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create departments table
    op.create_table('departments',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_departments_name'), 'departments', ['name'], unique=True)
    
    # Create audit_logs table
    op.create_table('audit_logs',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('actor_id', sa.Integer(), nullable=True),
    sa.Column('actor_role', sa.String(length=50), nullable=True),
    sa.Column('action', sa.String(length=255), nullable=False),
    sa.Column('entity_type', sa.String(length=255), nullable=False),
    sa.Column('entity_id', sa.Integer(), nullable=False),
    sa.Column('before_state', sa.JSON(), nullable=True),
    sa.Column('after_state', sa.JSON(), nullable=True),
    sa.Column('ip_address', sa.String(length=50), nullable=True),
    sa.Column('user_agent', sa.Text(), nullable=True),
    sa.Column('request_id', sa.String(length=255), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )

    op.add_column('users', sa.Column('department_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_users_department', 'users', 'departments', ['department_id'], ['id'])
    
    op.add_column('challenges', sa.Column('department_id', sa.Integer(), nullable=True))
    op.add_column('challenges', sa.Column('deadline', sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key('fk_challenges_department', 'challenges', 'departments', ['department_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_challenges_department', 'challenges', type_='foreignkey')
    op.drop_column('challenges', 'deadline')
    op.drop_column('challenges', 'department_id')
    
    op.drop_constraint('fk_users_department', 'users', type_='foreignkey')
    op.drop_column('users', 'department_id')
    
    op.drop_table('audit_logs')
    op.drop_index(op.f('ix_departments_name'), table_name='departments')
    op.drop_table('departments')
