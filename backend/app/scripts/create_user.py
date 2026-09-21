"""
CLI script to create admin, evaluator, or officer accounts.
This is for administrative use only, not public registration.

Usage:
    python -m app.scripts.create_user --email admin@gov.in --name "Admin User" --role admin --password securepassword
    python -m app.scripts.create_user --email evaluator@gov.in --name "Evaluator User" --role evaluator --password securepassword
    python -m app.scripts.create_user --email officer@gov.in --name "Officer User" --role officer --password securepassword
"""
import argparse
import sys
from pathlib import Path

# Add the parent directory to sys.path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.models.user import User
from app.auth import hash_password


def create_user(email: str, name: str, role: str, password: str):
    """Create a user with the specified role."""
    db = SessionLocal()

    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"Error: User with email {email} already exists.")
            return False

        # Validate role
        valid_roles = ["admin", "officer", "evaluator", "startup"]
        if role not in valid_roles:
            print(f"Error: Invalid role '{role}'. Valid roles: {', '.join(valid_roles)}")
            return False

        # Create user
        from datetime import datetime, timezone
        user = User(
            name=name.strip(),
            email=email.strip().lower(),
            role=role,
            hashed_password=hash_password(password),
            status="active",
            created_at=datetime.now(timezone.utc),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"Successfully created {role} account:")
        print(f"  Email: {user.email}")
        print(f"  Name: {user.name}")
        print(f"  Role: {user.role}")
        print(f"  ID: {user.id}")
        return True

    except Exception as e:
        print(f"Error creating user: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Create admin, evaluator, or officer accounts")
    parser.add_argument("--email", required=True, help="User email address")
    parser.add_argument("--name", required=True, help="User full name")
    parser.add_argument("--role", required=True, help="User role (admin, officer, evaluator, startup)")
    parser.add_argument("--password", required=True, help="User password (min 8 chars, max 72 chars)")

    args = parser.parse_args()

    # Validate password length
    if len(args.password) < 8:
        print("Error: Password must be at least 8 characters.")
        sys.exit(1)
    if len(args.password) > 72:
        print("Error: Password must not exceed 72 characters.")
        sys.exit(1)

    success = create_user(args.email, args.name, args.role, args.password)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
