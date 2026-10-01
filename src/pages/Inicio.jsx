// =============================================================================
// PÁGINA INÍCIO — como usar, status do servidor e do token, atalhos e regras.
// =============================================================================
import { Link } from "react-router-dom";
import { config } from "../config.js";
import { useApi } from "../lib/useApi.js";
import { pages } from "./index.js";
import RulesBox from "../components/RulesBox.jsx";

function Status({ rotulo, ok, carregando, textoOk, textoNao }) {
  return (
    <div className={`card kpi ${carregando ? "" : ok ? "verde" : "vermelho"}`}>
      <div className="rotulo">{rotulo}</div>
      <p style={{ marginTop: 8, marginBottom: 0 }}>
        {carregando ? <span className="selo neutro">verificando...</span> : ok ? <span className="selo ok">✔ {textoOk}</span> : <span className="selo nao">✖ {textoNao}</span>}
      </p>
    </div>
  );
}

export default function Inicio() {
  const saude = useApi("/health");
  const twygo = useApi("/api/twygo/status");
  const tokenOk = twygo.dados?.configured === true;

  return (
    <>
      <div>
        <h1>Olá! Este é o {config.nomeDoPainel}</h1>
        <p className="subtitulo">Um esqueleto pronto para você automatizar uma tarefa repetitiva do seu setor com o Claude Code.</p>
      </div>

      <ol className="passos">
        <li><strong>Explore</strong><br />Use as páginas do menu e a planilha do workshop para ver o que já funciona.</li>
        <li><strong>Peça ao Claude</strong><br />No Claude Code, descreva em português o que você quer. Ex.: <em>"crie uma página que mostre as despesas por categoria"</em>.</li>
        <li><strong>Confira aqui</strong><br />O Claude diz qual endereço abrir. Atualize a página e veja o resultado.</li>
      </ol>

      <div className="grade">
        <Status rotulo="Servidor local" carregando={saude.carregando} ok={saude.dados?.ok} textoOk="ligado" textoNao="desligado — peça: “rode o sistema”" />
        <Status rotulo="Token da Twygo" carregando={twygo.carregando} ok={tokenOk} textoOk="configurado" textoNao="não configurado" />
      </div>

      {!twygo.carregando && !tokenOk && (
        <div className="dica-claude">
          <strong>Quer usar os dados da Twygo?</strong> Peça ao Claude Code:{" "}
          <em>"Crie o .env a partir do .env.example e abra o arquivo para eu colar o token"</em>.
          No arquivo que abrir, cole o token logo depois de <code>TWYGO_API_TOKEN=</code>, salve e diga <em>"pronto"</em> ao Claude.
          <strong> Nunca cole o token no chat.</strong> As páginas de planilha funcionam sem token.
        </div>
      )}

      <div className="grade">
        {pages.filter((p) => p.path !== "/").map((p) => (
          <Link key={p.path} to={p.path} className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ fontSize: "1.6rem" }}>{p.icon}</div>
            <strong>{p.label}</strong>
          </Link>
        ))}
      </div>

      <RulesBox />
    </>
  );
}
