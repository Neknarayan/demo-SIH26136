import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.startup import Startup

import os

# Use a test-specific PostgreSQL database to prevent overwriting local dev data
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL", 
    "postgresql+psycopg://postgres:8103465077@localhost:5432/sih26136_test"
)

engine = create_engine(
    TEST_DATABASE_URL,
    pool_pre_ping=True
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Seed baseline users
    officer = User(name="Officer Test", role="officer", email="officer@test.gov")
    evaluator = User(name="Evaluator Test", role="evaluator", email="eval@test.gov")
    startup_user1 = User(name="AquaSense User", role="startup", email="aqua@test.com")
    startup_user2 = User(name="Other Startup User", role="startup", email="other@test.com")
    session.add_all([officer, evaluator, startup_user1, startup_user2])
    session.commit()

    startup1 = Startup(
        user_id=startup_user1.id,
        name="AquaSense Technologies",
        sector="Water Technology",
        dpiit_status=True,
        profile_text="Water IoT telemetry."
    )
    startup2 = Startup(
        user_id=startup_user2.id,
        name="Other Technologies",
        sector="Agritech",
        dpiit_status=False,
        profile_text="Agri sensors."
    )
    session.add_all([startup1, startup2])
    session.commit()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
