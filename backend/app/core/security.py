from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from datetime import datetime, timedelta
from pytz import timezone
from app.core.config import settings
from typing import Any
import jwt


ALGORITHM = "HS256"

ph = PasswordHasher()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se a senha em texto plano corresponde ao hash armazenado.
    Retorna True se correto, False caso contrário.
    """
    try:
        ph.verify(hashed_password, plain_password)
        return True
    except VerifyMismatchError:
        return False

def get_password_hash(password: str) -> str:
    """
    Gera o hash Argon2id da senha.
    """
    return ph.hash(password)

def create_access_token(subject: str | Any, expires_delta:timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone("America/Recife")) + expires_delta
    else:
        expire = datetime.now(timezone("America/Recife")) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = ({"exp": expire, "sub": str(subject)})
    encode_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encode_jwt