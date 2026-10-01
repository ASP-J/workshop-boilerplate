// =============================================================================
// REGISTRO DE PÁGINAS — o único lugar que diz quais páginas existem.
// O menu lateral e as rotas leem esta lista automaticamente.
//
// Para criar uma página nova:
//   1. Crie o arquivo src/pages/MinhaPagina.jsx (copie MinhaAutomacao.jsx como base)
//   2. Importe aqui e adicione UMA linha na lista abaixo:
//        { path: "/minha-pagina", label: "Minha página", icon: "✨", component: MinhaPagina },
// =============================================================================
import Inicio from "./Inicio.jsx";
import MinhaPlanilha from "./MinhaPlanilha.jsx";
import UsuariosTwygo from "./UsuariosTwygo.jsx";
import CruzarPlanilhaTwygo from "./CruzarPlanilhaTwygo.jsx";
import MinhaAutomacao from "./MinhaAutomacao.jsx";

export const pages = [
  { path: "/", label: "Início", icon: "🏠", component: Inicio },
  { path: "/planilha", label: "Minha planilha", icon: "📄", component: MinhaPlanilha },
  { path: "/usuarios-twygo", label: "Usuários Twygo", icon: "👥", component: UsuariosTwygo },
  { path: "/cruzar", label: "Cruzar planilha × Twygo", icon: "🔗", component: CruzarPlanilhaTwygo },
  { path: "/minha-automacao", label: "Minha automação", icon: "✨", component: MinhaAutomacao }
];
