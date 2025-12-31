from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Vertex system API"

    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Configurações do Banco de Dados
    ORACLE_USER: str
    ORACLE_PASSWORD: str
    # ORACLE_HOST: str
    # ORACLE_PORT: int
    ORACLE_SERVICE: str
    ORACLE_WALLET_DIR: str

    @property
    def DATABASE_URL(self) -> str:
        """
        Monta a string de conexão no formato que o SQLAlchemy/SQLModel espera:
        oracle+oracledb://usuario:senha@host:porta/?service_name=servico
        """
        return (
            f"oracle+oracledb_async://"
            f"{self.ORACLE_USER}:{self.ORACLE_PASSWORD}"
            f"@{self.ORACLE_SERVICE}"
            # f"?service_name={self.ORACLE_SERVICE}"
            f"?config_dir={self.ORACLE_WALLET_DIR}"
        )

    class Config:
        # Aponta para o arquivo .env na raiz do backend
        env_file = ".env"
        # Ignora variáveis extras que possam estar no .env
        extra = "ignore" 

settings = Settings()