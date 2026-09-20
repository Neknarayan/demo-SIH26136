from typing import Literal, List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
import logging

class Settings(BaseSettings):
    APP_NAME: str = "SIH 26136 Challenge-to-Pilot Lifecycle Platform"
    APP_ENV: Literal["development", "test", "demo", "production"] = "development"
    DEMO_MODE: bool = False

    DATABASE_URL: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Email domain validation for government registration
    GOV_EMAIL_DOMAINS: str = "gov.in,nic.in"
    ALLOW_OPEN_GOV_REGISTRATION: bool = False

    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode='after')
    def validate_production_settings(self):
        if self.APP_ENV in ("demo", "production"):
            if not self.JWT_SECRET_KEY or len(self.JWT_SECRET_KEY) < 32 or self.JWT_SECRET_KEY == "changeme-use-a-strong-random-secret-in-production":
                raise ValueError("JWT_SECRET_KEY must be a strong secret of at least 32 characters in demo/production.")
            if "*" in self.CORS_ORIGINS:
                raise ValueError("CORS_ORIGINS cannot contain '*' in demo/production.")
            if self.APP_ENV == "production" and self.DEMO_MODE:
                raise ValueError("DEMO_MODE cannot be true in production.")
        return self

settings = Settings()
