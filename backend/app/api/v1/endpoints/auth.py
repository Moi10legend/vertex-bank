from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
import secrets
from datetime import datetime, timedelta, timezone
from app.core.config import settings

from app.core.db import get_session
from app.core.security import create_access_token, verify_password, get_password_hash
from app.models.user import User
from app.models.reset_password import ResetPassword
from app.schemas.token import Token
from app.schemas.user import ForgotPasswordRequired, ResetPasswordRequest

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

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

@router.post("/forgot-password", status_code=202)
async def forgot_password(payload: ForgotPasswordRequired, session: AsyncSession = Depends(get_session)):
    query = select(User).where(User.email == payload.email)
    result = await session.exec(query)
    user = result.first()

    if not user:
        return {"message": "Se o e-mail existir, um link de recuperação será enviado"}
    
    token_str = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(minutes=15)

    reset_entry = ResetPassword(
        user_id=user.id,
        token=token_str,
        expires_at=expires,
        used=False
    )

    conf = ConnectionConfig(
        MAIL_USERNAME = settings.MAIL_USERNAME,
        MAIL_PASSWORD = settings.MAIL_PASSWORD, # Não é a senha de login, crie uma App Password no Google
        MAIL_FROM = settings.MAIL_FROM,
        MAIL_PORT = settings.MAIL_PORT,
        MAIL_SERVER = settings.MAIL_SERVER,
        MAIL_STARTTLS = settings.MAIL_STARTTLS,
        MAIL_SSL_TLS = settings.MAIL_SSL_TLS,
        USE_CREDENTIALS = True,
        VALIDATE_CERTS = True,
        TIMEOUT = 60
    )
    session.add(reset_entry)
    await session.commit()

    reset_link = f"http://{settings.FRONTEND_URL}/reset-password?token={token_str}"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #02FDB7;">Recuperação de Senha - Vertex Bank</h2>
        <p>Olá, {user.full_name or 'Cliente Vertex'},</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <a href="{reset_link}" style="background-color: #02FDB7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Redefinir Minha Senha
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: gray;">
            Este link expira em 15 minutos. Se você não solicitou, ignore este e-mail.
        </p>
    </div>
    """

    message = MessageSchema(
        subject="Vertex Bank - Redefinição de Senha",
        recipients=[payload.email],
        body=html_content,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    
    try:
        await fm.send_message(message)
    except Exception as e:
        # Logar o erro internamente, mas não travar a resposta para o usuário
        print(f"Erro ao enviar email: {e}")
    
    return {"message": "Se o e-mail existir, um link de recuperação será enviado."}

@router.post("/reset-password", )
async def reset_password(payload: ResetPasswordRequest, session: AsyncSession = Depends(get_session)):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="As senhas não coincidem")
    
    query = select(ResetPassword).where(ResetPassword.token == payload.token)
    result = await session.exec(query)
    reset_entry = result.first()

    if not reset_entry:
        raise HTTPException(status_code=400, detail="Token inválido")
    
    if reset_entry.used:
        raise HTTPException(status_code=400, detail="Este token já foi utilizado.")
    
    db_expires = reset_entry.expires_at
    if db_expires.tzinfo is None:
        db_expires = db_expires.replace(tzinfo=timezone.utc)
    
    if db_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token expirado.")
    
    user = await session.get(User, reset_entry.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="Usuário não encontrado")

    if verify_password(payload.new_password, user.hashed_password):
        raise HTTPException(
            status_code=400, 
            detail="A nova senha não pode ser igual à senha atual."
        )
    
    user.hashed_password = get_password_hash(payload.new_password)
    reset_entry.used = True

    session.add(user)
    session.add(reset_entry)
    await session.commit()
    return {"message": "Senha alterada com sucesso!"}
