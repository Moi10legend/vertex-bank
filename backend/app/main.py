from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import text
from app.core.db import engine
from app.core.config import settings         
from app.api.v1.api import api_router
from sqlmodel import select

# Lifespan events: Código que roda quando a API liga e desliga
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Tentando conectar ao Oracle Database 26ai...")
    try:
        from sqlalchemy.orm import sessionmaker
        from sqlmodel.ext.asyncio.session import AsyncSession
        
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            # Teste Async:
            statement = text("SELECT 'Conexão Async Sucesso!' FROM dual")
            result = await session.exec(statement)
            val = result.first()
            print(f"✅ Status do Banco: {val}")
    except Exception as e:
        print(f"❌ Erro ao conectar no banco: {e}")
    yield
    print("Desligando API...")

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# Isso permite que o Next.js (que roda na porta 3000) converse com o Python
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://vertex-bank-api.onrender.com",
    "https://vertex-bank-blue.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, PUT, DELETE...
    allow_headers=["*"], # Permite enviar Tokens e Cookies
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Sistema Bancário Operacional", "db_version": "Oracle 26ai"}