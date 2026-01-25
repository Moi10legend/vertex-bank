from sqlmodel import SQLModel, Relationship, Field
from datetime import datetime
import uuid

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.user import User

class ResetPassword(SQLModel, table=True,):
    __tablename__ = "reset_password"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    token: str = Field(index=True)
    expires_at: datetime
    used: bool = Field(default=False)
    # user: "User" = Relationship(back_populates="resetpassword")