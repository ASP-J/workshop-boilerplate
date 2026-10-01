// =============================================================================
// Guarda a planilha carregada para que as páginas "Minha planilha" e
// "Cruzar planilha × Twygo" usem o mesmo arquivo.
//
// Onde fica: SÓ no navegador, no "sessionStorage" desta aba. Assim ela continua
// lá se você recarregar a página ou digitar o endereço de novo, mas SOME quando
// a aba é fechada (ou ao clicar em "Limpar planilha"). Para guardar de vez, o botão
// "Salvar no banco" manda para o banco local (ver src/lib/planilhasSalvas.js).
//
// Se a planilha for grande demais para o navegador guardar, ela continua
// funcionando na memória (até recarregar) e a tela mostra um aviso pequeno.
//
//   setSheet(sheet)  -> guarda (sheet = { fileName, columns, rows, numericColumns, savedId? })
//   clearSheet()     -> apaga da tela e do navegador
//   useSheet()       -> hook React; devolve a planilha (com .persisted true/false) ou null
// =============================================================================
import { useSyncExternalStore } from "react";

export const STORAGE_KEY = "painel-workshop:planilha";

function browserStorage() {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null; // navegador bloqueou o acesso (modo privado, configuração etc.)
  }
}

/** Cria um "guardador" de planilha. Exportado para os testes usarem um storage falso. */
export function createSheetStore(getStorage = browserStorage) {
  const listeners = new Set();
  let current = load();

  function load() {
    try {
      const raw = getStorage()?.getItem(STORAGE_KEY);
      if (!raw) return null;
      const sheet = JSON.parse(raw);
      return Array.isArray(sheet?.rows) && Array.isArray(sheet?.columns) ? { ...sheet, persisted: true } : null;
    } catch {
      return null; // conteúdo estragado: começa sem planilha
    }
  }

  function save(sheet) {
    const storage = getStorage();
    if (!storage) return false;
    try {
      if (sheet) {
        const { persisted, ...data } = sheet; // eslint-disable-line no-unused-vars
        storage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        storage.removeItem(STORAGE_KEY);
      }
      return true;
    } catch {
      // Normalmente "QuotaExceededError": planilha grande demais. Não guarda, só avisa.
      try {
        storage.removeItem(STORAGE_KEY);
      } catch {
        /* nada a fazer */
      }
      return false;
    }
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  return {
    setSheet(sheet) {
      const persisted = save(sheet);
      current = sheet ? { ...sheet, persisted } : null;
      notify();
      return persisted;
    },
    clearSheet() {
      save(null);
      current = null;
      notify();
    },
    getSheet: () => current,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

const store = createSheetStore();

export const setSheet = store.setSheet;
export const clearSheet = store.clearSheet;
export const getSheet = store.getSheet;

/** Hook React: const sheet = useSheet(); (null se nada foi carregado) */
export function useSheet() {
  return useSyncExternalStore(store.subscribe, store.getSheet);
}
