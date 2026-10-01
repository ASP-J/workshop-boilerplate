// =============================================================================
// PÁGINA MINHA PLANILHA — carrega CSV/XLSX, mostra resumo, gráfico e tabela.
// Tudo é processado no navegador: os dados nunca saem do computador.
// =============================================================================
import { useEffect, useMemo, useState } from "react";
import { average, formatNumber, groupBy, sum } from "../lib/aggregate.js";
import { pickDefaultChartColumns } from "../lib/chartDefaults.js";
import { useSheet } from "../lib/sheetStore.js";
import ChartCard from "../components/ChartCard.jsx";
import DataTable from "../components/DataTable.jsx";
import KpiCard from "../components/KpiCard.jsx";
import SheetLoader, { SheetBar } from "../components/SheetLoader.jsx";

export default function MinhaPlanilha() {
  const sheet = useSheet();

  return (
    <>
      <div>
        <h1>📄 Minha planilha</h1>
        <p className="subtitulo">Carregue um arquivo .csv ou .xlsx para ver resumo, gráfico e tabela. Nada sai do seu computador.</p>
      </div>
      {!sheet ? <SheetLoader /> : <Analise sheet={sheet} />}
    </>
  );
}

function Analise({ sheet }) {
  const { columns, rows, numericColumns, fileName } = sheet;
  // Padrão: agrupa por uma coluna de categoria (nunca e-mail/nome/id) e soma a 1ª coluna numérica.
  const padrao = useMemo(() => pickDefaultChartColumns(columns, rows, numericColumns), [columns, rows, numericColumns]);
  const [agrupar, setAgrupar] = useState(padrao.agrupar);
  const [somar, setSomar] = useState(padrao.somar);
  const [tipo, setTipo] = useState("barra");

  // Quando troca de planilha, volta para as opções padrão
  useEffect(() => {
    setAgrupar(padrao.agrupar);
    setSomar(padrao.somar);
  }, [padrao]);

  const dados = useMemo(() => groupBy(rows, agrupar, somar || null, { limit: 15 }), [rows, agrupar, somar]);

  return (
    <>
      <SheetBar sheet={sheet} />

      <div className="grade">
        <KpiCard rotulo="Linhas" valor={formatNumber(rows.length, 0)} dica="registros na planilha" />
        <KpiCard rotulo="Colunas" valor={columns.length} dica={`${numericColumns.length} numérica(s)`} cor="amarelo" />
        {numericColumns.slice(0, 2).map((c) => (
          <KpiCard key={c} rotulo={`Soma de ${c}`} valor={formatNumber(sum(rows, c))} dica={`média ${formatNumber(average(rows, c))}`} cor="escuro" />
        ))}
      </div>

      <ChartCard
        titulo={somar ? `Soma de ${somar} por ${agrupar}` : `Quantidade de linhas por ${agrupar}`}
        descricao="Mostra os 15 maiores grupos."
        dados={dados}
        tipo={tipo}
      >
        <div className="linha-acoes" style={{ marginBottom: 12 }}>
          <label>
            Agrupar por
            <select value={agrupar} onChange={(e) => setAgrupar(e.target.value)}>
              {columns.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Somar (opcional)
            <select value={somar} onChange={(e) => setSomar(e.target.value)}>
              <option value="">— contar linhas —</option>
              {numericColumns.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Tipo
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="barra">Barras</option>
              <option value="pizza">Pizza</option>
            </select>
          </label>
        </div>
      </ChartCard>

      <DataTable titulo="Prévia (até 50 linhas; a busca e a exportação usam todas)" linhas={rows} colunas={columns} limite={50} nomeArquivo={`filtrado_${fileName.replace(/\.\w+$/, "")}.csv`} />
    </>
  );
}
