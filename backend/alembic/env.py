import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config # <--- Import crucial para Async

from alembic import context

# --- SEUS IMPORTS ---
import os
import sys

# Adiciona o diretório pai ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.config import settings
from sqlmodel import SQLModel

# Importe seus modelos aqui para o Alembic detectá-los
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction
# --------------------

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.
    
    This configures the context with just a URL
    and not an Engine.
    """
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection):
    """
    Função auxiliar que roda as migrações de fato (sincronamente),
    mas será chamada de dentro do loop assíncrono.
    """
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    """Run migrations in 'online' mode. (Versão Async)"""
    
    # 1. Carrega a config do .ini
    configuration = config.get_section(config.config_ini_section) or {}
    
    # 2. Sobrescreve a URL com a nossa URL Async do settings
    configuration["sqlalchemy.url"] = settings.DATABASE_URL

    # 3. Cria a Engine Async
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    # 4. Conecta e roda as migrações
    async with connectable.connect() as connection:
        # O método run_sync permite rodar código síncrono (do Alembic) dentro do Async
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    # Roda o loop assíncrono
    asyncio.run(run_migrations_online())