from __future__ import annotations

from functools import lru_cache
from typing import List, Optional

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    # App
    APP_NAME: str = "Personal Finance API"
    ENV: str = Field(default="development")
    DEBUG: bool = Field(default=True)

    # Security
    SECRET_KEY: str = Field(default="change-this-secret")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24 * 14)

    # Database
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./app.db")

    # CORS
    CORS_ORIGINS: List[AnyHttpUrl] | List[str] = Field(default_factory=lambda: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ])

    # Rate limiting (SlowAPI format e.g. "5/minute;100/day")
    RATE_LIMIT: str = Field(default="60/minute")

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        return self.DATABASE_URL

    @property
    def SYNC_DATABASE_URL(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("sqlite+aiosqlite"):
            return url.replace("sqlite+aiosqlite", "sqlite")
        if url.startswith("postgresql+asyncpg"):
            # Use psycopg sync driver for alembic
            return url.replace("postgresql+asyncpg", "postgresql+psycopg")
        return url


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

