"""Conexão com o banco (PostgreSQL) — o "estoque" do restaurante.

Dentro do Docker, o docker-compose.yml monta DATABASE_URL a partir das variáveis
POSTGRES_* do .env. O valor padrão abaixo usa as mesmas credenciais padrão.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://workshop:workshop@postgres:5432/workshop",
)

# pool_pre_ping: se o banco reiniciou, reconecta sozinho em vez de dar erro.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """Abre uma sessão com o banco para cada pedido e fecha no final."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
