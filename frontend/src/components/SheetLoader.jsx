// =============================================================================
// Bloco completo de "carregar planilha": upload + botão da planilha do workshop.
// Ao carregar, guarda a planilha no sheetStore (compartilhada entre páginas e
// guardada só nesta aba do navegador até fechar a aba ou clicar em "Limpar planilha").
//
// <SheetBar sheet={sheet} /> mostra o nome do arquivo + botão "Limpar planilha".
// =============================================================================
import { useState } from "react";
import { parseCsvText, parseSheetFile } from "../lib/parseSheet.js";
import { clearSheet, setSheet } from "../lib/sheetStore.js";
import FileUpload from "./FileUpload.jsx";
import LoadingState from "./LoadingState.jsx";

// A planilha do workshop tem e-mails REAIS da Twygo: use só no workshop.
// Para adicionar um exemplo NOVO: crie o arquivo em public/exemplos/ com dados
// inventados (e-mails @exemplo.com) e adicione uma linha aqui.
export const EXEMPLOS = [
  { arquivo: "capacitacao_workshop.csv", rotulo: "Capacitação do workshop" }
];

export default function SheetLoader() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregar(promessa, fileName) {
    setCarregando(true);
    setErro("");
    try {
      const sheet = await promessa;
      if (!sheet.rows.length) throw new Error("A planilha está vazia ou só tem o cabeçalho.");
      setSheet({ ...sheet, fileName });
    } catch (e) {
      setErro(e.message || "Não consegui ler esse arquivo.");
    } finally {
      setCarregando(false);
    }
  }

  async function usarExemplo(arquivo) {
    const resposta = await fetch(`/exemplos/${arquivo}`);
    return parseCsvText(await resposta.text());
  }

  return (
    <div className="card">
      <FileUpload onArquivo={(file) => carregar(parseSheetFile(file), file.name)} />
      <div className="linha-acoes" style={{ marginTop: 14 }}>
        <strong>Ou use a planilha do workshop:</strong>
        {EXEMPLOS.map((ex) => (
          <button key={ex.arquivo} className="secundario" onClick={() => carregar(usarExemplo(ex.arquivo), ex.arquivo)}>
            {ex.rotulo}
          </button>
        ))}
      </div>
      <p className="subtitulo" style={{ marginTop: 10, fontSize: "0.85rem" }}>
        ⚠️ A planilha do workshop tem <strong>e-mails reais da Twygo</strong>: use só no workshop, não compartilhe o arquivo
        e não tire print de tabelas com e-mails.
      </p>
      {carregando && <LoadingState texto="Lendo a planilha..." />}
      {erro && <p className="selo nao" style={{ marginTop: 12 }}>{erro}</p>}
    </div>
  );
}

/** Faixa com o nome do arquivo carregado e o botão "Limpar planilha". */
export function SheetBar({ sheet }) {
  return (
    <div className="linha-acoes">
      <span className="selo neutro">Planilha: {sheet.fileName}</span>
      <button className="secundario" onClick={clearSheet}>Limpar planilha</button>
      <span className="subtitulo" style={{ fontSize: "0.85rem" }}>
        {sheet.persisted
          ? "Fica guardada só nesta aba do navegador (some ao fechar a aba)."
          : "Planilha grande demais para guardar no navegador: se recarregar a página, carregue de novo."}
      </span>
    </div>
  );
}
