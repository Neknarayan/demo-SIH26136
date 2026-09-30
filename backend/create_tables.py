from app.database import Base, engine
# Import all models to ensure they are registered

print("Creating all tables via SQLAlchemy...")
Base.metadata.create_all(bind=engine)
print("Done.")
