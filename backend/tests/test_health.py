from app.db import get_db
from app.main import app


def test_health_responde_ok_com_banco(client):
    resposta = client.get("/health")
    assert resposta.status_code == 200
    assert resposta.json() == {"ok": True, "db": True}


def test_health_diz_db_false_quando_o_banco_nao_responde(client):
    class BancoQuebrado:
        def execute(self, *_args, **_kwargs):
            raise RuntimeError("banco fora do ar")

    app.dependency_overrides[get_db] = lambda: BancoQuebrado()
    assert client.get("/health").json() == {"ok": True, "db": False}


def test_rota_api_inexistente_responde_em_portugues(client):
    resposta = client.get("/api/nao-existe")
    assert resposta.status_code == 404
    assert resposta.json()["code"] == "ROTA_INEXISTENTE"
