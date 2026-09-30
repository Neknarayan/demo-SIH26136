"""
seed.py — Development seed data for ProcureBridge (SIH 26136)

Usage (from backend/ with venv activated):
    python seed.py

Creates demo accounts:
  Startup   : contact@aquasense.io   / demo123
  Officer   : priya.nair@gov.in      / demo123
  Evaluator : rahul.verma@gov.in     / demo123
"""

import os
import sys

# Ensure we can import app modules
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import *  # noqa: F403  # registers all models with Base
from app.models.user import User
from app.models.startup import Startup
from app.models.department import Department
from app.auth import hash_password


def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        if db.query(User).count() > 0:
            print("✅ Database already seeded. Skipping.")
            return

        print("🌱 Seeding database...")

        # ── Department ────────────────────────────────────────────────────────
        dept = Department(name="Water Resources Department", code="WRD")
        db.add(dept)
        db.flush()

        # ── Officer ───────────────────────────────────────────────────────────
        officer = User(
            name="Priya Nair",
            email="priya.nair@gov.in",
            hashed_password=hash_password("demo123"),
            role="officer",
            department_id=dept.id,
        )
        db.add(officer)

        # ── Evaluator ─────────────────────────────────────────────────────────
        evaluator = User(
            name="Rahul Verma",
            email="rahul.verma@gov.in",
            hashed_password=hash_password("demo123"),
            role="evaluator",
        )
        db.add(evaluator)

        # ── Startup user ──────────────────────────────────────────────────────
        startup_user = User(
            name="AquaSense Team",
            email="contact@aquasense.io",
            hashed_password=hash_password("demo123"),
            role="startup",
        )
        db.add(startup_user)
        db.flush()

        startup = Startup(
            user_id=startup_user.id,
            name="AquaSense Technologies",
            sector="Water Technology",
            dpiit_status=True,
            profile_text=(
                "AquaSense deploys low-cost IoT sensors to detect pipeline leakage "
                "and monitor water quality across urban distribution networks."
            ),
            msme_reg_no="MSME-MH-2024-00123",
            women_led=False,
            make_in_india_class="class_1",
        )
        db.add(startup)

        db.commit()
        print("✅ Seed complete!")
        print()
        print("  Demo accounts:")
        print("  ┌────────────┬───────────────────────────────┬──────────┐")
        print("  │ Role       │ Email                         │ Password │")
        print("  ├────────────┼───────────────────────────────┼──────────┤")
        print("  │ Startup    │ contact@aquasense.io          │ demo123  │")
        print("  │ Officer    │ priya.nair@gov.in             │ demo123  │")
        print("  │ Evaluator  │ rahul.verma@gov.in            │ demo123  │")
        print("  └────────────┴───────────────────────────────┴──────────┘")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
