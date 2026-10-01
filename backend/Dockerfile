# Cozinha (FastAPI + Python). O Python e as peças ficam DENTRO do container:
# o computador da pessoa não precisa ter Python instalado.
FROM python:3.12-slim

# Não cria arquivos __pycache__ na pasta do projeto e mostra os logs na hora.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# --reload: salvou um arquivo em backend/app, a cozinha reinicia sozinha.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
