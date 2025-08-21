from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import get_settings
from app.api import auth as auth_router
from app.api import transactions as transactions_router
from app.api import accounts as accounts_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(o) for o in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Rate limiting (optional per-route in future)
    limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT])
    app.state.limiter = limiter

    app.include_router(auth_router.router)
    app.include_router(transactions_router.router)
    app.include_router(accounts_router.router)

    @app.get("/healthz")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()

