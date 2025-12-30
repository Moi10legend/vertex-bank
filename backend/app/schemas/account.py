from decimal import Decimal
from sqlmodel import SQLModel

class AccountPublic(SQLModel):
    id: int
    number: str
    balance: Decimal