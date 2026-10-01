// =============================================================================
// Moldura do sistema: barra do topo + menu lateral + área de conteúdo.
// As páginas vêm de src/pages/index.js — normalmente você NÃO precisa mexer aqui.
// =============================================================================
import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { config } from "./config.js";
import { pages } from "./pages/index.js";
import EmptyState from "./components/EmptyState.jsx";

export default function App() {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuAberto(false), [location.pathname]);
  useEffect(() => {
    document.title = `${config.nomeDoPainel} · ${config.setor}`;
  }, []);

  return (
    <div style={{ "--cor-principal": config.corPrincipal }}>
      <header className="topo">
        <button className="botao-menu" onClick={() => setMenuAberto((v) => !v)} aria-label="Abrir menu">☰</button>
        <span className="titulo">{config.nomeDoPainel}</span>
        <span className="setor">{config.setor}</span>
        <span className="local">🔒 Rodando só no seu computador</span>
      </header>
      <div className="estrutura">
        <nav className={`menu ${menuAberto ? "aberto" : ""}`} aria-label="Menu principal">
          {pages.map((p) => (
            <NavLink key={p.path} to={p.path} end={p.path === "/"} className={({ isActive }) => (isActive ? "ativo" : "")}>
              <span aria-hidden="true">{p.icon ?? "•"}</span> {p.label}
            </NavLink>
          ))}
          <div className="rodape">{config.rodape}</div>
        </nav>
        <main className="conteudo">
          <Routes>
            {pages.map(({ path, component: Pagina }) => (
              <Route key={path} path={path} element={<Pagina />} />
            ))}
            <Route path="*" element={<EmptyState icone="🧭" titulo="Página não encontrada" texto="Use o menu ao lado para escolher uma página." />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
