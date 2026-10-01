import httpx

from app.main import app
from app.routers import twygo
from app.routers.twygo import get_transport, pick_user_fields, token_configurado

COMPLETO = {
    "user_id": 7,
    "name": "Ana Teste",
    "email": "ana@exemplo.com",
    "department": "RH",
    "phone": "41999999999",
    "address": "Rua X, 1",
    "zip_code": "80000-000",
    "cpf": "000.000.000-00",
    "documents": [{"tipo": "RG"}],
}


def usar_twygo_falsa(handler):
    """Troca a internet por uma Twygo falsa e devolve a lista de pedidos recebidos."""
    pedidos = []

    def registrar(request: httpx.Request):
        pedidos.append(request)
        return handler(request)

    app.dependency_overrides[get_transport] = lambda: httpx.MockTransport(registrar)
    return pedidos


def pagina(users, pagination, status=200):
    return httpx.Response(status, json={"message": "success", "data": {"users": users, "pagination": pagination}})


def test_token_configurado_rejeita_vazio_e_texto_de_exemplo():
    assert token_configurado("") is False
    assert token_configurado(None) is False
    assert token_configurado("cole_o_token_do_workshop_aqui") is False
    assert token_configurado("abc123") is True


def test_status_sem_token_e_com_token_nunca_devolve_o_token(client, monkeypatch):
    assert client.get("/api/twygo/status").json() == {"configured": False}
    monkeypatch.setenv("TWYGO_API_TOKEN", "super-secreto")
    resposta = client.get("/api/twygo/status")
    assert resposta.json() == {"configured": True}
    assert "super-secreto" not in resposta.text


def test_users_sem_token_da_503_amigavel_e_nao_chama_a_twygo(client):
    pedidos = usar_twygo_falsa(lambda _r: pagina([], {}))
    resposta = client.get("/api/twygo/users?all=true")
    assert resposta.status_code == 503
    assert resposta.json()["code"] == "TOKEN_MISSING"
    assert "token" in resposta.json()["message"].lower()
    assert pedidos == []


def test_users_token_recusado_vira_401_amigavel(client, monkeypatch):
    monkeypatch.setenv("TWYGO_API_TOKEN", "vencido")
    usar_twygo_falsa(lambda _r: httpx.Response(401, json={}))
    resposta = client.get("/api/twygo/users?all=true")
    assert resposta.status_code == 401
    assert resposta.json()["code"] == "TOKEN_INVALID"


def test_users_chama_a_twygo_com_bearer_e_paginacao(client, monkeypatch):
    monkeypatch.setenv("TWYGO_API_TOKEN", "segredo")
    monkeypatch.setenv("TWYGO_API_BASE_URL", "https://api.teste")
    pedidos = usar_twygo_falsa(lambda _r: pagina([], {"total_pages": 1, "total_entries": 0}))
    client.get("/api/twygo/users?page=2")
    assert str(pedidos[0].url) == "https://api.teste/api/v2/users?page=2&per_page=100"
    assert pedidos[0].headers["authorization"] == "Bearer segredo"


def test_all_junta_todas_as_paginas_usando_total_pages(client, monkeypatch):
    monkeypatch.setenv("TWYGO_API_TOKEN", "x")

    def handler(request):
        numero = int(request.url.params["page"])
        users = [{"id": 1}, {"id": 2}] if numero == 1 else [{"id": 3}]
        return pagina(users, {"total_pages": 2, "total_entries": 3})

    pedidos = usar_twygo_falsa(handler)
    corpo = client.get("/api/twygo/users?all=true").json()
    assert len(pedidos) == 2
    assert [u["user_id"] for u in corpo["data"]["users"]] == [1, 2, 3]
    assert corpo["data"]["pagination"] == {"total_entries": 3, "total_pages": 2}


def test_all_para_quando_a_pagina_vem_incompleta_sem_total_pages(client, monkeypatch):
    monkeypatch.setenv("TWYGO_API_TOKEN", "x")
    cheia = [{"id": i} for i in range(100)]
    pedidos = usar_twygo_falsa(lambda r: pagina(cheia if r.url.params["page"] == "1" else [{"id": 999}], {}))
    corpo = client.get("/api/twygo/users?all=true").json()
    assert len(pedidos) == 2
    assert len(corpo["data"]["users"]) == 101
    assert corpo["data"]["pagination"]["total_entries"] == 101


def test_all_devolve_erro_amigavel_se_uma_pagina_falhar(client, monkeypatch):
    monkeypatch.setenv("TWYGO_API_TOKEN", "x")
    usar_twygo_falsa(lambda _r: httpx.Response(500, json={"message": "erro"}))
    resposta = client.get("/api/twygo/users?all=true")
    assert resposta.status_code == 502
    assert resposta.json()["code"] == "TWYGO_ERROR"


def test_sem_internet_vira_502_amigavel(client, monkeypatch):
    monkeypatch.setenv("TWYGO_API_TOKEN", "x")

    def sem_rede(request):
        raise httpx.ConnectError("sem rede", request=request)

    usar_twygo_falsa(sem_rede)
    resposta = client.get("/api/twygo/users?all=true")
    assert resposta.status_code == 502
    assert resposta.json()["code"] == "TWYGO_UNREACHABLE"


def test_pick_user_fields_fica_so_com_4_campos():
    assert pick_user_fields(COMPLETO) == {"user_id": 7, "name": "Ana Teste", "email": "ana@exemplo.com", "department": "RH"}
    assert pick_user_fields({"id": 3, "first_name": "Bia", "last_name": "Lima", "sector": "TI"}) == {
        "user_id": 3,
        "name": "Bia Lima",
        "email": "",
        "department": "TI",
    }


def test_resposta_nao_tem_telefone_endereco_cep_nem_documentos(client, monkeypatch):
    monkeypatch.setenv("TWYGO_API_TOKEN", "x")
    usar_twygo_falsa(lambda _r: pagina([COMPLETO], {"total_pages": 1, "total_entries": 1, "current_page": 1}))

    uma = client.get("/api/twygo/users").json()
    assert sorted(uma["data"]["users"][0]) == ["department", "email", "name", "user_id"]
    assert uma["data"]["pagination"] == {"total_pages": 1, "total_entries": 1, "current_page": 1}

    todas = client.get("/api/twygo/users?all=true")
    for segredo in ["41999999999", "Rua X", "80000-000", "000.000.000-00", "RG"]:
        assert segredo not in todas.text
    assert todas.json()["data"]["pagination"] == {"total_entries": 1, "total_pages": 1}


def test_trava_de_seguranca_de_paginas():
    assert twygo.MAX_PAGES * twygo.PER_PAGE == 5000
