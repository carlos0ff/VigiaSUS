# Post LinkedIn — VigiaSUS (TCC Ciência da Computação)

> Copie o texto abaixo direto para o LinkedIn.
> Sugestão de imagem: screenshot do grafo com nós vermelhos (empresas suspeitas) + dashboard com os KPIs de desvio.

---

## Texto do post

---

🏥 **Construí um sistema para rastrear o dinheiro que deveria chegar ao SUS — e não chega.**

(sim, é meu TCC. sim, ainda pode não terminar. mas se terminar, vai ser isso 😅)

---

Deixa eu te contar o problema que me tirou o sono nos últimos meses.

O Brasil destina **R$ 244 bilhões por ano ao SUS** pela Lei Orçamentária Anual. É dinheiro para hospital, medicamento, vacina, leito de UTI. É dinheiro do contribuinte, do trabalhador, do aposentado.

Estimativas do TCU e da CGU apontam que **mais de R$ 20 bilhões desse valor são desviados anualmente** — superfaturamento de insumos, empresas de fachada sem funcionários, licitações fraudadas, internações que nunca aconteceram sendo cobradas, e dinheiro que termina em contas offshore no exterior.

O problema não é falta de dado. O problema é que os dados existem — estão espalhados em **~40 bases governamentais diferentes**, cada uma num portal isolado, sem cruzamento, sem contexto, sem grafo.

---

**VigiaSUS** é meu Trabalho de Conclusão de Curso em Ciência da Computação — um sistema de vigilância cívica que cruza essas bases em um grafo unificado para tornar irregularidades visíveis.

A ideia central: **cada entidade é um nó, cada relação suspeita é uma aresta vermelha**.

Quando um hospital fecha contrato com uma empresa que foi aberta 3 meses antes da licitação, não tem funcionário registrado na RAIS e repassa 91% do valor para um intermediário que envia para conta nas Ilhas Cayman — isso não aparece em nenhum portal isolado. Mas aparece no grafo.

---

### As ~40 bases que o sistema integra (ou vai integrar):

**Saúde — Cadastros e Infraestrutura**
- CNES — Cadastro Nacional de Estabelecimentos de Saúde (338 mil unidades)
- SIGTAP — Tabela de Procedimentos, Medicamentos e OPM do SUS
- CADSUS — Cadastro de Usuários do SUS / Cartão Nacional de Saúde
- ANS — Operadoras e planos de saúde suplementar
- CFM / CRM estaduais — registro de médicos ativos
- CRF — registro de farmacêuticos
- RIPSA — Rede Interagencial de Informações para a Saúde

**Saúde — Epidemiologia e Mortalidade**
- SINAN — Sistema de Informação de Agravos de Notificação (200M+ notificações)
- SIM — Sistema de Informações sobre Mortalidade (90M+ DOs desde 1979)
- SINASC — Sistema de Informações sobre Nascidos Vivos (100M+ DNs)
- PNI — Programa Nacional de Imunizações (cobertura vacinal por município)
- PNS — Pesquisa Nacional de Saúde (IBGE)

**Saúde — Internações e Procedimentos**
- SIHSUS — Sistema de Informações Hospitalares (1,2 bilhão de AIHs)
- SIA/SUS — Sistema de Informações Ambulatoriais
- SIPAC — Sistema de Produção Ambulatorial e Cobrança

**Saúde — Medicamentos e Assistência Farmacêutica**
- BNAFAR-HORUS — estoque e dispensação da Farmácia do Povo / CEAF
- RENAME — Relação Nacional de Medicamentos Essenciais
- CMED/ANVISA — preços de referência de medicamentos
- DAF/SCTIE — compras centralizadas pelo Ministério da Saúde
- SCTIE — insumos estratégicos e hemoderivados

**Saúde — Financiamento**
- FNS — Fundo Nacional de Saúde (transferências fundo a fundo)
- SIOPS — Orçamentos Públicos em Saúde (execução por ente federativo)
- RREO — Relatórios Resumidos de Execução Orçamentária (Tesouro Nacional)
- API Dados Abertos Saúde — DATASUS / Ministério da Saúde

