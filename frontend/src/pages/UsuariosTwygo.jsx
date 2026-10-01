// =============================================================================
// PÁGINA USUÁRIOS TWYGO — lista todos os usuários via servidor local.
// O token fica no servidor local (cozinha, lê do .env); a tela só recebe nome, e-mail e departamento.
// =============================================================================
import { useMemo } from "react";
import { countBy, formatNumber } from "../lib/aggregate.js";
import { presentUsers } from "../lib/twygoUsers.js";
import { useApi } from "../lib/useApi.js";
import DataTable from "../components/DataTable.jsx";
import ErrorState from "../components/ErrorState.jsx";
import KpiCard from "../components/KpiCard.jsx";
import LoadingState from "../components/LoadingState.jsx";

export default function UsuariosTwygo() {
  const { dados, erro, carregando, recarregar } = useApi("/api/twygo/users?all=true");

  return (
    <>
      <div>
        <h1>👥 Usuários Twygo</h1>
        <p className="subtitulo">Todos os usuários da plataforma, buscados página por página pelo servidor local.</p>
      </div>
      {carregando && <LoadingState texto="Buscando usuários na Twygo (pode levar alguns segundos)..." />}
      {erro && <ErroTwygo erro={erro} onTentarDeNovo={recarregar} />}
      {dados && <Lista payload={dados} />}
    </>
  );
}

export function ErroTwygo({ erro, onTentarDeNovo }) {
  if (erro.code === "TOKEN_MISSING") {
    return (
      <ErrorState titulo="Falta configurar o token da Twygo" onTentarDeNovo={onTentarDeNovo}>
        <div className="dica-claude" style={{ textAlign: "left" }}>
          <p>1. No Claude Code, peça: <em>"Crie o .env a partir do .env.example e abra o arquivo para eu colar o token"</em>.</p>
          <p>2. No arquivo que abrir, cole o token do workshop logo depois de <code>TWYGO_API_TOKEN=</code> (no lugar de <code>cole_o_token_do_workshop_aqui</code>) e salve.</p>
          <p>3. Volte ao Claude Code e diga <em>"pronto"</em>. Ele reinicia o sistema e confere. Depois clique em "Tentar de novo".</p>
          <p><strong>Nunca cole o token no chat nem em print.</strong></p>
        </div>
      </ErrorState>
    );
  }
  if (erro.status === 401 || erro.code === "TOKEN_INVALID") {
    return <ErrorState titulo="Token inválido ou vencido" mensagem="A Twygo recusou o token do .env. Peça um token novo ao João ou à Adriana, troque no .env e reinicie o sistema." onTentarDeNovo={onTentarDeNovo} />;
  }
  return <ErrorState mensagem={erro.message} onTentarDeNovo={onTentarDeNovo} />;
}

function Lista({ payload }) {
  const { users, total } = useMemo(() => presentUsers(payload), [payload]);
  const departamentos = useMemo(() => countBy(users, "departamento"), [users]);
  const semEmail = users.filter((u) => !u.email).length;

  return (
    <>
      <div className="grade">
        <KpiCard rotulo="Usuários" valor={formatNumber(total, 0)} dica={`${formatNumber(users.length, 0)} carregados`} />
        <KpiCard rotulo="Departamentos" valor={departamentos.length} cor="amarelo" />
        <KpiCard rotulo="Sem e-mail" valor={semEmail} cor="escuro" />
      </div>
      <DataTable linhas={users} colunas={["nome", "email", "departamento"]} titulos={{ nome: "Nome", email: "E-mail", departamento: "Departamento" }} limite={200} nomeArquivo="usuarios_twygo.csv" />
    </>
  );
}
