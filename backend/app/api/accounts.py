from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models import Account

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/")
async def list_accounts(db: AsyncSession = Depends(get_db_session), user=Depends(get_current_user)):
    res = await db.execute(select(Account).where(Account.user_id == user.id))
    return res.scalars().all()

