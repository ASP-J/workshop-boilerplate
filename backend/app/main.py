"""COZINHA do sistema (backend FastAPI).

A tela (React) faz pedidos em /api/... e a cozinha responde, buscando no
estoque (banco PostgreSQL) ou na Twygo (com o token, que fica SÓ aqui).

Para criar um grupo de endpoints novo:
  1. crie app/routers/meu_assunto.py (copie planilhas.py como base);
  2. registre aqui embaixo: app.include_router(meu_assunto.router).
Documentação automática (testar endpoints no navegador): http://localhost:5194/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.db import Base, SessionLocal, engine
from app.erros import ErroAmigavel
from app.routers import health, planilhas, twygo
from app.seed import seed_if_empty


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Cria as tabelas que ainda não existem (não altera as que já existem:
    # mudou uma tabela? rode `make reset` para recriar o banco local).
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_if_empty(db)
    yield


app = FastAPI(title="Painel do workshop — cozinha (API)", lifespan=lifespan)

# A tela fala com a cozinha pelo proxy do Vite (mesma origem), então CORS quase
# não entra em jogo. Mesmo assim, só aceitamos a própria tela, no próprio computador.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5193", "http://127.0.0.1:5193"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ErroAmigavel)
async def erro_amigavel(_request: Request, erro: ErroAmigavel):
    return JSONResponse(status_code=erro.status, content={"message": erro.message, "code": erro.code})


@app.exception_handler(RequestValidationError)
async def erro_de_validacao(_request: Request, erro: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "message": "Os dados enviados não estão no formato esperado.",
            "code": "DADOS_INVALIDOS",
            "detail": [{"campo": ".".join(str(p) for p in e.get("loc", [])), "erro": e.get("msg", "")} for e in erro.errors()][:5],
        },
    )


# Registre aqui cada novo router criado em app/routers/.
app.include_router(health.router)
app.include_router(twygo.router)
app.include_router(planilhas.router)


@app.api_route("/api/{caminho:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"], include_in_schema=False)
def rota_inexistente(caminho: str):
    """Qualquer /api/... que não existe responde em português."""
    raise ErroAmigavel(404, "Esta rota não existe na cozinha (backend).", "ROTA_INEXISTENTE")
