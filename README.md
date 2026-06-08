# VigiaSUS — Vigilância de Irregularidades no SUS

> Sistema de cruzamento de ~40 bases públicas do SUS para detecção de desvios, superfaturamento e lavagem de dinheiro em saúde pública brasileira.

[![Angular](https://img.shields.io/badge/Angular-21-dd0031?style=flat-square&logo=angular)](https://angular.io)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6db33f?style=flat-square&logo=springboot)](https://spring.io)
[![Neo4j](https://img.shields.io/badge/Neo4j-5-008cc1?style=flat-square&logo=neo4j)](https://neo4j.com)
[![License](https://img.shields.io/badge/Licença-AGPL--3.0-blue?style=flat-square)](LICENSE)

---

## O que é

O Brasil destina **R$ 244 bilhões/ano ao SUS**. Estimativas do TCU e da CGU indicam que mais de **R$ 20 bilhões são desviados anualmente** via superfaturamento, empresas fantasma e fraudes em AIH.

O problema não é falta de dado — é que os dados estão dispersos em ~40 bases governamentais sem cruzamento entre si.

O VigiaSUS conecta essas bases em um **grafo de conhecimento** interativo: cada hospital, repasse, CNPJ e medicamento vira um nó; cada relação suspeita vira uma aresta vermelha. O que portais isolados ocultam, o grafo revela.

**TCC — Ciência da Computação** (em desenvolvimento 🙏)

---

## Demo rápida

O frontend funciona **sem backend** usando dados mock realistas:

```bash
git clone https://github.com/carlos0ff/vigiasus.git
cd vigiasus/frontend
npm install
npm start
# Acesse http://localhost:4200
```

---

## Pré-requisitos

| Ferramenta   | Versão mínima | Necessário para          |
|--------------|---------------|--------------------------|
| Node.js      | 22+           | Frontend                 |
| npm          | 10+           | Frontend                 |
| Java         | 21            | Backend                  |
| Maven        | 3.9+          | Backend (ou use `mvnw`)  |
| Neo4j        | 5+            | Backend — grafo          |
| PostgreSQL   | 16+           | Backend — staging / ETL  |
| Docker       | 24+           | Stack completa (opcional)|

---

## Rodando o projeto

### Modo 1 — Frontend standalone (recomendado para começar)

Não precisa de Java, Neo4j nem PostgreSQL. O frontend já vem com dados mock que simulam irregularidades reais.

```bash
cd frontend
npm install
npm start
```

Acesse **http://localhost:4200**

O que você vai ver:
- **Dashboard** — KPIs nacionais de desvio, alertas ativos, gráfico orçamento × desviado
- **Grafo interativo** — nós verdes (entidades legítimas) e nós vermelhos (empresas suspeitas/offshore)
- **Aba Investimentos** — orçado × executado × desviado por ano (2020–2024)
- **Aba Desvios** — alertas com severidade, fluxo de lavagem reconstruído
- **APIs ao vivo** — se tiver internet, o grafo busca dados reais do DATASUS automaticamente

#### APIs do governo integradas (sem autenticação)

Base: `https://apidadosabertos.saude.gov.br`
O proxy do Angular dev-server elimina restrições de CORS em desenvolvimento.

| API | Endpoint | Uso |
|-----|----------|-----|
| CNES — Estabelecimentos | `GET /cnes/estabelecimentos/{codigo_cnes}` | Nome, tipo, gestão, UF, CNPJ do estabelecimento |
| DAF — Estoque BNAFAR-HORUS | `GET /daf/estoque-medicamentos-bnafar-horus?codigo_cnes={id}` | Medicamentos por programa, quantidade e validade |

> Para testar com dados reais, busque pelo CNES `2078015` (Hospital das Clínicas da FMUSP).

---

### Modo 2 — Backend + Bancos (stack completa)

#### 2.1 Subindo os bancos com Docker

```bash
# Neo4j — banco de grafo (porta 7687 + UI na 7474)
docker run -d --name vigisus-neo4j \
  -e NEO4J_AUTH=neo4j/vigisus123 \
  -e NEO4J_PLUGINS='["apoc"]' \
  -p 7474:7474 -p 7687:7687 \
  neo4j:5

# PostgreSQL — staging e histórico (porta 5432)
docker run -d --name vigisus-pg \
  -e POSTGRES_DB=vigisus \
  -e POSTGRES_USER=vigisus \
  -e POSTGRES_PASSWORD=vigisus123 \
  -p 5432:5432 \
  postgres:16
```

#### 2.2 Configurando o backend

Edite `backend/src/main/resources/application.properties`:

```properties
# Neo4j
spring.neo4j.uri=bolt://localhost:7687
spring.neo4j.authentication.username=neo4j
spring.neo4j.authentication.password=vigisus123

# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/vigisus
spring.datasource.username=vigisus
spring.datasource.password=vigisus123

# Servidor
server.port=8080
```

#### 2.3 Rodando o backend

```bash
cd backend

# Com Maven instalado:
mvn spring-boot:run

# Ou com o wrapper incluso (não precisa de Maven):
./mvnw spring-boot:run
```

API disponível em **http://localhost:8080**

#### 2.4 Rodando o frontend apontando para o backend

```bash
cd frontend
npm start
# O proxy.conf.json já redireciona /api/* para http://localhost:8080
```

---

### Modo 3 — Docker Compose (stack completa de uma vez)

```bash
# Na raiz do projeto:
docker compose up --build

# Para rodar em background:
docker compose up --build -d

# Para parar:
docker compose down
```

| Serviço     | URL                        |
|-------------|----------------------------|
| Frontend    | http://localhost:4200       |
| Backend API | http://localhost:8080       |
| Neo4j UI    | http://localhost:7474       |
| PostgreSQL  | localhost:5432              |

> **Credenciais padrão Neo4j:** `neo4j` / `vigisus123`
> **Credenciais padrão PostgreSQL:** `vigisus` / `vigisus123`

---

### Build de produção (frontend)

```bash
cd frontend
npm run build
# Output em: frontend/dist/frontend/browser/
```

---

## Bases de dados integradas (~40)

### Saúde — Cadastros e Infraestrutura
| Base | Descrição |
|------|-----------|
| CNES | Cadastro Nacional de Estabelecimentos de Saúde (338k unidades) |
| SIGTAP | Tabela de Procedimentos, Medicamentos e OPM do SUS |
| CADSUS | Cadastro de Usuários do SUS / Cartão Nacional de Saúde |
| ANS | Operadoras e planos de saúde suplementar |
| CFM / CRM | Registro de médicos ativos por estado |
| CRF | Registro de farmacêuticos |
| RIPSA | Rede Interagencial de Informações para a Saúde |

### Saúde — Epidemiologia e Mortalidade
| Base | Descrição |
|------|-----------|
| SINAN | Agravos de Notificação (200M+ notificações) |
| SIM | Mortalidade — declarações de óbito desde 1979 |
| SINASC | Nascidos Vivos (100M+ DNs) |
| PNI | Programa Nacional de Imunizações |
| PNS | Pesquisa Nacional de Saúde (IBGE) |

### Saúde — Internações e Procedimentos
| Base | Descrição |
|------|-----------|
| SIHSUS | Internações Hospitalares (1,2 bilhão de AIHs) |
| SIA/SUS | Sistema de Informações Ambulatoriais |
| SIPAC | Produção Ambulatorial e Cobrança |

### Saúde — Medicamentos e Assistência Farmacêutica
| Base | Descrição |
|------|-----------|
| BNAFAR-HORUS | Estoque e dispensação — Farmácia Popular / CEAF |
| RENAME | Relação Nacional de Medicamentos Essenciais |
| CMED/ANVISA | Preços de referência de medicamentos |
| DAF/SCTIE | Compras centralizadas pelo Ministério da Saúde |
| SCTIE | Insumos estratégicos e hemoderivados |

### Saúde — Financiamento
| Base | Descrição |
|------|-----------|
| FNS | Fundo Nacional de Saúde — transferências fundo a fundo |
| SIOPS | Orçamentos Públicos em Saúde por ente federativo |
| RREO | Relatórios de Execução Orçamentária (Tesouro Nacional) |
| API DATASUS | Dados abertos — Ministério da Saúde |

### Transparência — Contratos e Licitações
| Base | Descrição |
|------|-----------|
| COMPRASNET / PNCP | Contratos públicos federais — preço, fornecedor, objeto |
| Portal da Transparência | Repasses, convênios e obras (CGU) |
| SIGA/AGU | Acordos e termos de ajustamento |
| SAGRES | Contratos estaduais e municipais |

### Transparência — Empresas Suspeitas
| Base | Descrição |
|------|-----------|
| Receita Federal — CNPJ | Abertura, sócios, natureza jurídica, situação |
| RAIS (MTE) | Vínculos empregatícios declarados por empresa |
| CEIS | Cadastro de Empresas Inidôneas e Suspensas (CGU) |
| CNEP | Cadastro de Empresas Punidas (CGU) |
| BNDES | Financiamentos e beneficiários em saúde |
| Diário Oficial da União | Sanções, contratos e dispensas publicadas |

### Transparência — Controle e Auditoria
| Base | Descrição |
|------|-----------|
| TCU | Acórdãos e representações em saúde |
| CGU | Relatórios de fiscalização e obras paradas |
| MP/PGR | Operações e denúncias abertas (dados públicos) |

### Contexto Socioeconômico
| Base | Descrição |
|------|-----------|
| IBGE | Censo, IDH municipal, PIB per capita |
| IDHM / Atlas Brasil | Desenvolvimento humano por município |
| PNSB | Saneamento básico — correlação com indicadores de saúde |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│  FONTES (~40 bases)                                     │
│  CNES · SIHSUS · SINAN · FNS · BNAFAR · COMPRASNET ... │
└───────────────────┬─────────────────────────────────────┘
                    │ ETL / pipelines
                    ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND  Spring Boot 3 · Java 21                       │
│  ┌──────────────────┐   ┌──────────────────────────┐   │
│  │ PostgreSQL 16    │   │ Neo4j 5                  │   │
│  │ staging · audit  │   │ grafo de conhecimento    │   │
│  └──────────────────┘   └──────────────────────────┘   │
│  REST API · detecção de padrões · alertas               │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTP / JSON
                    ▼
┌─────────────────────────────────────────────────────────┐
│  FRONTEND  Angular 21                                   │
│  Cytoscape.js · Tailwind CSS                            │
│  Grafo interativo · Dashboard · Alertas · Desvios       │
└─────────────────────────────────────────────────────────┘
```

---

## Funcionalidades implementadas

- [x] Grafo interativo com Cytoscape.js — nós coloridos por tipo, arestas direcionais
- [x] Nós vermelhos para empresas suspeitas (diamond) e contas offshore (pentagon)
- [x] Arestas laranja/vermelho para contratos suspeitos e fluxos de lavagem
- [x] Dashboard com KPIs nacionais de desvio (orçado × desviado)
- [x] Aba **Investimentos** — barras anuais orçado × executado × desviado
- [x] Aba **Desvios** — alertas por severidade + fluxo de lavagem visual
- [x] Integração ao vivo com CNES + BNAFAR-HORUS (DATASUS)
- [x] Modo mock completo (funciona offline)
- [ ] ETL automatizado das 40 bases
- [ ] Algoritmos de detecção de comunidades (Neo4j GDS)
- [ ] Cruzamento CNPJ × RAIS × COMPRASNET
- [ ] Exportação de relatórios para CGU / TCU

---

## Aviso legal

VigiaSUS é uma ferramenta de transparência e vigilância cívica em saúde pública.
Os dados exibidos são provenientes de fontes governamentais abertas.
Padrões identificados indicam relações entre entidades — **não constituem prova de irregularidade**.
Uso em conformidade com a Lei 12.527/2011 (LAI) e Lei 13.709/2018 (LGPD — processamento de interesse público).

---

## Licença

[AGPL-3.0](LICENSE) — código aberto, dado público é bem público.

---

*Contribuições, issues e pull requests são muito bem-vindos.*
*Post completo para LinkedIn: [POST_LINKEDIN.md](POST_LINKEDIN.md)*
