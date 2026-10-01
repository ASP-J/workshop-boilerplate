# Cardápio de prompts

Copie, cole no Claude Code e troque o que estiver entre `[colchetes]`.
Todos usam a planilha do workshop, `public/exemplos/capacitacao_workshop.csv` (colunas: email, area, categoria, curso, horas_capacitacao, status_capacitacao, nota, concluido_em). **Ela tem e-mails reais de usuários da Twygo:** use só no workshop, não compartilhe o arquivo e não tire print de tabelas com e-mails. Quando a sua área precisar de outra planilha, peça ao Claude para criar uma de exemplo com dados inventados (e-mails `@exemplo.com`).

> Dica: um pedido por vez. Depois de cada um, abra o endereço que o Claude indicar e confira.

---

## 0. Colocar o token da Twygo (sem colar no chat)

```text
Crie o .env a partir do .env.example e abra o arquivo para eu colar o token
```

O Claude abre o arquivo `.env`. Cole o token logo depois de `TWYGO_API_TOKEN=`, salve e responda:

```text
pronto
```

O Claude reinicia o sistema e confere se o token funcionou. **Nunca cole o token no chat.**

---

## 1. Rodada "pergunte ao Claude" (antes de construir)

```text
Eu trabalho em [setor] e minhas tarefas repetitivas são: [descreva 2 ou 3 tarefas que você faz toda semana].
Leia o CLAUDE.md deste projeto e me dê 5 ideias de automação que dá para fazer neste esqueleto,
só no meu computador, sem enviar dados para fora. Para cada ideia: o que faz, quanto tempo economiza
e qual página/peça do projeto usaria. Não altere nenhum arquivo ainda.
```

```text
Gostei da ideia [número]. Explique em 5 passos simples como você vai construir, e quais arquivos vai mexer.
Depois faça.
```

---

## 2. Por área

### RH
```text
Transforme a página Minha automação num painel de treinamentos usando public/exemplos/capacitacao_workshop.csv:
cards com total de pessoas, horas totais e % concluído; gráfico de horas por área;
tabela só com quem está "Em andamento", com botão de exportar.
```
```text
Crie uma página "Pendências de curso" que cruza a planilha carregada com os usuários da Twygo
e lista quem existe na Twygo mas ainda não concluiu o curso. Quero exportar essa lista em CSV.
```

### Financeiro
```text
Crie um exemplo public/exemplos/financeiro_despesas.csv (inventado: data, categoria, fornecedor, valor, centro_custo, status)
e transforme a página Minha automação num painel de despesas:
card de total gasto, total pendente e total atrasado; gráfico de valor por categoria;
tabela filtrável por centro de custo.
```
```text
Adicione um gráfico de despesas por mês (coluna data) e um alerta em vermelho listando as despesas "Atrasado"
acima de R$ 1.000.
```

### Vendas
```text
Crie um exemplo public/exemplos/vendas_leads.csv (inventado: data, empresa, contato_email @exemplo.com, origem, etapa, valor_estimado)
e monte um funil de vendas na página Minha automação:
quantidade e valor estimado por etapa (Novo, Qualificado, Proposta, Negociação, Ganho, Perdido),
taxa de conversão (Ganho ÷ total) e gráfico de leads por origem.
```
```text
Crie uma página "Leads parados" que mostra leads em Proposta ou Negociação há mais de 30 dias
(pela coluna data), ordenados pelo maior valor estimado, com exportar CSV.
```

### Atendimento
```text
Crie um arquivo de exemplo public/exemplos/atendimento_chamados.csv com 40 chamados inventados
(data, cliente_email @exemplo.com, assunto, canal, prioridade, status, tempo_resposta_horas)
e adicione ele aos botões de exemplo. Depois monte na Minha automação: chamados por assunto,
tempo médio de resposta e lista dos abertos de prioridade alta.
```
```text
Na Minha automação, agrupe os chamados pelos 5 assuntos mais frequentes e, para cada um,
gere um rascunho de resposta padrão (texto fixo no código, sem usar IA externa) que eu possa copiar.
```

### Marketing
```text
Crie um exemplo public/exemplos/marketing_campanhas.csv (inventado: campanha, canal, data, investimento,
cliques, leads) e um painel com custo por lead por canal, gráfico de leads por mês e ranking de campanhas.
```
```text
Usando vendas_leads.csv (se ainda não existir, crie primeiro com o prompt de Vendas acima), mostre quais origens (Site, Evento, LinkedIn...) geram mais valor estimado
e mais leads Ganhos. Quero um gráfico de pizza e uma tabela.
```

### Produto
```text
Crie um exemplo public/exemplos/produto_feedbacks.csv (inventado: data, cliente_email @exemplo.com,
funcionalidade, nota_1_a_5, comentario) e um painel com nota média por funcionalidade,
quantidade de feedbacks por mês e lista dos comentários com nota 1 ou 2.
```
```text
Adicione na Minha automação uma busca por palavra-chave nos comentários e um contador de
quantas vezes cada palavra aparece (ignorando palavras comuns como "de", "a", "o").
```

### Engenharia
```text
Crie um exemplo public/exemplos/engenharia_tarefas.csv (inventado: id, titulo, responsavel_email @exemplo.com,
status, pontos, data_abertura, data_fechamento) e mostre: tarefas por status, pontos entregues por pessoa
e tempo médio de fechamento em dias.
```
```text
Cruze os responsáveis do engenharia_tarefas.csv com os usuários da Twygo e mostre o departamento de cada um.
Explique o código que você escreveu para o cruzamento em linguagem simples.
```

### BI
```text
Na página Minha planilha, adicione a opção de escolher um filtro (coluna + valor) antes do gráfico,
e que o resumo, o gráfico e a exportação respeitem esse filtro.
```
```text
Crie uma página "Comparar planilhas" onde eu carrego dois CSVs e vejo quais linhas estão em um e não no outro,
comparando por uma coluna que eu escolho (ex.: email).
```

---

## 3. Pedidos genéricos

| Quero... | Cole isto |
|---|---|
| Mudar título/cor | `Mude o nome do painel para "[nome]", o setor para "[setor]" e a cor principal para [cor].` |
| Um card novo | `Na página [página], adicione um card com [o que contar/somar] usando a coluna [coluna].` |
| Um gráfico novo | `Na página [página], adicione um gráfico de [barras/pizza] de [coluna] por [coluna].` |
| Filtro por data | `Adicione um filtro "de / até" pela coluna [data] na página [página] e aplique em tudo.` |
| Exportar | `Adicione um botão que exporta [o quê] em CSV para eu abrir no Excel.` |
| Página nova | `Crie uma página nova chamada "[nome]" no menu, baseada na Minha automação.` |
| Entender o código | `Explique, sem termos técnicos, o que o arquivo [arquivo] faz.` |
| Ver o que mudou | `Explique o que mudou desde o começo, em linguagem simples.` |
| Desfazer | `Desfaça a última mudança que você fez.` |
| Erro | `deu erro: [cole a mensagem]` |
