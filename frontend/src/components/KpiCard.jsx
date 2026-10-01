// Cartão com um número grande. Ex.: <KpiCard rotulo="Total" valor={120} dica="linhas" cor="amarelo" />
// cor: "roxo" (padrão) | "amarelo" | "escuro" | "verde" | "vermelho"
export default function KpiCard({ rotulo, valor, dica, cor = "roxo" }) {
  return (
    <div className={`card kpi ${cor}`}>
      <div className="rotulo">{rotulo}</div>
      <div className="valor">{valor}</div>
      {dica && <div className="dica">{dica}</div>}
    </div>
  );
}
