from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from typing import AsyncGenerator

# echo=True faz o log de todo SQL gerado no terminal (ótimo para estudar SQL para o TCU)
# Quando formos para produção, mudaremos para False.
engine = create_async_engine(settings.DATABASE_URL, echo=True, future=True)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Função geradora (Dependency Injection) para usar nas rotas do FastAPI.
    Abre uma sessão, entrega para o uso e fecha automaticamente depois.
    """
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session