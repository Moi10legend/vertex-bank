from sqlmodel import SQLModel
from datetime import datetime 
from decimal import Decimal
from app.models.transaction import TransactionType


class TransactionCreate(SQLModel):
    amount: Decimal
    transaction_type: TransactionType
    description: str | None = None

class TransactionPublic(TransactionCreate):
    id: int
    account_id: int
    data: datetime

class TransferCreate(SQLModel):
    target_account_number: str
    amount: Decimal
    description: str | None = None