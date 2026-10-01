"""Preparação dos testes.

Os testes usam um banco SQLite em memória (descartável): rodam rápido, não
precisam da internet e NUNCA mexem nas planilhas salvas no seu PostgreSQL.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app


@pytest.fixture
def sessao_de_teste():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    Sessao = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    yield Sessao
    engine.dispose()


@pytest.fixture
def client(sessao_de_teste, monkeypatch):
    # Sem token por padrão (cada teste da Twygo coloca o seu, falso).
    monkeypatch.delenv("TWYGO_API_TOKEN", raising=False)
    monkeypatch.delenv("TWYGO_API_BASE_URL", raising=False)

    def banco_de_teste():
        db = sessao_de_teste()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = banco_de_teste
    # Sem "with": não roda o lifespan (que falaria com o PostgreSQL de verdade).
    yield TestClient(app)
    app.dependency_overrides.clear()