**Transparência — Contratos e Licitações**
- COMPRASNET / PNCP — contratos públicos federais (preço, fornecedor, objeto)
- Portal da Transparência (CGU) — repasses, convênios e obras
- SIGA/AGU — acordos e termos de ajustamento
- SAGRES / portais estaduais — contratos estaduais e municipais

**Transparência — Empresas Suspeitas**
- Receita Federal — CNPJ (abertura, sócios, natureza jurídica, situação)
- RAIS (MTE) — vínculos empregatícios declarados por empresa
- CEIS — Cadastro Nacional de Empresas Inidôneas e Suspensas (CGU)
- CNEP — Cadastro Nacional de Empresas Punidas (CGU)
- BNDES — financiamentos e beneficiários em saúde
- Diário Oficial da União — publicações de sanções, contratos e dispensas

**Transparência — Controle e Auditoria**
- TCU — acórdãos e representações em saúde
- CGU — relatórios de fiscalização e obras paradas
- MP/PGR — operações policiais e denúncias abertas (dados públicos)

**Contexto Socioeconômico**
- IBGE — censo, IDH municipal, PIB per capita, dados populacionais
- IDHM / Atlas Brasil — desenvolvimento humano por município
- PNSB — Saneamento Básico (correlação com indicadores de saúde)

---

### Stack técnica

- **Frontend**: Angular 21 + Cytoscape.js (grafo interativo) + Tailwind CSS
- **Backend**: Spring Boot 3 + Java 21
- **Banco de grafo**: Neo4j 5 (nós, arestas, queries Cypher)
- **Banco relacional**: PostgreSQL 16 (staging e histórico)
- **Algoritmos**: detecção de comunidades, centralidade, caminhos suspeitos
- **APIs ao vivo**: CNES + BNAFAR-HORUS (DATASUS, sem autenticação)
- **Open source**: AGPL-3.0 — porque dado público é bem público

---

### O que o sistema detecta hoje (modo simulado / mock)

✅ Contratos com fornecedores sem histórico (CNPJ novo + sem RAIS)
✅ Preços acima do percentil 95 do COMPRASNET (superfaturamento)
✅ Repasses sem prestação de contas no SIOPS após 12 meses
✅ AIHs com CID-10 atípico em volume estatisticamente improvável
✅ Estoques de medicamentos incompatíveis com capacidade declarada no CNES
✅ Redes de sócios compartilhados entre fornecedores concorrentes numa mesma licitação

---

### Por que isso importa pra mim, pessoalmente?

Porque esse dinheiro que some era para pagar o médico que não tem, o remédio que falta, o leito que o paciente não encontra. Cada real desviado do SUS é uma fila maior na UPA, uma internação negada, um recém-nascido sem vacina.

Ciência da Computação tem o poder de tornar opaco em transparente. Dados públicos têm o poder de transformar denúncia em prova. Grafo tem o poder de mostrar conexões que o olho humano nunca veria numa planilha.

Não sou da área jurídica. Não sou auditor do TCU. Mas sou programador — e isso, nesse contexto, é suficiente para construir algo que importa.

---

Se terminar o TCC (🙏😭), pretendo:

📌 Apresentar à banca com dados reais de pelo menos 5 municípios
📌 Publicar o dataset de cruzamento como open data
📌 Encaminhar os padrões suspeitos identificados ao Portal da Transparência / CGU

Se quiser acompanhar o desenvolvimento:
🔗 GitHub: github.com/carlos0ff/vigiasus
💬 Feedbacks, críticas e pull requests são muito bem-vindos

---

**TL;DR**: construí (estou construindo) um sistema que cruza ~40 bases de dados do governo para detectar corrupção e desvio de verbas na saúde pública. É meu TCC. Pode não terminar. Mas se terminar, vai ser o trabalho mais importante que já escrevi.

---

`#TCC` `#CienciadaComputacao` `#SaudePublica` `#SUS` `#Transparencia` `#AntiCorrupcao` `#OpenSource` `#Angular` `#Neo4j` `#SpringBoot` `#GrafoDeConhecimento` `#DadosAbertos` `#CGU` `#TCU` `#VigiaSUS` `#DataScience` `#BrazilTech` `#ProgramacaoParaOMundo`
