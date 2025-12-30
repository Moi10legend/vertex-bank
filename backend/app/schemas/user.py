from sqlmodel import SQLModel

class UserBase(SQLModel):
    email: str
    full_name: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserPublic(UserBase):
    id: int