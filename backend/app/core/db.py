from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from typing import AsyncGenerator
import os

# --- BLOCO DE DEBUG (Adicione isso antes do engine) ---
print("--- INÍCIO DEBUG WALLET ---")
wallet_dir = settings.ORACLE_WALLET_DIR
print(f"📂 Diretório configurado: {wallet_dir}")

if os.path.exists(wallet_dir):
    print("✅ A pasta existe!")
    arquivos = os.listdir(wallet_dir)
    print(f"📄 Arquivos encontrados: {arquivos}")
    
    if "cwallet.sso" in arquivos:
        print("🎉 cwallet.sso (o certificado) está aqui!")
    else:
        print("😱 ERRO CRÍTICO: cwallet.sso NÃO está na pasta!")
else:
    print(f"❌ A pasta NÃO existe. Caminho atual: {os.getcwd()}")
print("--- FIM DEBUG WALLET ---")
# -----------------------------------------------------

# echo=True faz o log de todo SQL gerado no terminal (ótimo para estudar SQL para o TCU)
# Quando formos para produção, mudaremos para False.
engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=True, 
    future=True,
    connect_args={
        "config_dir": settings.ORACLE_WALLET_DIR, # Aponta para a pasta da wallet
        "wallet_location": settings.ORACLE_WALLET_DIR, # Reforça o local
        "wallet_password": settings.ORACLE_WALLET_PASSWORD,
        "ssl_server_dn_match": True # Importante para mTLS
    })

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