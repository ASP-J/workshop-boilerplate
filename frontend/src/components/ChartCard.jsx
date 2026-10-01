// =============================================================================
// Card com gráfico (Recharts). Recebe dados no formato [{ name, value }].
//   <ChartCard titulo="Horas por setor" dados={dados} tipo="barra" />
//   tipo: "barra" (padrão) | "pizza"
// As cores vêm das variáveis --grafico-1..8 do styles.css.
// =============================================================================
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "../lib/aggregate.js";
import EmptyState from "./EmptyState.jsx";

const FALLBACK = ["#7b2cbf", "#e8b02a", "#5b3492", "#2e9e6a", "#d9669b", "#3f7fd1", "#b58be0", "#1b1f3a"];

export function chartPalette() {
  if (typeof window === "undefined") return FALLBACK;
  const styles = getComputedStyle(document.documentElement);
  return FALLBACK.map((fallback, i) => styles.getPropertyValue(`--grafico-${i + 1}`).trim() || fallback);
}

export default function ChartCard({ titulo, descricao, dados = [], tipo = "barra", altura = 300, children }) {
  const cores = chartPalette();
  const vazio = !dados.length;

  return (
    <div className="card">
      <h3>{titulo}</h3>
      {descricao && <p className="subtitulo">{descricao}</p>}
      {children}
      {vazio ? (
        <EmptyState icone="📊" titulo="Sem dados para o gráfico" texto="Carregue uma planilha ou escolha outra coluna." />
      ) : (
        <div style={{ width: "100%", height: altura }}>
          <ResponsiveContainer>
            {tipo === "pizza" ? (
              <PieChart>
                <Pie data={dados} dataKey="value" nameKey="name" outerRadius="80%" innerRadius="45%" paddingAngle={2}>
                  {dados.map((_, i) => <Cell key={i} fill={cores[i % cores.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatNumber(v)} />
                <Legend />
              </PieChart>
            ) : (
              <BarChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4dcef" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={dados.length > 6 ? -25 : 0} textAnchor={dados.length > 6 ? "end" : "middle"} height={dados.length > 6 ? 70 : 30} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatNumber(v, 0)} />
                <Tooltip formatter={(v) => formatNumber(v)} cursor={{ fill: "rgba(123,44,191,0.08)" }} />
                <Bar dataKey="value" name="Valor" radius={[6, 6, 0, 0]}>
                  {dados.map((_, i) => <Cell key={i} fill={cores[i % cores.length]} />)}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
