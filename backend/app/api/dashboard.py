from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models import Account, Transaction, Category

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def summary(db: AsyncSession = Depends(get_db_session), user=Depends(get_current_user)):
    # Current balance: sum of accounts
    bal_q = await db.execute(select(func.coalesce(func.sum(Account.balance), 0)).where(Account.user_id == user.id))
    balance = float(bal_q.scalar_one())

    # Monthly income/expense
    today = date.today()
    month_start = date(today.year, today.month, 1)
    income_q = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .where(Transaction.user_id == user.id, Transaction.type == "income", Transaction.date >= month_start)
    )
    expense_q = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .where(Transaction.user_id == user.id, Transaction.type == "expense", Transaction.date >= month_start)
    )
    income = float(income_q.scalar_one())
    expenses = float(expense_q.scalar_one())
    savings_rate = 0 if income == 0 else max(0, int((income - expenses) / income * 100))

    # Expense breakdown by category (top 6)
    breakdown_q = await db.execute(
        select(Category.name, func.coalesce(func.sum(Transaction.amount), 0))
        .join(Category, Category.id == Transaction.category_id)
        .where(Transaction.user_id == user.id, Transaction.type == "expense", Transaction.date >= month_start)
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(6)
    )
    breakdown = [{"category": n, "amount": float(a)} for (n, a) in breakdown_q.all()]

    return {
        "balance": balance,
        "income": income,
        "expenses": expenses,
        "savingsRate": savings_rate,
        "breakdown": breakdown,
    }

