"""Erros com mensagem amigável em português.

Use `raise ErroAmigavel(404, "Não achei essa planilha.", "PLANILHA_NAO_ENCONTRADA")`.
A tela recebe `{"message": "...", "code": "..."}` e mostra a mensagem como está.
"""


class ErroAmigavel(Exception):
    def __init__(self, status: int, message: str, code: str = ""):
        super().__init__(message)
        self.status = status
        self.message = message
        self.code = code
