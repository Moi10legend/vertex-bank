from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_session
from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.schemas.token import Token

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: AsyncSession = Depends(get_session)
):
    # 1. Busca o usuário pelo email (form_data.username no OAuth2 = email)
    query = select(User).where(User.email == form_data.username)
    result = await session.exec(query)
    user = result.first()

    # 2. Verifica se usuário existe e se a senha bate
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuário inativo")

    # 3. Gera o token com o tempo definido no config
    # Usamos o ID do usuário como 'sub' (subject) do token
    return Token(
        access_token=create_access_token(subject=user.id),
        token_type="bearer"
    )