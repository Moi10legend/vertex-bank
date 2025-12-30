from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
import jwt
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_session
from app.core.config import settings
from app.models.user import User
from app.schemas.token import TokenPayload

# Isso diz ao Swagger que a rota de login fica em "/api/v1/login"
# O Swagger vai criar aquele botão de cadeado 🔒 baseado nisso.
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login"
)

async def get_current_user(
    token: Annotated[str, Depends(reusable_oauth2)],
    session: AsyncSession = Depends(get_session)
) -> User:
    """
    Decodifica o token, valida a assinatura e busca o usuário no banco.
    """
    try:
        # 1. Decodifica o JWT
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=["HS256"]
        )
        token_data = TokenPayload(**payload)
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não foi possível validar as credenciais",
        )
    
    # 2. Busca o usuário no banco pelo ID que estava no token (sub)
    # Lembre-se: token_data.sub é string, mas nosso ID é int, o Oracle lida bem, mas converter é bom
    query = select(User).where(User.id == int(token_data.sub))
    result = await session.exec(query)
    user = result.first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuário inativo")
        
    return user