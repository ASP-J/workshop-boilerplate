// =============================================================================
// Área para soltar/escolher um arquivo .csv ou .xlsx.
//   <FileUpload onArquivo={(file) => ...} />
// O arquivo é lido NO NAVEGADOR. Só vai para o banco local se a pessoa clicar em "Salvar no banco".
// =============================================================================
import { useRef, useState } from "react";

export default function FileUpload({ onArquivo, aceita = ".csv,.xlsx", texto = "Arraste sua planilha aqui (.csv ou .xlsx)" }) {
  const input = useRef(null);
  const [arrastando, setArrastando] = useState(false);

  function receber(files) {
    const file = files?.[0];
    if (file) onArquivo(file);
  }

  return (
    <div
      className={`upload ${arrastando ? "arrastando" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(e) => { e.preventDefault(); setArrastando(false); receber(e.dataTransfer.files); }}
    >
      <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>📄 {texto}</p>
      <p className="subtitulo">ou</p>
      <button onClick={() => input.current?.click()}>Escolher arquivo</button>
      <input ref={input} type="file" accept={aceita} onChange={(e) => { receber(e.target.files); e.target.value = ""; }} />
      <p className="subtitulo" style={{ marginTop: 10, fontSize: "0.85rem" }}>🔒 O arquivo é lido no seu navegador. Nada sai do seu computador.</p>
    </div>
  );
}
