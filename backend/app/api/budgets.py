from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models import Budget, Transaction

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("/")
async def list_budgets(db: AsyncSession = Depends(get_db_session), user=Depends(get_current_user)):
    res = await db.execute(select(Budget).where(Budget.user_id == user.id))
    return res.scalars().all()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_budget(payload: dict, db: AsyncSession = Depends(get_db_session), user=Depends(get_current_user)):
    try:
        b = Budget(
            user_id=user.id,
            category_id=int(payload["category_id"]),
            name=str(payload.get("name") or "Budget"),
            amount=float(payload["amount"]),
            period=str(payload.get("period") or "monthly"),
            alert_threshold=int(payload.get("alert_threshold") or 80),
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payload")
    db.add(b)
    await db.commit()
    await db.refresh(b)
    return b


@router.get("/{budget_id}/progress")
async def budget_progress(budget_id: int, db: AsyncSession = Depends(get_db_session), user=Depends(get_current_user)):
    res = await db.execute(select(Budget).where(Budget.id == budget_id, Budget.user_id == user.id))
    budget = res.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    # Compute spent this month for category
    today = date.today()
    month_start = date(today.year, today.month, 1)
    spent_q = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .where(
            Transaction.user_id == user.id,
            Transaction.type == "expense",
            Transaction.category_id == budget.category_id,
            Transaction.date >= month_start,
        )
    )
    spent = float(spent_q.scalar_one())
    percent = 0 if budget.amount == 0 else min(100, int(spent / float(budget.amount) * 100))
    return {
        "budget_id": budget.id,
        "spent": spent,
        "amount": float(budget.amount),
        "percent": percent,
        "threshold": budget.alert_threshold,
    }

