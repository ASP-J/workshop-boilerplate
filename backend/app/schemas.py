"""Formato dos dados que entram e saem da cozinha (validados automaticamente)."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class PlanilhaEntrada(BaseModel):
    """O que a tela manda ao clicar em "Salvar no banco"."""

    nome: str
    colunas: list[str]
    linhas: list[dict[str, Any]]
    colunas_numericas: list[str] = []


class PlanilhaResumo(BaseModel):
    """Um item da lista "Planilhas salvas" (sem as linhas, para ser leve)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    n_linhas: int
    n_colunas: int
    criado_em: datetime


class PlanilhaCompleta(PlanilhaResumo):
    """A planilha inteira, para abrir de novo na tela."""

    colunas: list[str]
    colunas_numericas: list[str]
    linhas: list[dict[str, Any]]
