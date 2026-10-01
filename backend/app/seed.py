"""Dados iniciais do banco.

De propósito, NADA é gravado automaticamente: o banco começa vazio e só guarda
as planilhas que a pessoa decidir salvar (botão "Salvar no banco").
A planilha do workshop continua sendo um arquivo (frontend/public/exemplos/).

Se um dia precisar de dados de exemplo aqui, use SÓ dados inventados
(e-mails @exemplo.com) e insira apenas se a tabela estiver vazia.
"""

from sqlalchemy.orm import Session


def seed_if_empty(db: Session) -> bool:
    """Hoje não insere nada. Retorna True se inseriu algo."""
    return False
