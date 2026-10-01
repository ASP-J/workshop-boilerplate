// =============================================================================
// Tabela pronta: clique no título da coluna para ordenar, campo de busca e
// botão "Exportar CSV" (exporta o que está filtrado).
//   <DataTable linhas={rows} colunas={["nome","email"]} titulos={{ nome: "Nome" }} limite={50} />
// =============================================================================
import { useMemo, useState } from "react";
import { formatNumber } from "../lib/aggregate.js";
import { downloadCsv } from "../lib/exportCsv.js";
import EmptyState from "./EmptyState.jsx";

export default function DataTable({ linhas = [], colunas, titulos = {}, limite = 200, nomeArquivo = "dados.csv", busca = true, titulo }) {
  const cols = useMemo(() => (colunas?.length ? colunas : Object.keys(linhas[0] ?? {})), [colunas, linhas]);
  const [texto, setTexto] = useState("");
  const [ordem, setOrdem] = useState({ coluna: null, asc: true });

  const filtradas = useMemo(() => {
    const termo = texto.trim().toLowerCase();
    let resultado = termo ? linhas.filter((l) => cols.some((c) => String(l[c] ?? "").toLowerCase().includes(termo))) : linhas;
    if (ordem.coluna) {
      const c = ordem.coluna;
      resultado = [...resultado].sort((a, b) => {
        const x = a[c], y = b[c];
        const r = typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""), "pt-BR", { numeric: true });
        return ordem.asc ? r : -r;
      });
    }
    return resultado;
  }, [linhas, cols, texto, ordem]);

  const ordenar = (c) => setOrdem((o) => ({ coluna: c, asc: o.coluna === c ? !o.asc : true }));
  const visiveis = filtradas.slice(0, limite);

  return (
    <div className="card">
      {titulo && <h3>{titulo}</h3>}
      <div className="linha-acoes" style={{ marginBottom: 12 }}>
        {busca && <input type="search" placeholder="Buscar..." value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar na tabela" />}
        <button className="secundario" onClick={() => downloadCsv(nomeArquivo, filtradas, cols)} disabled={!filtradas.length}>
          ⬇ Exportar CSV ({filtradas.length})
        </button>
        <span className="subtitulo">
          Mostrando {visiveis.length} de {filtradas.length} linha(s)
        </span>
      </div>
      {!linhas.length ? (
        <EmptyState icone="🗂️" titulo="Nada para mostrar ainda" />
      ) : (
        <div className="tabela-wrap">
          <table>
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c} onClick={() => ordenar(c)} title="Clique para ordenar">
                    {titulos[c] ?? c} {ordem.coluna === c ? (ordem.asc ? "▲" : "▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visiveis.map((linha, i) => (
                <tr key={i}>
                  {cols.map((c) => (
                    <td key={c} className={typeof linha[c] === "number" ? "numero" : ""}>
                      {typeof linha[c] === "number" ? formatNumber(linha[c]) : String(linha[c] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
