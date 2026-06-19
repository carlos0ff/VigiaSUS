import {
  Component, ElementRef, viewChild, input,
  afterNextRender, signal, inject, OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import cytoscape from 'cytoscape';

import { CnesService, CnesEstabelecimento, ufFromCode, tipoUnidade } from '../../services/cnes.service';
import { BnafarService, BnafarItem } from '../../services/bnafar.service';
import { ApiService, AlertaBackend, DespesaDto, TcuDto } from '../../services/api.service';

type Tab = 'grafo' | 'info' | 'investimentos' | 'desvios' | 'internacoes';

interface Connection { id: string; label: string; type: string; typeColor: string; rel: string; }
interface Transfer   { year: string; program: string; value: string; source: string; status?: 'normal' | 'suspeito' | 'desviado'; }
interface Alert      { id: string; severity: 'alto' | 'medio' | 'baixo'; title: string; detail: string; value?: string; }

const MOCK_ENTITY = {
  id: '2078015', name: 'Hospital das Clínicas da FMUSP',
  type: 'Hospital Geral', typeColor: '#4ade80',
  code: 'CNES 2078015', cnpj: '56.577.059/0001-00',
  city: 'São Paulo', state: 'SP', region: 'DRS I — Grande São Paulo',
  beds: '—', uf: 'SP', phones: '(11) 3087-5456',
  address: 'Rua Dr. Ovídio Pires de Campos, 225 — Cerqueira César',
  sus: 'Sim', teaching: '—', ehr: '—', urgency: '—',
};

interface InvestmentYear {
  year: string;
  orcado: number;
  executado: number;
  desviado: number;
  label: string;
}

@Component({
  selector: 'app-analysis',
  imports: [RouterLink],
  templateUrl: './analysis.html',
})
export class AnalysisComponent implements OnInit {
  id = input<string>('');

  private cnesService   = inject(CnesService);
  private bnafarService = inject(BnafarService);
  private apiService    = inject(ApiService);
  private cytoscapeContainer = viewChild<ElementRef<HTMLDivElement>>('cytoscapeContainer');
  private cy: cytoscape.Core | null = null;

  activeTab = signal<Tab>('grafo');
  loading   = signal(true);
  apiSource = signal<'api' | 'mock'>('mock');

  entity      = signal({ ...MOCK_ENTITY });
  tcu         = signal<TcuDto | null>(null);
  connections: Connection[] = [];
  transfers:   Transfer[]   = [];
  alerts:      Alert[]      = [];
  investmentYears: InvestmentYear[] = [];

  readonly tabs: { value: Tab; label: string; alert?: boolean }[] = [
    { value: 'grafo',        label: 'Grafo' },
    { value: 'info',         label: 'Informações' },
    { value: 'investimentos',label: 'Investimentos' },
    { value: 'desvios',      label: 'Desvios', alert: true },
    { value: 'internacoes',  label: 'Internações' },
  ];

  private graphElements: cytoscape.ElementDefinition[] = [];

  constructor() {
    afterNextRender(() => {
      if (this.activeTab() === 'grafo' && !this.loading()) {
        this.mountGraph();
      }
    });
  }

  ngOnInit(): void {
    const cnesCode = this.id() || '2078015';

    // Tenta o backend primeiro (dados reais + alertas detectados).
    // Se indisponível, cai para DATASUS direto; se também falhar, usa mock.
    this.apiService.getAnalise(cnesCode).pipe(
      switchMap(backendData => {
        if (backendData) {
          return of({ type: 'backend' as const, data: backendData });
        }
        return forkJoin({
          estabelecimento: this.cnesService.buscarEstabelecimento(cnesCode),
          estoque:         this.bnafarService.buscarEstoque(cnesCode),
        }).pipe(
          switchMap(({ estabelecimento, estoque }) =>
            of({ type: 'datasus' as const, estabelecimento, estoque })
          )
        );
      })
    ).subscribe(result => {
      if (result.type === 'backend') {
        this.buildFromApi(result.data.cnes, result.data.estoque, result.data.alertas, result.data.despesas, result.data.tcu);
        this.apiSource.set('api');
      } else if (result.type === 'datasus' && result.estabelecimento) {
        this.buildFromApi(result.estabelecimento, result.estoque);
        this.apiSource.set('api');
      } else {
        this.buildFromMock();
      }
      this.loading.set(false);
      setTimeout(() => this.mountGraph(), 50);
    });
  }

  private buildFromApi(
    est: CnesEstabelecimento,
    estoque: BnafarItem[],
    backendAlertas?: AlertaBackend[],
    despesas?: DespesaDto[],
    tcuDto?: TcuDto,
  ): void {
    const uf     = ufFromCode(est.codigo_uf);
    const tipo   = tipoUnidade(est.codigo_tipo_unidade);
    const gestao = {
      E: 'Gestão Estadual', M: 'Gestão Municipal',
      D: 'Dupla Gestão',    S: 'Sem Gestão',
    }[est.tipo_gestao] ?? est.tipo_gestao;

    this.entity.set({
      id:      String(est.codigo_cnes),
      name:    est.nome_fantasia || est.nome_razao_social,
      type:    tipo, typeColor: '#4ade80',
      code:    `CNES ${est.codigo_cnes}`,
      cnpj:    est.numero_cnpj
        ? est.numero_cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        : '—',
      city:    String(est.codigo_municipio), state: uf, region: `${uf} — ${gestao}`,
      beds:    '—', uf, phones: est.numero_telefone_estabelecimento || '—',
      address: `${est.endereco_estabelecimento || ''}, ${est.numero_estabelecimento || ''}`.trim().replace(/^,\s*|,\s*$/, '') || '—',
      sus:     est.estabelecimento_faz_atendimento_ambulatorial_sus,
      teaching: est.descricao_natureza_juridica_estabelecimento || '—',
      ehr: '—', urgency: '—',
    });

    if (despesas && despesas.length > 0) {
      this.transfers = despesas.map(d => ({
        year:    d.ano ?? '—',
        program: d.funcao ?? d.tipoDocumento ?? '—',
        value:   d.valorPago != null
          ? `R$ ${d.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : '—',
        source:  d.orgao ?? 'Transparência',
        status:  'normal' as const,
      }));
    } else {
      this.transfers = estoque.slice(0, 10).map(m => ({
        year:    m.data_posicao_estoque?.split('-')[0] ?? '—',
        program: m.descricao_produto ?? m.codigo_catmat,
        value:   `${m.quantidade_estoque} un.`,
        source:  m.sigla_sistema_origem ?? 'BNAFAR',
        status:  'normal' as const,
      }));
    }
    this.tcu.set(tcuDto ?? null);

    this.connections = [
      { id: 'uf',   label: `Estado — ${uf}`, type: 'Estado',  typeColor: '#60a5fa', rel: 'Unidade federativa' },
      { id: 'gest', label: gestao,            type: 'Gestão',  typeColor: '#fb923c', rel: 'Tipo de gestão' },
      { id: 'tipo', label: tipo,              type: 'Tipo',    typeColor: '#a78bfa', rel: 'Tipo de unidade' },
      ...estoque.slice(0, 5).map((m, i) => ({
        id: `med_${i}`, label: m.descricao_produto ?? m.codigo_catmat,
        type: 'Medicamento', typeColor: '#facc15', rel: 'Estoque BNAFAR',
      })),
    ];

    this.buildInvestmentData();
    this.alerts = (backendAlertas ?? []).map(a => ({
      id: a.id, severity: a.severidade,
      title: a.titulo, detail: a.detalhe, value: a.valor,
    }));

    const centerLabel = (est.nome_fantasia || est.nome_razao_social).split(' ').slice(0, 3).join(' ');
    const nodes: cytoscape.NodeDefinition[] = [
      { data: { id: 'center', label: centerLabel, size: 40, color: '#4ade80', border: '#86efac', nodeType: 'hospital' }, classes: 'center' },
      { data: { id: 'uf',   label: uf,                                         size: 18, color: '#60a5fa', border: '#93c5fd', nodeType: 'estado' } },
      { data: { id: 'gest', label: gestao.split(' ').slice(0, 2).join(' '),    size: 20, color: '#fb923c', border: '#fdba74', nodeType: 'gestao' } },
      { data: { id: 'tipo', label: tipo.split(' ').slice(0, 3).join(' '),      size: 18, color: '#a78bfa', border: '#c4b5fd', nodeType: 'tipo' } },
    ];
    const edges: cytoscape.EdgeDefinition[] = [
      { data: { source: 'center', target: 'uf',   label: 'localizado_em', edgeType: 'normal' } },
      { data: { source: 'center', target: 'gest', label: 'gerido_por',    edgeType: 'normal' } },
      { data: { source: 'center', target: 'tipo', label: 'é_do_tipo',     edgeType: 'normal' } },
    ];

    const porPrograma = new Map<string, number>();
    estoque.forEach(m => {
      const prog = m.descricao_programa_saude ?? m.sigla_programa_saude ?? m.sigla_sistema_origem ?? 'BNAFAR';
      porPrograma.set(prog, (porPrograma.get(prog) ?? 0) + (m.quantidade_estoque ?? 0));
    });
    let idx = 0;
    porPrograma.forEach((qtd, prog) => {
      const nodeId = `med_${idx}`;
      nodes.push({ data: { id: nodeId, label: prog.split(' ').slice(0, 3).join(' '), size: 14, color: '#facc15', border: '#fde047', nodeType: 'medicamento' } });
      edges.push({ data: { source: 'center', target: nodeId, label: `${qtd} un.`, edgeType: 'normal' } });
      idx++;
    });

    this.graphElements = [...nodes, ...edges];
  }

  private buildFromMock(): void {
    this.entity.set({ ...MOCK_ENTITY });

    this.connections = [
      { id: 'C1', label: 'Instituto do Coração (InCor)',         type: 'Instituto',    typeColor: '#60a5fa', rel: 'Unidade associada' },
      { id: 'C2', label: 'Faculdade de Medicina da USP (FMUSP)', type: 'Ensino',       typeColor: '#a78bfa', rel: 'Gestão universitária' },
      { id: 'C3', label: 'UBS Cerqueira César',                  type: 'UBS',          typeColor: '#34d399', rel: 'Contrarreferência' },
      { id: 'C4', label: 'Secretaria Municipal de Saúde — SP',   type: 'Governo',      typeColor: '#facc15', rel: 'Repasse municipal' },
      { id: 'C5', label: 'Ministério da Saúde',                  type: 'Gov. Federal', typeColor: '#fb923c', rel: 'Repasse FNS' },
      { id: 'C6', label: 'SAMU SP — Central de Regulação',       type: 'Urgência',     typeColor: '#f87171', rel: 'Regulação de leitos' },
      { id: 'C7', label: 'Banco de Sangue Paulista',             type: 'Hemocentro',   typeColor: '#f43f5e', rel: 'Hemocomponentes' },
    ];

    this.transfers = [
      { year: '2024', program: 'Assistência Hospitalar de Alta Complexidade', value: 'R$ 412,8M', source: 'FNS',   status: 'normal'   },
      { year: '2024', program: 'Atenção Especializada — MAC',                 value: 'R$ 187,2M', source: 'FNS',   status: 'normal'   },
      { year: '2024', program: 'Ensino e Pesquisa em Saúde',                  value: 'R$ 34,5M',  source: 'MS',    status: 'normal'   },
      { year: '2024', program: 'Compra Centralizada — Medicamentos',          value: 'R$ 28,3M',  source: 'DAF',   status: 'suspeito' },
      { year: '2023', program: 'Assistência Hospitalar de Alta Complexidade', value: 'R$ 389,1M', source: 'FNS',   status: 'normal'   },
      { year: '2023', program: 'Atenção Especializada — MAC',                 value: 'R$ 171,4M', source: 'FNS',   status: 'normal'   },
      { year: '2023', program: 'Reforma e Equipamentos (REIBIO)',              value: 'R$ 62,1M',  source: 'MS',    status: 'desviado' },
      { year: '2022', program: 'Fundo a Fundo — Bloco Manutenção',            value: 'R$ 15,8M',  source: 'SIOPS', status: 'suspeito' },
    ];

    this.alerts = [
      { id: 'A1', severity: 'alto',  title: 'Superfaturamento detectado',      detail: 'Compra de insumos cirúrgicos 340% acima do preço de referência COMPRASNET em Nov/2023.', value: 'R$ 62,1M' },
      { id: 'A2', severity: 'alto',  title: 'Empresa fantasma vinculada',       detail: 'Fornecedor CNPJ 18.XXX.XXX/0001-YY sem funcionários registrados na RAIS realizou 8 contratos.', value: 'R$ 28,3M' },
      { id: 'A3', severity: 'medio', title: 'Repasse sem prestação de contas',  detail: 'Transferência de Dez/2022 ao bloco de manutenção sem contrapartida em SIOPS há 18 meses.', value: 'R$ 15,8M' },
      { id: 'A4', severity: 'medio', title: 'Estoque incompatível com BNAFAR',  detail: 'Medicamentos registrados no BNAFAR-HORUS divergem 87% do estoque declarado ao CNES.' },
      { id: 'A5', severity: 'baixo', title: 'AIH com código CID-10 incomum',    detail: 'Pico de internações com CID Z76.8 (motivo não especificado) — 1.200% acima da média regional em 2024.' },
    ];

    this.buildInvestmentData();

    this.graphElements = [
      // Nós legítimos
      { data: { id: 'center', label: 'H.C. FMUSP',      size: 40, color: '#4ade80', border: '#86efac', nodeType: 'hospital' }, classes: 'center' },
      { data: { id: 'ms',     label: 'Min. Saúde / FNS', size: 26, color: '#fb923c', border: '#fdba74', nodeType: 'governo' } },
      { data: { id: 'sms',    label: 'SMS São Paulo',    size: 20, color: '#facc15', border: '#fde047', nodeType: 'governo' } },
      { data: { id: 'incor',  label: 'InCor',            size: 20, color: '#60a5fa', border: '#93c5fd', nodeType: 'instituto' } },
      { data: { id: 'fmusp',  label: 'FMUSP / USP',      size: 20, color: '#a78bfa', border: '#c4b5fd', nodeType: 'ensino' } },
      { data: { id: 'ubs',    label: 'UBS Cerqueira',    size: 16, color: '#34d399', border: '#6ee7b7', nodeType: 'ubs' } },
      { data: { id: 'samu',   label: 'SAMU SP',          size: 16, color: '#f87171', border: '#fca5a5', nodeType: 'urgencia' } },
      { data: { id: 'hemo',   label: 'Hemocentro',       size: 14, color: '#f43f5e', border: '#fb7185', nodeType: 'hemo' } },
      { data: { id: 'sus',    label: 'SUS / Regulação',  size: 18, color: '#22d3ee', border: '#67e8f9', nodeType: 'sus' } },
      { data: { id: 'sihsus', label: 'SIHSUS',           size: 14, color: '#818cf8', border: '#a5b4fc', nodeType: 'sistema' } },
      // Nós suspeitos — empresas fantasma / intermediários
      { data: { id: 'shell1', label: 'M.J. Insumos Ltda',  size: 20, color: '#ef4444', border: '#fca5a5', nodeType: 'suspeito' }, classes: 'suspicious' },
      { data: { id: 'shell2', label: 'Pharma Delta S/A',   size: 18, color: '#ef4444', border: '#fca5a5', nodeType: 'suspeito' }, classes: 'suspicious' },
      { data: { id: 'inter',  label: 'Intermediário',      size: 16, color: '#f97316', border: '#fdba74', nodeType: 'suspeito' }, classes: 'suspicious' },
      { data: { id: 'off1',   label: 'Offshore BVI',       size: 16, color: '#dc2626', border: '#f87171', nodeType: 'lavagem'  }, classes: 'money-laundering' },
      // Arestas normais
      { data: { source: 'ms',     target: 'center', label: 'repasse FNS',    edgeType: 'normal' } },
      { data: { source: 'sms',    target: 'center', label: 'repasse munic.', edgeType: 'normal' } },
      { data: { source: 'ms',     target: 'sms',    label: 'fundo a fundo',  edgeType: 'normal' } },
      { data: { source: 'center', target: 'incor',  label: 'associada',      edgeType: 'normal' } },
      { data: { source: 'center', target: 'fmusp',  label: 'vinculado',      edgeType: 'normal' } },
      { data: { source: 'center', target: 'ubs',    label: 'contraref.',     edgeType: 'normal' } },
      { data: { source: 'center', target: 'samu',   label: 'regulação',      edgeType: 'normal' } },
      { data: { source: 'center', target: 'hemo',   label: 'hemoderivados',  edgeType: 'normal' } },
      { data: { source: 'center', target: 'sus',    label: 'credenciado',    edgeType: 'normal' } },
      { data: { source: 'center', target: 'sihsus', label: 'AIH',            edgeType: 'normal' } },
      { data: { source: 'fmusp',  target: 'incor',  label: 'pesquisa',       edgeType: 'normal' } },
      // Arestas suspeitas — fluxo de desvio
      { data: { source: 'center', target: 'shell1', label: 'contrato superfaturado', edgeType: 'suspeito' }, classes: 'suspicious-edge' },
      { data: { source: 'center', target: 'shell2', label: 'licitação irregular',    edgeType: 'suspeito' }, classes: 'suspicious-edge' },
      { data: { source: 'shell1', target: 'inter',  label: 'repasse 91%',            edgeType: 'desvio'   }, classes: 'money-edge' },
      { data: { source: 'shell2', target: 'inter',  label: 'repasse 87%',            edgeType: 'desvio'   }, classes: 'money-edge' },
      { data: { source: 'inter',  target: 'off1',   label: 'lavagem',                edgeType: 'desvio'   }, classes: 'money-edge' },
      { data: { source: 'ms',     target: 'shell2', label: 'verba desviada',         edgeType: 'desvio'   }, classes: 'money-edge' },
    ];
  }

  private buildInvestmentData(): void {
    this.investmentYears = [
      { year: '2020', orcado: 580,  executado: 490, desviado: 62,  label: '2020' },
      { year: '2021', orcado: 720,  executado: 601, desviado: 84,  label: '2021' },
      { year: '2022', orcado: 810,  executado: 673, desviado: 96,  label: '2022' },
      { year: '2023', orcado: 960,  executado: 761, desviado: 118, label: '2023' },
      { year: '2024', orcado: 1050, executado: 834, desviado: 135, label: '2024' },
    ];
  }

  get totalOrcado():   number { return this.investmentYears.reduce((s, y) => s + y.orcado,    0); }
  get totalExecutado():number { return this.investmentYears.reduce((s, y) => s + y.executado, 0); }
  get totalDesviado(): number { return this.investmentYears.reduce((s, y) => s + y.desviado,  0); }
  get pctDesviado():   number { return Math.round((this.totalDesviado / this.totalOrcado) * 100); }

  barWidth(value: number, max: number): string {
    return `${Math.round((value / max) * 100)}%`;
  }

  severityColor(s: Alert['severity']): string {
    return { alto: '#ef4444', medio: '#f97316', baixo: '#facc15' }[s];
  }
  severityLabel(s: Alert['severity']): string {
    return { alto: 'ALTO', medio: 'MÉDIO', baixo: 'BAIXO' }[s];
  }
  statusColor(s?: Transfer['status']): string {
    return { normal: '#4ade80', suspeito: '#f97316', desviado: '#ef4444' }[s ?? 'normal'];
  }
  statusLabel(s?: Transfer['status']): string {
    return { normal: 'Normal', suspeito: 'Suspeito', desviado: 'Desviado' }[s ?? 'normal'];
  }

  private mountGraph(): void {
    const container = this.cytoscapeContainer();
    if (!container || this.cy) return;

    this.cy = cytoscape({
      container: container.nativeElement,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'color': '#dde8df',
            'font-size': '10px',
            'font-family': 'JetBrains Mono, monospace',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 6,
            'text-max-width': '120px',
            'text-wrap': 'ellipsis',
            'width': 'data(size)',
            'height': 'data(size)',
            'border-width': 2,
            'border-color': 'data(border)',
            'border-opacity': 0.6,
          },
        },
        {
          selector: 'node.center',
          style: {
            'background-color': '#4ade80',
            'border-color': '#86efac',
            'border-width': 3,
            'font-size': '11px',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'node.suspicious',
          style: {
            'background-color': '#ef4444',
            'border-color': '#fca5a5',
            'border-width': 2,
            'border-style': 'dashed',
            'shape': 'diamond',
          },
        },
        {
          selector: 'node.money-laundering',
          style: {
            'background-color': '#dc2626',
            'border-color': '#f87171',
            'border-width': 3,
            'border-style': 'dashed',
            'shape': 'pentagon',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': 'rgba(74,222,128,0.25)',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'color': '#52635a',
            'font-size': '9px',
            'font-family': 'JetBrains Mono, monospace',
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'rgba(74,222,128,0.25)',
            'arrow-scale': 0.8,
          },
        },
        {
          selector: 'edge.suspicious-edge',
          style: {
            'line-color': 'rgba(249,115,22,0.5)',
            'target-arrow-color': 'rgba(249,115,22,0.5)',
            'line-style': 'dashed',
            'color': '#f97316',
            'width': 2,
          },
        },
        {
          selector: 'edge.money-edge',
          style: {
            'line-color': 'rgba(239,68,68,0.6)',
            'target-arrow-color': 'rgba(239,68,68,0.6)',
            'line-style': 'dotted',
            'color': '#ef4444',
            'width': 2.5,
          },
        },
        {
          selector: ':selected',
          style: {
            'border-color': '#4ade80',
            'border-width': 3,
            'line-color': 'rgba(74,222,128,0.6)',
          },
        },
      ],
      elements: this.graphElements,
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 600,
        randomize: false,
        nodeRepulsion: 10000,
        gravity: 0.3,
        padding: 40,
      } as unknown as cytoscape.LayoutOptions,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      minZoom: 0.3,
      maxZoom: 3,
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'grafo' && !this.cy && !this.loading()) {
      setTimeout(() => this.mountGraph(), 50);
    }
  }
}
