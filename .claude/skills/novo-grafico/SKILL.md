---
name: novo-grafico
description: Adiciona um gráfico (barra, pizza, linha) ou card de número a uma página. Use quando o usuário pedir "gráfico", "chart", "visualizar", "card com total", "indicador", "KPI".
---

# Novo gráfico

1. Pergunte (se não estiver claro): qual página, agrupar por qual coluna, somar qual coluna (ou só contar).
2. Barra/pizza: use `ChartCard` com dados `[{ name, value }]`:
   ```jsx
   import { groupBy } from "../lib/aggregate.js";
   import ChartCard from "../components/ChartCard.jsx";
   const dados = useMemo(() => groupBy(rows, "categoria", "valor", { limit: 10 }), [rows]);
   <ChartCard titulo="Valor por categoria" dados={dados} tipo="barra" />  // ou tipo="pizza"
   ```
3. Card de número: `<KpiCard rotulo="Total" valor={formatNumber(sum(rows, "valor"))} dica="..." cor="amarelo" />`.
4. Linha ao longo do tempo: agrupe por mês (`row.data.slice(0, 7)`) numa função em `src/lib/` com teste, e use `LineChart` do Recharts dentro de `<div className="card">`, com cores de `chartPalette()` (de `ChartCard.jsx`).
5. Cores: só `var(--...)` / `chartPalette()`. Nada de cor solta.
6. Pizza com mais de ~7 fatias fica ilegível → use barra ou `limit`.
7. **Nunca agrupe por e-mail, nome ou id** (vira uma barra por pessoa e expõe dados pessoais). Para escolher a coluna padrão use `pickDefaultChartColumns(columns, rows, numericColumns)` de `src/lib/chartDefaults.js`.
8. `npm test && npm run build`. Termine com o endereço e o que olhar.
