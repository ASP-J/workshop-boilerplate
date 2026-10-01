"""GET /health → a cozinha está de pé? E o estoque (banco) responde?

Resposta: {"ok": true, "db": true}. "db": false = o banco não respondeu.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import get_db

router = APIRouter(tags=["saúde"])


@router.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        banco_ok = True
    except Exception:  # noqa: BLE001 — qualquer falha aqui significa "banco fora do ar"
        banco_ok = False
    return {"ok": True, "db": banco_ok}
