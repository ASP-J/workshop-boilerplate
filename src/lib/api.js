// =============================================================================
// Jeito único da TELA falar com o SERVIDOR LOCAL.
// Use sempre apiGet("/api/...") em vez de fetch direto: os erros já chegam
// com mensagens em português, prontas para mostrar na tela.
// =============================================================================

export class ApiError extends Error {
  constructor(message, { status = 0, code = "" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiGet(path, fetcher = fetch) {
  let response;
  try {
    response = await fetcher(path, { headers: { Accept: "application/json" } });
  } catch {
    throw new ApiError("Não consegui falar com o servidor local. Ele está ligado? Peça ao Claude: \"rode o sistema\".", { code: "OFFLINE" });
  }

  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    throw new ApiError(body.message || friendlyStatus(response.status), { status: response.status, code: body.code || "" });
  }
  return body;
}

function friendlyStatus(status) {
  if (status === 401) return "Token inválido ou vencido.";
  if (status === 404) return "Endereço não encontrado no servidor local.";
  if (status === 502 || status === 504) return "O servidor local não está respondendo. Ele está ligado?";
  if (status === 503) return "Serviço indisponível: falta configurar algo (veja a página Início).";
  return `Algo deu errado (código ${status}).`;
}
