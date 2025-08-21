from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class TransactionBase(BaseModel):
    date: date
    category_id: int | None = None
    type: Literal["income", "expense"]
    amount: float = Field(gt=0)
    description: str | None = None
    account_id: int
    tags: list[str] | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionRead(TransactionBase):
    id: int

    model_config = {
        "from_attributes": True
    }

