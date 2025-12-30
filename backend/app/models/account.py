from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from decimal import Decimal
from pytz import timezone
from app.models.transaction import Transaction

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.user import User
    from app.models.transaction import Transaction

class Account(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    number: str | None = Field(unique=True, index=True, max_length=20)
    balance: Decimal = Field(default=0, max_digits=15, decimal_places=2)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone("America/Recife")))
    transactions: list[Transaction] = Relationship(back_populates="account" ,sa_relationship_kwargs={"cascade": "all, delete"})
    user: "User" = Relationship(back_populates="account")