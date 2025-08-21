from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.security import create_token, hash_password, verify_password
from app.core.config import get_settings
from app.models import User, Account
from app.schemas.auth import LoginRequest, RefreshRequest, TokenPair
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead)
async def register_user(payload: UserCreate, db: AsyncSession = Depends(get_db_session)):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        currency=payload.currency or "USD",
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    await db.flush()
    # Create a default Cash account for the new user
    default_account = Account(user_id=user.id, name="Cash", type="cash", balance=0, currency=user.currency or "USD")
    db.add(default_account)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db_session)):
    res = await db.execute(select(User).where(User.email == payload.email))
    user = res.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    settings = get_settings()
    access = create_token(str(user.id), "access", settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh = create_token(str(user.id), "refresh", settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    return TokenPair(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenPair)
async def refresh_tokens(payload: RefreshRequest):
    from app.core.security import decode_token

    data = decode_token(payload.refresh_token)
    if not data or data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user_id = data.get("sub")
    settings = get_settings()
    access = create_token(str(user_id), "access", settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh = create_token(str(user_id), "refresh", settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    return TokenPair(access_token=access, refresh_token=refresh)

