from app.database import Base, engine
# Import all models to ensure they are registered
from app.models.user import User
from app.models.startup import Startup
from app.models.department import Department
from app.models.challenge import Challenge
from app.models.application import Application
from app.models.pilot import Pilot
from app.models.kpi import KPI
from app.models.evidence import Evidence
from app.models.decision import Decision

print("Creating all tables via SQLAlchemy...")
Base.metadata.create_all(bind=engine)
print("Done.")
