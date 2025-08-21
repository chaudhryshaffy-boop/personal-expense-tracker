from __future__ import annotations

from datetime import date
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, asc, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.models import Transaction
from app.api.deps import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionRead

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=list[TransactionRead])
async def list_transactions(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
    start_date: date | None = None,
    end_date: date | None = None,
    category_id: int | None = None,
    type: Literal["income", "expense", "all"] = "all",
    account_id: int | None = None,
    q: str | None = None,
    sort: str = Query(default="date:desc"),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
):
    stmt = select(Transaction).where(Transaction.user_id == user.id)
    conditions = []
    if start_date:
        conditions.append(Transaction.date >= start_date)
    if end_date:
        conditions.append(Transaction.date <= end_date)
    if category_id:
        conditions.append(Transaction.category_id == category_id)
    if account_id:
        conditions.append(Transaction.account_id == account_id)
    if type in ("income", "expense"):
        conditions.append(Transaction.type == type)
    if q:
        conditions.append(Transaction.description.ilike(f"%{q}%"))
    if conditions:
        stmt = stmt.where(and_(*conditions))

    sort_field, _, sort_dir = sort.partition(":")
    order_col = getattr(Transaction, sort_field, Transaction.date)
    stmt = stmt.order_by(desc(order_col) if sort_dir == "desc" else asc(order_col))
    stmt = stmt.limit(limit).offset(offset)

    res = await db.execute(stmt)
    txs = res.scalars().all()
    return [
        TransactionRead(
            id=tx.id,
            date=tx.date,
            category_id=tx.category_id,
            type=tx.type,  # type: ignore[arg-type]
            amount=float(tx.amount),
            description=tx.description,
            account_id=tx.account_id,
            tags=(tx.tags.split(",") if tx.tags else None),
        )
        for tx in txs
    ]


@router.post("/", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
async def create_transaction(payload: TransactionCreate, db: AsyncSession = Depends(get_db_session), user=Depends(get_current_user)):
    tags = ",".join(payload.tags or [])
    tx = Transaction(
        date=payload.date,
        category_id=payload.category_id,
        type=payload.type,
        amount=payload.amount,
        description=payload.description,
        account_id=payload.account_id,
        tags=tags,
        user_id=user.id,
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return TransactionRead(
        id=tx.id,
        date=tx.date,
        category_id=tx.category_id,
        type=tx.type,  # type: ignore[arg-type]
        amount=float(tx.amount),
        description=tx.description,
        account_id=tx.account_id,
        tags=(tx.tags.split(",") if tx.tags else None),
    )


@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(tx_id: int, db: AsyncSession = Depends(get_db_session), user=Depends(get_current_user)):
    res = await db.execute(select(Transaction).where(Transaction.id == tx_id, Transaction.user_id == user.id))
    tx = res.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    await db.delete(tx)
    await db.commit()
    return None

