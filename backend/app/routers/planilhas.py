"""Planilhas salvas no banco (o "estoque") — sobrevivem a reiniciar o sistema.

A TELA lê o CSV/XLSX no navegador (como sempre) e manda as linhas prontas:
  POST   /api/planilhas        {nome, colunas, linhas, colunas_numericas?} → resumo
  GET    /api/planilhas        → lista [{id, nome, n_linhas, n_colunas, criado_em}]
  GET    /api/planilhas/{id}   → a planilha inteira (com as linhas)
  DELETE /api/planilhas/{id}   → apaga

Este arquivo é o MODELO para criar endpoints novos com banco.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.erros import ErroAmigavel
from app.models import Planilha
from app.schemas import PlanilhaCompleta, PlanilhaEntrada, PlanilhaResumo

router = APIRouter(prefix="/api/planilhas", tags=["planilhas"])

MAX_LINHAS = 20_000
MAX_COLUNAS = 200


def _achar(db: Session, planilha_id: int) -> Planilha:
    planilha = db.get(Planilha, planilha_id)
    if planilha is None:
        raise ErroAmigavel(404, "Não achei essa planilha no banco. Ela pode ter sido apagada.", "PLANILHA_NAO_ENCONTRADA")
    return planilha


@router.post("", status_code=201, response_model=PlanilhaResumo)
def salvar(entrada: PlanilhaEntrada, db: Session = Depends(get_db)):
    nome = entrada.nome.strip()[:200]
    if not nome:
        raise ErroAmigavel(422, "Dê um nome para a planilha.", "NOME_VAZIO")
    if not entrada.colunas or not entrada.linhas:
        raise ErroAmigavel(422, "A planilha está vazia: precisa de colunas e de pelo menos uma linha.", "PLANILHA_VAZIA")
    if len(entrada.linhas) > MAX_LINHAS:
        raise ErroAmigavel(413, f"Planilha grande demais para salvar: o limite é {MAX_LINHAS:,} linhas.".replace(",", "."), "PLANILHA_GRANDE")
    if len(entrada.colunas) > MAX_COLUNAS:
        raise ErroAmigavel(413, f"Planilha com colunas demais: o limite é {MAX_COLUNAS}.", "PLANILHA_GRANDE")

    numericas = [c for c in entrada.colunas_numericas if c in entrada.colunas]
    planilha = Planilha(
        nome=nome,
        colunas=entrada.colunas,
        colunas_numericas=numericas,
        linhas=entrada.linhas,
        n_linhas=len(entrada.linhas),
        n_colunas=len(entrada.colunas),
    )
    db.add(planilha)
    db.commit()
    db.refresh(planilha)
    return planilha


@router.get("", response_model=list[PlanilhaResumo])
def listar(db: Session = Depends(get_db)):
    # Só as colunas leves: a lista não carrega as linhas.
    consulta = select(Planilha.id, Planilha.nome, Planilha.n_linhas, Planilha.n_colunas, Planilha.criado_em).order_by(
        Planilha.criado_em.desc(), Planilha.id.desc()
    )
    return [dict(linha._mapping) for linha in db.execute(consulta)]


@router.get("/{planilha_id}", response_model=PlanilhaCompleta)
def abrir(planilha_id: int, db: Session = Depends(get_db)):
    return _achar(db, planilha_id)


@router.delete("/{planilha_id}")
def apagar(planilha_id: int, db: Session = Depends(get_db)):
    db.delete(_achar(db, planilha_id))
    db.commit()
    return {"ok": True}
