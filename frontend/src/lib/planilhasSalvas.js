// =============================================================================
// Planilhas salvas no BANCO (estoque). Diferente do sessionStorage (que some ao
// fechar a aba), o que é salvo aqui continua lá depois de reiniciar o sistema.
// Só sai do banco se a pessoa clicar em "Apagar" ou rodar "make reset".
//
//   await listarPlanilhas()            -> [{ id, nome, n_linhas, n_colunas, criado_em }]
//   await salvarPlanilha(sheet)        -> { id, nome, ... }
//   await abrirPlanilha(id)            -> sheet pronto para setSheet(...)
//   await apagarPlanilha(id)
// =============================================================================
import { apiDelete, apiGet, apiPost } from "./api.js";

export const MAX_LINHAS_SALVAR = 20000; // mesmo limite da cozinha (backend/app/routers/planilhas.py)

// Avisa as listas abertas na tela que algo foi salvo/apagado (para recarregarem).
export const EVENTO_MUDOU = "planilhas-salvas:mudou";
function avisarMudanca() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO_MUDOU));
}

/** Planilha da tela -> o que a cozinha espera receber. */
export function paraSalvar(sheet) {
  return {
    nome: String(sheet?.fileName ?? "").trim() || "planilha sem nome",
    colunas: sheet?.columns ?? [],
    colunas_numericas: sheet?.numericColumns ?? [],
    linhas: sheet?.rows ?? []
  };
}

/** Resposta da cozinha -> planilha no formato da tela (o mesmo do parseSheet). */
export function daCozinha(salva) {
  return {
    fileName: salva?.nome ?? "planilha",
    columns: salva?.colunas ?? [],
    rows: salva?.linhas ?? [],
    numericColumns: salva?.colunas_numericas ?? [],
    savedId: salva?.id ?? null
  };
}

/** "2026-10-01T14:05:00Z" -> "01/10/2026 11:05" (horário do computador). */
export function formatarData(iso) {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export const listarPlanilhas = () => apiGet("/api/planilhas");

export async function salvarPlanilha(sheet) {
  if ((sheet?.rows?.length ?? 0) > MAX_LINHAS_SALVAR) {
    throw new Error(`Planilha grande demais para salvar no banco (limite: ${MAX_LINHAS_SALVAR.toLocaleString("pt-BR")} linhas).`);
  }
  const salva = await apiPost("/api/planilhas", paraSalvar(sheet));
  avisarMudanca();
  return salva;
}

export async function abrirPlanilha(id) {
  return daCozinha(await apiGet(`/api/planilhas/${id}`));
}

export async function apagarPlanilha(id) {
  const resposta = await apiDelete(`/api/planilhas/${id}`);
  avisarMudanca();
  return resposta;
}
