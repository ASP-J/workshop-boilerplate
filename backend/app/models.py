"""Tabelas do banco. Cada classe = uma tabela.

Mudou uma tabela (coluna nova, nome trocado)? O sistema só CRIA tabelas que não
existem; não altera as que já existem. Rode `make reset` (apaga o banco local)
e depois `make up` para recriar.
"""

from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base

# No PostgreSQL usa JSONB (guarda listas/objetos de forma eficiente).
# Nos testes (SQLite) cai para JSON comum.
JsonDoBanco = JSON().with_variant(JSONB(), "postgresql")


def agora() -> datetime:
    return datetime.now(timezone.utc)


class Planilha(Base):
    """Uma planilha que a pessoa salvou no banco (sobrevive a reiniciar o sistema)."""

    __tablename__ = "planilhas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    # Nomes das colunas, na ordem: ["email", "area", ...]
    colunas: Mapped[list] = mapped_column(JsonDoBanco, nullable=False)
    # Quais colunas são numéricas (para gráficos e somas).
    colunas_numericas: Mapped[list] = mapped_column(JsonDoBanco, nullable=False, default=list)
    # As linhas em si: [{ "email": "...", "area": "RH", ... }, ...]
    linhas: Mapped[list] = mapped_column(JsonDoBanco, nullable=False)
    n_linhas: Mapped[int] = mapped_column(Integer, nullable=False)
    n_colunas: Mapped[int] = mapped_column(Integer, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora, nullable=False)
