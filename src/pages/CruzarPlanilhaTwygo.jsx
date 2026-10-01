// =============================================================================
// PÁGINA CRUZAR PLANILHA × TWYGO — junta a planilha carregada com os usuários
// da Twygo pelo e-mail (sem diferenciar maiúsculas e ignorando espaços).
// =============================================================================
import { useEffect, useMemo, useState } from "react";
import { formatNumber } from "../lib/aggregate.js";
import { guessEmailColumn, matchByEmail } from "../lib/matchByEmail.js";
import { useSheet } from "../lib/sheetStore.js";
import { presentUsers } from "../lib/twygoUsers.js";
import { useApi } from "../lib/useApi.js";
import DataTable from "../components/DataTable.jsx";
import KpiCard from "../components/KpiCard.jsx";
import LoadingState from "../components/LoadingState.jsx";
import SheetLoader, { SheetBar } from "../components/SheetLoader.jsx";
import { ErroTwygo } from "./UsuariosTwygo.jsx";

export default function CruzarPlanilhaTwygo() {
  const sheet = useSheet();
  const twygo = useApi("/api/twygo/users?all=true");

  return (
    <>
      <div>
        <h1>🔗 Cruzar planilha × Twygo</h1>
        <p className="subtitulo">Descubra quais pessoas da sua planilha existem na Twygo (comparando o e-mail).</p>
      </div>
      {!sheet && <SheetLoader />}
      {twygo.carregando && <LoadingState texto="Buscando usuários na Twygo..." />}
      {twygo.erro && <ErroTwygo erro={twygo.erro} onTentarDeNovo={twygo.recarregar} />}
      {sheet && twygo.dados && <Cruzamento sheet={sheet} payload={twygo.dados} />}
    </>
  );
}

function Cruzamento({ sheet, payload }) {
  const users = useMemo(() => presentUsers(payload).users, [payload]);
  const [colunaEmail, setColunaEmail] = useState(() => guessEmailColumn(sheet.columns, sheet.rows));
  const [ver, setVer] = useState("encontrados");

  useEffect(() => setColunaEmail(guessEmailColumn(sheet.columns, sheet.rows)), [sheet]);

  const resultado = useMemo(() => matchByEmail(sheet.rows, colunaEmail, users), [sheet, colunaEmail, users]);
  const encontrados = resultado.matched.map(({ row, user }) => ({ ...row, twygo_nome: user.nome, twygo_departamento: user.departamento }));
  const percentual = resultado.total ? (resultado.matched.length / resultado.total) * 100 : 0;

  return (
    <>
      <SheetBar sheet={sheet} />
      <div className="card linha-acoes">
        <label>
          Coluna de e-mail da planilha
          <select value={colunaEmail} onChange={(e) => setColunaEmail(e.target.value)}>
            <option value="">— escolha —</option>
            {sheet.columns.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <div className="grade">
        <KpiCard rotulo="Pessoas encontradas" valor={`${formatNumber(resultado.emails.matched, 0)} de ${formatNumber(resultado.emails.total, 0)}`} dica="e-mails diferentes da planilha que existem na Twygo" cor="verde" />
        <KpiCard rotulo="Linhas na planilha" valor={formatNumber(resultado.total, 0)} dica="uma pessoa pode ter várias linhas (um curso por linha)" />
        <KpiCard rotulo="Linhas encontradas" valor={formatNumber(resultado.matched.length, 0)} dica={`${formatNumber(percentual, 1)}% das linhas`} cor="verde" />
        <KpiCard rotulo="Linhas não encontradas" valor={formatNumber(resultado.unmatched.length, 0)} cor="vermelho" />
        <KpiCard rotulo="Usuários na Twygo" valor={formatNumber(users.length, 0)} cor="amarelo" />
      </div>

      <div className="linha-acoes">
        <button className={ver === "encontrados" ? "" : "secundario"} onClick={() => setVer("encontrados")}>Encontrados</button>
        <button className={ver === "nao" ? "" : "secundario"} onClick={() => setVer("nao")}>Não encontrados</button>
      </div>

      {ver === "encontrados" ? (
        <DataTable linhas={encontrados} colunas={[...sheet.columns, "twygo_nome", "twygo_departamento"]} nomeArquivo="cruzamento_encontrados.csv" />
      ) : (
        <DataTable linhas={resultado.unmatched} colunas={sheet.columns} nomeArquivo="cruzamento_nao_encontrados.csv" />
      )}
    </>
  );
}
