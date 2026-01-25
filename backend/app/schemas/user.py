from sqlmodel import SQLModel

class ForgotPasswordRequired(SQLModel):
    email: str

class ResetPasswordRequest(SQLModel):
    token: str
    new_password: str
    confirm_password: str

class UserBase(SQLModel):
    email: str
    full_name: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserPublic(UserBase):
    id: int