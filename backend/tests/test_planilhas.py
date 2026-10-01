from app.routers.planilhas import MAX_LINHAS

PLANILHA = {
    "nome": "teste.csv",
    "colunas": ["area", "horas"],
    "colunas_numericas": ["horas", "coluna_que_nao_existe"],
    "linhas": [{"area": "RH", "horas": 2}, {"area": "Vendas", "horas": 3.5}],
}


def test_crud_completo(client):
    assert client.get("/api/planilhas").json() == []

    criada = client.post("/api/planilhas", json=PLANILHA)
    assert criada.status_code == 201
    resumo = criada.json()
    assert resumo["nome"] == "teste.csv"
    assert resumo["n_linhas"] == 2
    assert resumo["n_colunas"] == 2
    assert "linhas" not in resumo

    lista = client.get("/api/planilhas").json()
    assert [p["id"] for p in lista] == [resumo["id"]]
    assert "linhas" not in lista[0]

    completa = client.get(f"/api/planilhas/{resumo['id']}").json()
    assert completa["colunas"] == ["area", "horas"]
    assert completa["colunas_numericas"] == ["horas"]
    assert completa["linhas"][1] == {"area": "Vendas", "horas": 3.5}

    assert client.delete(f"/api/planilhas/{resumo['id']}").json() == {"ok": True}
    assert client.get("/api/planilhas").json() == []


def test_lista_mais_recente_primeiro(client):
    a = client.post("/api/planilhas", json={**PLANILHA, "nome": "a"}).json()
    b = client.post("/api/planilhas", json={**PLANILHA, "nome": "b"}).json()
    assert [p["id"] for p in client.get("/api/planilhas").json()] == [b["id"], a["id"]]


def test_planilha_que_nao_existe_da_404_amigavel(client):
    for resposta in (client.get("/api/planilhas/999"), client.delete("/api/planilhas/999")):
        assert resposta.status_code == 404
        assert resposta.json()["code"] == "PLANILHA_NAO_ENCONTRADA"


def test_valida_nome_vazio_e_planilha_vazia(client):
    assert client.post("/api/planilhas", json={**PLANILHA, "nome": "   "}).json()["code"] == "NOME_VAZIO"
    assert client.post("/api/planilhas", json={**PLANILHA, "linhas": []}).json()["code"] == "PLANILHA_VAZIA"


def test_formato_errado_da_422_em_portugues(client):
    resposta = client.post("/api/planilhas", json={"nome": "x", "colunas": "nao-e-lista", "linhas": []})
    assert resposta.status_code == 422
    assert resposta.json()["code"] == "DADOS_INVALIDOS"
    assert "formato" in resposta.json()["message"]


def test_limite_de_linhas(client):
    grande = {**PLANILHA, "linhas": [{"area": "RH", "horas": 1}] * (MAX_LINHAS + 1)}
    resposta = client.post("/api/planilhas", json=grande)
    assert resposta.status_code == 413
    assert resposta.json()["code"] == "PLANILHA_GRANDE"
    assert client.get("/api/planilhas").json() == []
