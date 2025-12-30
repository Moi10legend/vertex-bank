# from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from pytz import timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.account import Account

# Base: Campos compartilhados (usado para leitura e criação)
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True, max_length=255)
    full_name: str = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)

# Tabela: O que vai pro Banco de Dados (inclui senha hasheada)
class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone("America/Recife")))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone("America/Recife")))

    account: "Account" = Relationship(
        back_populates="user", 
        sa_relationship_kwargs={"uselist": False}
    )
