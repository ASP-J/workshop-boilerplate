import { describe, expect, it, vi } from "vitest";
import { createSheetStore, STORAGE_KEY } from "./sheetStore.js";

function fakeStorage() {
  const data = new Map();
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k)
  };
}

const sheet = { fileName: "teste.csv", columns: ["area", "horas"], rows: [{ area: "RH", horas: 2 }], numericColumns: ["horas"] };

describe("sheetStore", () => {
  it("guarda no sessionStorage e recupera depois de recarregar a página", () => {
    const storage = fakeStorage();
    const primeiraVisita = createSheetStore(() => storage);
    expect(primeiraVisita.getSheet()).toBeNull();
    expect(primeiraVisita.setSheet(sheet)).toBe(true);
    expect(primeiraVisita.getSheet()).toEqual({ ...sheet, persisted: true });

    const depoisDoReload = createSheetStore(() => storage);
    expect(depoisDoReload.getSheet()).toEqual({ ...sheet, persisted: true });
  });

  it("clearSheet apaga da memória e do navegador", () => {
    const storage = fakeStorage();
    const store = createSheetStore(() => storage);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setSheet(sheet);
    store.clearSheet();
    expect(store.getSheet()).toBeNull();
    expect(storage.data.has(STORAGE_KEY)).toBe(false);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("planilha grande demais (quota) continua na memória, sem guardar e sem quebrar", () => {
    const storage = fakeStorage();
    storage.setItem = () => {
      throw Object.assign(new Error("cheio"), { name: "QuotaExceededError" });
    };
    const store = createSheetStore(() => storage);
    expect(store.setSheet(sheet)).toBe(false);
    expect(store.getSheet()).toEqual({ ...sheet, persisted: false });
    expect(createSheetStore(() => storage).getSheet()).toBeNull();
  });

  it("funciona sem sessionStorage (ex.: navegador bloqueado) e ignora conteúdo estragado", () => {
    const semStorage = createSheetStore(() => null);
    expect(semStorage.setSheet(sheet)).toBe(false);
    expect(semStorage.getSheet().rows).toHaveLength(1);

    const storage = fakeStorage();
    storage.setItem(STORAGE_KEY, "{isso não é json");
    expect(createSheetStore(() => storage).getSheet()).toBeNull();
  });
});
