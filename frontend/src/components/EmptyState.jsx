// Mensagem amigável quando não há dados. <EmptyState titulo="..." texto="...">botões opcionais</EmptyState>
export default function EmptyState({ icone = "📭", titulo, texto, children }) {
  return (
    <div className="estado">
      <div className="icone">{icone}</div>
      <h3>{titulo}</h3>
      {texto && <p className="subtitulo">{texto}</p>}
      {children}
    </div>
  );
}
