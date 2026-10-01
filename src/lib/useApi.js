// =============================================================================
// Hook para buscar dados do servidor local com estados prontos.
//   const { dados, erro, carregando, recarregar } = useApi("/api/twygo/status");
// =============================================================================
import { useCallback, useEffect, useState } from "react";
import { apiGet } from "./api.js";

export function useApi(path) {
  const [estado, setEstado] = useState({ dados: null, erro: null, carregando: true });

  const recarregar = useCallback(async () => {
    setEstado((s) => ({ ...s, carregando: true, erro: null }));
    try {
      setEstado({ dados: await apiGet(path), erro: null, carregando: false });
    } catch (erro) {
      setEstado({ dados: null, erro, carregando: false });
    }
  }, [path]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { ...estado, recarregar };
}
