// =============================================================================
// Jeito único da TELA (salão) falar com o SERVIDOR LOCAL (cozinha, FastAPI).
// Use sempre apiGet / apiPost / apiDelete em vez de fetch direto: os erros já
// chegam com mensagens em português, prontas para mostrar na tela.
//
//   await apiGet("/api/planilhas")
//   await apiPost("/api/planilhas", { nome, colunas, linhas })
//   await apiDelete("/api/planilhas/3")
// =============================================================================

export class ApiError extends Error {
  constructor(message, { status = 0, code = "" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Faz um pedido à cozinha. body (opcional) vai como JSON. */
export async function apiRequest(path, { method = "GET", body, fetcher = fetch } = {}) {
  const options = { method, headers: { Accept: "application/json" } };
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetcher(path, options);
  } catch {
    throw new ApiError("Não consegui falar com o servidor local. Ele está ligado? Peça ao Claude: \"rode o sistema\".", { code: "OFFLINE" });
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new ApiError(messageFrom(data) || friendlyStatus(response.status), { status: response.status, code: data?.code || "" });
  }
  return data;
}

export const apiGet = (path, fetcher = fetch) => apiRequest(path, { fetcher });
export const apiPost = (path, body, fetcher = fetch) => apiRequest(path, { method: "POST", body, fetcher });
export const apiDelete = (path, fetcher = fetch) => apiRequest(path, { method: "DELETE", fetcher });

// A cozinha responde { message, code }. Erros padrão do FastAPI vêm em { detail }.
function messageFrom(data) {
  if (typeof data?.message === "string" && data.message) return data.message;
  if (typeof data?.detail === "string" && data.detail) return data.detail;
  return "";
}

function friendlyStatus(status) {
  if (status === 401) return "Token inválido ou vencido.";
  if (status === 404) return "Endereço não encontrado no servidor local.";
  if (status === 413) return "Arquivo grande demais para salvar.";
  if (status === 422) return "Os dados enviados não estão no formato esperado.";
  if (status === 500) return "O servidor local teve um erro. Peça ao Claude: \"deu erro\" (ele olha o make logs).";
  if (status === 502 || status === 504) return "O servidor local não está respondendo. Ele está ligado? Peça ao Claude: \"rode o sistema\".";
  if (status === 503) return "Serviço indisponível: falta configurar algo (veja a página Início).";
  return `Algo deu errado (código ${status}).`;
}
