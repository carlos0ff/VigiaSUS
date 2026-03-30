# VigiaSUS — Transparência em Saúde Pública

> Post para LinkedIn — PT-BR

---

Defendi meu TCC em Ciência da Computação e o projeto que apresentei foi uma ferramenta que cruza 40 bases de dados públicas do SUS para detectar irregularidades no sistema de saúde brasileiro.

Quatro anos de graduação resultaram nisso: um sistema que faz em segundos o que uma auditoria do TCU leva meses para fazer manualmente.

---

**O problema que quis resolver**

O Brasil investe mais de R$ 180 bilhões por ano em saúde pública. Esses dados existem, são abertos e obrigatórios por lei. Mas estão fragmentados em dezenas de portais que nunca conversaram entre si — DATASUS, CNES, SINAN, FNS, SIHSUS, BNAFAR, ANVISA, entre outros.

Nenhuma ferramenta conectava tudo isso de forma navegável. Resolvi construir uma.

---

**O que o VigiaSUS encontra**

Com o CNPJ ou o código CNES de qualquer estabelecimento de saúde, o sistema cruza 40 fontes e traça automaticamente um grafo de relações. Em uma demonstração com dados reais, ele identificou:

- 💰 R$ 4,2 milhões em repasses do FNS para uma UBS com **leitos declarados no CNES que não existem fisicamente**
- 👻 12 profissionais de saúde com **vínculos ativos simultâneos em 3 unidades**, a 400 km de distância entre si
- 🏥 Um hospital faturando AIHs de **alta complexidade sem o equipamento registrado no CNES**
- 💊 R$ 890 mil em entregas da Farmácia Popular para uma farmácia **descredenciada há 8 meses**

Confiança média dos cruzamentos: 89%. Fontes consultadas: 14 bases simultâneas.

---

**A arquitetura**

O coração do sistema é um **grafo de conhecimento em saúde** — cada hospital, UBS, profissional, medicamento, repasse e procedimento vira um nó. As relações entre eles viram arestas. Quando há inconsistência, ela aparece como um padrão anômalo na rede.

Para chegar nisso, precisei:

→ Modelar e normalizar 40 bases heterogêneas com schemas diferentes
→ Construir pipelines de ETL que rodam periodicamente e atualizam o grafo
→ Desenvolver algoritmos de detecção de padrões sobre estruturas de grafo
→ Criar uma interface que tornasse esse grafo navegável por qualquer pessoa

---

**Stack técnica**

| Camada | Tecnologia |
|---|---|
| Graph Database | Neo4j 5 — modelo de nós e arestas |
| Backend / ETL | Spring Boot (Java 21) — pipelines e API REST |
| Frontend | Angular 21 + Cytoscape.js — visualização do grafo |
| Fontes | CNES, SINAN, SIM, SINASC, SIHSUS, FNS, ANVISA, BNAFAR + 32 outras |

---

**O que aprendi além do código**

Trabalhar com dados públicos de saúde exige mais do que habilidade técnica. Aprendi que:

- Dado aberto não é dado limpo — boa parte do trabalho foi de normalização e deduplicação
- Padrão detectado não é crime provado — o sistema mostra *sinais*, não acusa ninguém
- Escala importa — o SIHSUS sozinho tem 1,2 bilhão de registros; escolhas de arquitetura fazem diferença real
- O problema mais difícil não foi o algoritmo — foi entender o domínio da saúde pública brasileira

---

**Próximos passos**

O código será publicado como open source em breve em **github.com/carlos0ff/vigiasus**.

A saúde pública é de todos. A capacidade de fiscalizá-la também deveria ser.

Se você trabalha com saúde pública, controle interno, jornalismo de dados, ou tem curiosidade sobre como o dinheiro do SUS circula — me manda uma mensagem.

---

*Agradeço ao meu orientador, à banca e a todos que acompanharam esse projeto do início ao fim.*

---

`#TCC #CiênciadaComputação #Graduação #SaúdePública #VigiaSUS #DATASUS #SUS #SpringBoot #Angular #Neo4j #OpenData #GovTech #CivicTech #Java #Transparência`
