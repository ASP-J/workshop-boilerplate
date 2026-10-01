// Caixa com as regras de ouro do workshop. Aparece na página Início.
export default function RulesBox() {
  return (
    <div className="regras">
      <h3>⭐ Regras de ouro</h3>
      <ul>
        <li>Tudo roda <strong>só no seu computador</strong> (endereço 127.0.0.1 / localhost).</li>
        <li><strong>Nunca publique</strong> em servidor, nuvem, Vercel, Dokploy ou GitHub público. Publicar exige auditoria do João, da Adriana ou de um dev.</li>
        <li><strong>Nunca mostre nem compartilhe o token</strong> (arquivo .env). Nem no chat, nem em print. Ele é colado direto no arquivo .env.</li>
        <li><strong>LGPD:</strong> não envie dados reais de colaboradores ou clientes para serviços externos. A planilha do workshop tem <strong>e-mails reais</strong>: use só no workshop, não compartilhe e não tire print de tabelas com e-mails.</li>
        <li>Na dúvida, pergunte ao Claude: <em>"isso é seguro?"</em></li>
      </ul>
    </div>
  );
}
