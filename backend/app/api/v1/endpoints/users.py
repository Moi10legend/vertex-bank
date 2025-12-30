from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import  select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.db import get_session
from app.models.user import User
from app.models.account import Account
from app.schemas.user import UserCreate, UserPublic
from app.core.security import get_password_hash
from app.api import deps
from app.schemas.account import AccountPublic

router = APIRouter()

@router.post("/", response_model=UserPublic)
async def create_user(user_in: UserCreate, session: AsyncSession = Depends(get_session)):
    try:
        query = select(User).where(User.email == user_in.email)
        result = await session.exec(query)
        existing_user = result.first()

        if existing_user:
            raise HTTPException(status_code=400, detail="Este email já está cadastrado.")
    
        user_db = User.model_validate(
            user_in, 
            update={"hashed_password": get_password_hash(user_in.password)}
        )

        session.add(user_db) 
        await session.commit()
        await session.refresh(user_db)

        return user_db
    except Exception as e:
        await session.rollback()

        if isinstance(e, HTTPException):
            raise e
        
        print(f"Erro ao criar usuário: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao criar usuário.")

@router.get("/me", response_model=UserPublic)
async def read_account(current_user: User = Depends(deps.get_current_user)):
    return current_user

@router.get("/account", response_model=AccountPublic)
async def get_account(current_user: User = Depends(deps.get_current_user), session: AsyncSession = Depends(get_session)):
    query = select(Account).where(current_user.id == Account.user_id)
    result = await session.exec(query)
    return result.first()

    