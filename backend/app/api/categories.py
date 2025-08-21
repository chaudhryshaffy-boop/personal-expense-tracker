from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models import Category

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/")
async def list_categories(db: AsyncSession = Depends(get_db_session), user=Depends(get_current_user)):
    res = await db.execute(select(Category).where(Category.user_id == user.id))
    return res.scalars().all()

