// =============================================================================
// PÁGINA MINHA AUTOMAÇÃO — o seu ponto de partida para o desafio do setor.
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ PEÇA AO CLAUDE (exemplos — cole no Claude Code e adapte):                │
// │                                                                         │
// │ • "Na página Minha automação, use a planilha carregada em Minha          │
// │    planilha e mostre o total de horas por área no gráfico."              │
// │ • "Troque os dados de exemplo desta página pelo arquivo                  │
// │    frontend/public/exemplos/capacitacao_workshop.csv e mostre horas por  │
// │    curso, com um card de % concluído."                                   │
// │ • "Adicione um filtro por status (Concluído / Pendente) acima da tabela."│
// │ • "Crie um card com quantos leads estão na etapa Proposta."              │
// │                                                                         │
// │ Peças prontas para usar: KpiCard, ChartCard, DataTable, FileUpload,      │
// │ SheetLoader (src/components). Contas: groupBy, sum, average              │
// │ (src/lib/aggregate.js). Planilha carregada: useSheet() (src/lib/sheetStore.js).│
// └─────────────────────────────────────────────────────────────────────────┘
// =============================================================================
import { useMemo } from "react";
import { formatNumber, groupBy, sum } from "../lib/aggregate.js";
import ChartCard from "../components/ChartCard.jsx";
import DataTable from "../components/DataTable.jsx";
import KpiCard from "../components/KpiCard.jsx";

// DADOS DE EXEMPLO (inventados). Troque pelos seus — ou peça ao Claude para trocar.
const DADOS_EXEMPLO = [
  { tarefa: "Conferir planilha de ponto", setor: "RH", horas_por_mes: 6, status: "Manual" },
  { tarefa: "Relatório de despesas", setor: "Financeiro", horas_por_mes: 8, status: "Manual" },
  { tarefa: "Atualizar funil de leads", setor: "Vendas", horas_por_mes: 5, status: "Automatizado" },
  { tarefa: "Responder dúvidas repetidas", setor: "Atendimento", horas_por_mes: 10, status: "Manual" },
  { tarefa: "Status semanal de projetos", setor: "PMO", horas_por_mes: 4, status: "Automatizado" },
  { tarefa: "Lista de quem não fez o curso", setor: "RH", horas_por_mes: 3, status: "Manual" }
];

export default function MinhaAutomacao() {
  const linhas = DADOS_EXEMPLO;
  const porSetor = useMemo(() => groupBy(linhas, "setor", "horas_por_mes"), [linhas]);
  const porStatus = useMemo(() => groupBy(linhas, "status"), [linhas]);
  const manuais = linhas.filter((l) => l.status === "Manual").length;

  return (
    <>
      <div>
        <h1>✨ Minha automação</h1>
        <p className="subtitulo">Esta página é sua. Os dados abaixo são de exemplo — peça ao Claude para transformá-la na automação do seu setor.</p>
      </div>

      <div className="dica-claude">
        <strong>Comece assim no Claude Code:</strong> <em>"Eu trabalho em [seu setor] e toda semana eu [tarefa repetitiva]. Transforme a página Minha automação nisso, usando o arquivo de exemplo mais parecido."</em>
      </div>

      {/* LINHA DE CARDS — adicione ou troque KpiCards aqui */}
      <div className="grade">
        <KpiCard rotulo="Tarefas mapeadas" valor={linhas.length} />
        <KpiCard rotulo="Horas por mês" valor={formatNumber(sum(linhas, "horas_por_mes"))} dica="tempo gasto hoje" cor="amarelo" />
        <KpiCard rotulo="Ainda manuais" valor={manuais} dica="candidatas a automatizar" cor="escuro" />
      </div>

      {/* GRÁFICOS — tipo="barra" ou tipo="pizza" */}
      <div className="grade-2">
        <ChartCard titulo="Horas por setor" dados={porSetor} />
        <ChartCard titulo="Manual × automatizado" dados={porStatus} tipo="pizza" />
      </div>

      {/* TABELA — já tem busca, ordenação e exportar CSV */}
      <DataTable titulo="Tarefas" linhas={linhas} nomeArquivo="minha_automacao.csv" />
    </>
  );
}
