// Mensagem de erro amigável. <ErrorState titulo="..." mensagem="..." onTentarDeNovo={fn}>dicas</ErrorState>
// "texto" também funciona no lugar de "mensagem" (mesmo nome usado em EmptyState/LoadingState).
export default function ErrorState({ titulo = "Algo deu errado", mensagem, texto, onTentarDeNovo, children }) {
  mensagem = mensagem ?? texto;
  return (
    <div className="card estado erro" role="alert">
      <div className="icone">⚠️</div>
      <h3>{titulo}</h3>
      {mensagem && <p>{mensagem}</p>}
      {children}
      {onTentarDeNovo && <button onClick={onTentarDeNovo} style={{ marginTop: 10 }}>Tentar de novo</button>}
      <p className="subtitulo" style={{ marginTop: 12, fontSize: "0.85rem" }}>
        Dica: copie esta mensagem e cole no Claude Code com "deu erro".
      </p>
    </div>
  );
}
