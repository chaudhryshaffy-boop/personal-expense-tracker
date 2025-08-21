from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Category


DEFAULT_EXPENSE_CATEGORIES = [
    "Rent", "Groceries", "Dining", "Transport", "Utilities", "Entertainment", "Healthcare", "Education", "Shopping", "Travel",
]
DEFAULT_INCOME_CATEGORIES = [
    "Salary", "Bonus", "Investment", "Gift", "Other",
]


async def seed_default_categories(db: AsyncSession, user_id: int) -> None:
    rows: list[Category] = []
    for name in DEFAULT_EXPENSE_CATEGORIES:
        rows.append(Category(user_id=user_id, name=name, type="expense"))
    for name in DEFAULT_INCOME_CATEGORIES:
        rows.append(Category(user_id=user_id, name=name, type="income"))
    db.add_all(rows)
    await db.flush()

