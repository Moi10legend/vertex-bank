from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from decimal import Decimal
from pytz import timezone

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.account import Account

class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAW = "withdraw"
    TRANSFER = "transfer"

class Transaction(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)
    amount: Decimal = Field(default=None, max_digits=15, decimal_places=2)
    account_id: int = Field(foreign_key="account.id")
    transaction_type:  TransactionType
    description: str | None = Field(default=None, max_length=255)
    data: datetime = Field(default_factory=lambda: datetime.now(timezone("America/Recife")))
    account: "Account" = Relationship(back_populates="transactions")