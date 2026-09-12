"""
Repeatable seed script for SIH 26136 Demo MVP.
Populates standard demonstration personas and realistic baseline challenges.

Also exports set_demo_passwords() which can be called standalone to assign
the default password 'demo123' (bcrypt-hashed) to all existing users.
"""
from app.database import SessionLocal
from app.models.user import User
from app.models.startup import Startup
from app.models.challenge import Challenge
from app.auth import hash_password

DEFAULT_DEMO_PASSWORD = "demo123"


def set_demo_passwords(db=None):
    """
    Assign the default hashed password 'demo123' to every user in the DB
    that currently has no hashed_password set.
    
    Safe to run multiple times — skips users who already have a password.
    Can also be used to forcibly re-set all passwords (pass force=True via
    the standalone __main__ block below).
    """
    _close = db is None
    if db is None:
        db = SessionLocal()

    try:
        hashed = hash_password(DEFAULT_DEMO_PASSWORD)
        users_without_pw = db.query(User).filter(User.hashed_password.is_(None)).all()
        
        if not users_without_pw:
            print("All users already have passwords set. Nothing to update.")
            return

        for u in users_without_pw:
            u.hashed_password = hashed

        db.commit()
        print(f"Set password '{DEFAULT_DEMO_PASSWORD}' for {len(users_without_pw)} user(s):")
        for u in users_without_pw:
            print(f"  [{u.role}] {u.name} <{u.email}>")
    except Exception as e:
        db.rollback()
        print(f"Error setting demo passwords: {e}")
        raise
    finally:
        if _close:
            db.close()


def seed_database():
    db = SessionLocal()
    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("Database already contains user records. Skipping seed or refreshing...")
            # Still ensure all users have passwords set
            set_demo_passwords(db)
            return

        print("Seeding demo users...")
        hashed_pw = hash_password(DEFAULT_DEMO_PASSWORD)

        # 1. Officer
        officer = User(
            name="Priya Sharma",
            role="officer",
            email="priya.sharma@urban.gov.in",
            hashed_password=hashed_pw,
        )
        # 2. Evaluator
        evaluator = User(
            name="Rahul Verma",
            role="evaluator",
            email="rahul.verma@techboard.gov.in",
            hashed_password=hashed_pw,
        )
        # 3. Startups
        user_startup1 = User(
            name="AquaSense Technologies",
            role="startup",
            email="contact@aquasense.io",
            hashed_password=hashed_pw,
        )
        user_startup2 = User(
            name="JalTrack Innovations",
            role="startup",
            email="founder@jaltrack.in",
            hashed_password=hashed_pw,
        )
        user_startup3 = User(
            name="HydroVision Labs",
            role="startup",
            email="hello@hydrovision.tech",
            hashed_password=hashed_pw,
        )
        user_startup4 = User(
            name="EcoUrban Systems",
            role="startup",
            email="team@ecourban.org",
            hashed_password=hashed_pw,
        )

        db.add_all([officer, evaluator, user_startup1, user_startup2, user_startup3, user_startup4])
        db.commit()

        # Seed Startups (profile rows)
        startup1 = Startup(
            user_id=user_startup1.id,
            name="AquaSense Technologies",
            sector="Water Technology",
            dpiit_status=True,
            profile_text="AI & IoT acoustic telemetry sensors for municipal water loss reduction and non-revenue water minimization."
        )
        startup2 = Startup(
            user_id=user_startup2.id,
            name="JalTrack Innovations",
            sector="Water Technology",
            dpiit_status=True,
            profile_text="Smart ultrasonic clamp-on flow meters with solar cellular gateways for district metered area (DMA) telemetry."
        )
        startup3 = Startup(
            user_id=user_startup3.id,
            name="HydroVision Labs",
            sector="CleanTech",
            dpiit_status=False,
            profile_text="Autonomous surface inspection cameras and computer vision models analyzing canal turbidity and open-channel flow."
        )
        startup4 = Startup(
            user_id=user_startup4.id,
            name="EcoUrban Systems",
            sector="Urban Infrastructure",
            dpiit_status=True,
            profile_text="Decentralized greywater filtration units with automated membrane cleaning and cloud-monitored water quality sensors."
        )

        db.add_all([startup1, startup2, startup3, startup4])
        db.commit()

        # Seed Challenges
        challenge1 = Challenge(
            officer_id=officer.id,
            title="Smart Water Monitoring for Municipal Water Networks",
            description="Deploy automated IoT sensor telemetry to detect non-revenue water loss, monitor pipeline pressure transients, and pinpoint leak locations across urban distribution grids.",
            outcomes="Reduce unaccounted distribution losses by at least 15%, maintain telemetry sensor uptime >95%, and cut burst response latency to <2 hours.",
            constraints="Seamless integration with existing municipal SCADA protocols, IP68 submersible sensor enclosure, minimum 3-year battery life.",
            budget_band="₹25L - ₹50L",
            required_sector="Water Technology",
            dpiit_required=True,
            status="published"
        )

        challenge2 = Challenge(
            officer_id=officer.id,
            title="Automated Road Distress and Pothole Mapping",
            description="Edge-AI computer vision system mounted on municipal transport vehicles to automatically classify road surface degradations and generate geo-tagged maintenance alerts.",
            outcomes="100% weekly automated coverage of high-density arterial roads with road condition index (RCI) heatmaps.",
            constraints="Edge computation without requiring continuous 4G/5G video streaming, sub-meter GPS accuracy, night-time operability.",
            budget_band="₹10L - ₹25L",
            required_sector="Urban Infrastructure",
            dpiit_required=False,
            status="draft"
        )

        db.add_all([challenge1, challenge2])
        db.commit()

        print("Seeding completed successfully!")
        print("Seeded:")
        print(" - 1 Officer  (Priya Sharma)              password: demo123")
        print(" - 1 Evaluator (Rahul Verma)              password: demo123")
        print(" - 4 Startups (AquaSense, JalTrack, HydroVision, EcoUrban)  password: demo123")
        print(" - 2 Challenges (Smart Water Monitoring, Road Distress Mapping)")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    if "--set-passwords" in sys.argv:
        print("Running password migration: assigning 'demo123' to all users without a password...")
        set_demo_passwords()
    else:
        seed_database()
