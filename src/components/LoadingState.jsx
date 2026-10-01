// Indicador de "carregando". <LoadingState texto="Buscando usuários..." />
export default function LoadingState({ texto = "Carregando..." }) {
  return (
    <div className="carregando" role="status">
      <span className="girando" aria-hidden="true" />
      {texto}
    </div>
  );
}
