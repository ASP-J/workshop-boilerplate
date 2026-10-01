// =============================================================================
// Peças das PLANILHAS SALVAS NO BANCO (o "estoque" do sistema):
//   <PlanilhasSalvas />          lista com "Abrir" e "Apagar"
//   <SalvarNoBanco sheet={sheet} />  botão "Salvar no banco"
//   <EscolherPlanilhaSalva sheet={sheet} />  caixa para escolher qual planilha usar
// O que é salvo continua guardado depois de reiniciar o sistema (fica no banco
// deste computador). Sai de lá só com "Apagar" ou com "make reset".
// =============================================================================
import { useEffect, useState } from "react";
import { formatNumber } from "../lib/aggregate.js";
import { abrirPlanilha, apagarPlanilha, EVENTO_MUDOU, formatarData, salvarPlanilha } from "../lib/planilhasSalvas.js";
import { getSheet, setSheet } from "../lib/sheetStore.js";
import { useApi } from "../lib/useApi.js";
import ErrorState from "./ErrorState.jsx";
import LoadingState from "./LoadingState.jsx";

/** Lista de planilhas salvas que se atualiza sozinha quando algo é salvo ou apagado. */
function useListaSalvas() {
  const lista = useApi("/api/planilhas");
  const { recarregar } = lista;
  useEffect(() => {
    window.addEventListener(EVENTO_MUDOU, recarregar);
    return () => window.removeEventListener(EVENTO_MUDOU, recarregar);
  }, [recarregar]);
  return lista;
}

async function abrir(id, setErro) {
  try {
    setSheet(await abrirPlanilha(id));
  } catch (e) {
    setErro(e.message);
  }
}

export default function PlanilhasSalvas() {
  const { dados, erro, carregando, recarregar } = useListaSalvas();
  const [confirmando, setConfirmando] = useState(null);
  const [erroAcao, setErroAcao] = useState("");

  async function apagar(id) {
    setErroAcao("");
    try {
      await apagarPlanilha(id);
      const atual = getSheet();
      if (atual?.savedId === id) setSheet({ ...atual, savedId: null }); // continua na tela, mas não está mais no banco
    } catch (e) {
      setErroAcao(e.message);
    } finally {
      setConfirmando(null);
    }
  }

  return (
    <div className="card">
      <h3>🗄️ Planilhas salvas no banco</h3>
      <p className="subtitulo">Ficam guardadas neste computador mesmo depois de reiniciar o sistema. Apague quando não precisar mais.</p>
      {carregando && !dados && <LoadingState texto="Buscando planilhas salvas..." />}
      {erro && <ErrorState titulo="Não consegui ler o banco" mensagem={erro.message} onTentarDeNovo={recarregar} />}
      {dados && !dados.length && <p className="subtitulo">Nenhuma planilha salva ainda. Carregue uma e clique em <strong>Salvar no banco</strong>.</p>}
      {dados?.length > 0 && (
        <div className="tabela-wrap">
          <table>
            <thead>
              <tr><th>Nome</th><th>Linhas</th><th>Colunas</th><th>Salva em</th><th></th></tr>
            </thead>
            <tbody>
              {dados.map((p) => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td className="numero">{formatNumber(p.n_linhas, 0)}</td>
                  <td className="numero">{p.n_colunas}</td>
                  <td>{formatarData(p.criado_em)}</td>
                  <td>
                    <div className="linha-acoes">
                      <button className="secundario" onClick={() => abrir(p.id, setErroAcao)}>Abrir</button>
                      {confirmando === p.id ? (
                        <>
                          <button className="perigo" onClick={() => apagar(p.id)}>Confirmar</button>
                          <button className="secundario" onClick={() => setConfirmando(null)}>Cancelar</button>
                        </>
                      ) : (
                        <button className="secundario" onClick={() => setConfirmando(p.id)}>Apagar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {erroAcao && <p className="selo nao" style={{ marginTop: 12 }}>{erroAcao}</p>}
    </div>
  );
}

/** Botão "Salvar no banco" para a planilha carregada. */
export function SalvarNoBanco({ sheet }) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar() {
    setSalvando(true);
    setErro("");
    try {
      const salva = await salvarPlanilha(sheet);
      setSheet({ ...sheet, savedId: salva.id });
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  if (sheet.savedId) return <span className="selo ok">✔ Salva no banco</span>;
  return (
    <>
      <button onClick={salvar} disabled={salvando}>{salvando ? "Salvando..." : "💾 Salvar no banco"}</button>
      {erro && <span className="selo nao">{erro}</span>}
    </>
  );
}

/** Caixa "Qual planilha usar?": a carregada agora ou uma das salvas no banco. */
export function EscolherPlanilhaSalva({ sheet }) {
  const { dados } = useListaSalvas();
  const [erro, setErro] = useState("");
  if (!dados?.length) return null;

  const valor = sheet?.savedId ? String(sheet.savedId) : sheet ? "atual" : "";
  return (
    <div className="card linha-acoes">
      <label>
        Qual planilha usar?
        <select value={valor} onChange={(e) => e.target.value && e.target.value !== "atual" && abrir(Number(e.target.value), setErro)}>
          {!sheet && <option value="">— escolha uma planilha salva —</option>}
          {sheet && !sheet.savedId && <option value="atual">A carregada agora ({sheet.fileName})</option>}
          {dados.map((p) => (
            <option key={p.id} value={p.id}>
              Salva: {p.nome} ({formatNumber(p.n_linhas, 0)} linhas · {formatarData(p.criado_em)})
            </option>
          ))}
        </select>
      </label>
      {erro && <span className="selo nao">{erro}</span>}
    </div>
  );
}
