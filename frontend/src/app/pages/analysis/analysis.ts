import { Component, ElementRef, viewChild, input, afterNextRender, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import cytoscape from 'cytoscape';

type Tab = 'grafo' | 'info' | 'repasses' | 'internacoes';

interface Connection {
  id: string;
  label: string;
  type: string;
  typeColor: string;
  rel: string;
}

interface Transfer {
  year: string;
  program: string;
  value: string;
  source: string;
}

@Component({
  selector: 'app-analysis',
  imports: [RouterLink],
  templateUrl: './analysis.html'
})
export class AnalysisComponent {
  id = input<string>('');

  private cytoscapeContainer = viewChild<ElementRef<HTMLDivElement>>('cytoscapeContainer');
  private cy: cytoscape.Core | null = null;

  activeTab = signal<Tab>('grafo');

  entity = computed(() => ({
    id:       this.id() || '2078015',
    name:     'Hospital das Clínicas da FMUSP',
    type:     'Hospital Universitário',
    typeColor:'#4ade80',
    code:     'CNES 2078015',
    cnpj:     '60.975.737/0001-09',
    city:     'São Paulo',
    state:    'SP',
    region:   'DRS I — Grande São Paulo',
    beds:     '2.200 leitos',
    uf:       'SP',
    phones:   '(11) 2661-0000',
    address:  'Av. Dr. Enéas Carvalho de Aguiar, 255 — Cerqueira César',
    sus:      '100%',
    teaching: 'Universitário — FMUSP / USP',
    ehr:      'Sim — Prontuário Eletrônico',
    urgency:  'Sim — SAMU / Regulação',
  }));

  connections: Connection[] = [
    { id: 'C1', label: 'Instituto do Coração (InCor)',            type: 'Instituto',     typeColor: '#60a5fa', rel: 'Unidade associada' },
    { id: 'C2', label: 'Faculdade de Medicina da USP (FMUSP)',    type: 'Ensino',        typeColor: '#a78bfa', rel: 'Gestão universitária' },
    { id: 'C3', label: 'UBS Cerqueira César',                     type: 'UBS',           typeColor: '#34d399', rel: 'Contrarreferência' },
    { id: 'C4', label: 'Secretaria Municipal de Saúde — SP',      type: 'Governo',       typeColor: '#facc15', rel: 'Repasse municipal' },
    { id: 'C5', label: 'Ministério da Saúde',                     type: 'Governo Federal',typeColor:'#fb923c', rel: 'Repasse FNS' },
    { id: 'C6', label: 'SAMU SP — Central de Regulação',          type: 'Urgência',      typeColor: '#f87171', rel: 'Regulação de leitos' },
    { id: 'C7', label: 'Banco de Sangue Paulista',                type: 'Hemocentro',    typeColor: '#f43f5e', rel: 'Hemocomponentes' },
  ];

  transfers: Transfer[] = [
    { year: '2024', program: 'Assistência Hospitalar de Alta Complexidade',   value: 'R$ 412.8M', source: 'FNS' },
    { year: '2024', program: 'Atenção Especializada — MAC',                   value: 'R$ 187.2M', source: 'FNS' },
    { year: '2024', program: 'Ensino e Pesquisa em Saúde',                    value: 'R$ 34.5M',  source: 'MS' },
    { year: '2023', program: 'Assistência Hospitalar de Alta Complexidade',   value: 'R$ 389.1M', source: 'FNS' },
    { year: '2023', program: 'Atenção Especializada — MAC',                   value: 'R$ 171.4M', source: 'FNS' },
  ];

  tabs: { value: Tab; label: string }[] = [
    { value: 'grafo',       label: 'Grafo' },
    { value: 'info',        label: 'Informações' },
    { value: 'repasses',    label: 'Repasses' },
    { value: 'internacoes', label: 'Internações' },
  ];

  constructor() {
    afterNextRender(() => {
      if (this.activeTab() === 'grafo') {
        this.initGraph();
      }
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'grafo' && !this.cy) {
      // Small delay to let the DOM render
      setTimeout(() => this.initGraph(), 50);
    }
  }

  private initGraph(): void {
    const container = this.cytoscapeContainer();
    if (!container || this.cy) return;

    const ent = this.entity();

    this.cy = cytoscape({
      container: container.nativeElement,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label':            'data(label)',
            'color':            '#dde8df',
            'font-size':        '10px',
            'font-family':      'JetBrains Mono, monospace',
            'text-valign':      'bottom',
            'text-halign':      'center',
            'text-margin-y':    6,
            'text-max-width':   '120px',
            'text-wrap':        'ellipsis',
            'width':            'data(size)',
            'height':           'data(size)',
            'border-width':     2,
            'border-color':     'data(border)',
            'border-opacity':   0.6,
          }
        },
        {
          selector: 'node.center',
          style: {
            'background-color': '#4ade80',
            'border-color':     '#86efac',
            'border-width':     3,
            'font-size':        '11px',
            'font-weight':      'bold',
          }
        },
        {
          selector: 'edge',
          style: {
            'width':              1.5,
            'line-color':         'rgba(74,222,128,0.25)',
            'curve-style':        'bezier',
            'label':              'data(label)',
            'color':              '#52635a',
            'font-size':          '9px',
            'font-family':        'JetBrains Mono, monospace',
            'text-rotation':      'autorotate',
            'text-margin-y':      -8,
          }
        },
        {
          selector: ':selected',
          style: {
            'border-color':   '#4ade80',
            'border-width':   3,
            'line-color':     'rgba(74,222,128,0.6)',
          }
        }
      ],
      elements: {
        nodes: [
          { data: { id: 'center', label: ent.name.split(' ').slice(0, 3).join(' '), size: 40, color: '#4ade80', border: '#86efac' }, classes: 'center' },
          { data: { id: 'incor',  label: 'InCor',            size: 22, color: '#60a5fa', border: '#93c5fd' } },
          { data: { id: 'fmusp',  label: 'FMUSP / USP',      size: 22, color: '#a78bfa', border: '#c4b5fd' } },
          { data: { id: 'ubs',    label: 'UBS Cerqueira',     size: 18, color: '#34d399', border: '#6ee7b7' } },
          { data: { id: 'sms',    label: 'SMS São Paulo',     size: 20, color: '#facc15', border: '#fde047' } },
          { data: { id: 'ms',     label: 'Min. Saúde / FNS',  size: 24, color: '#fb923c', border: '#fdba74' } },
          { data: { id: 'samu',   label: 'SAMU SP',           size: 18, color: '#f87171', border: '#fca5a5' } },
          { data: { id: 'hemo',   label: 'Hemocentro',        size: 16, color: '#f43f5e', border: '#fb7185' } },
          { data: { id: 'sus',    label: 'SUS / Regulação',   size: 20, color: '#22d3ee', border: '#67e8f9' } },
          { data: { id: 'sinan',  label: 'SINAN',             size: 16, color: '#facc15', border: '#fde047' } },
          { data: { id: 'sihsus', label: 'SIHSUS',            size: 16, color: '#818cf8', border: '#a5b4fc' } },
        ],
        edges: [
          { data: { source: 'center', target: 'incor',  label: 'associada' } },
          { data: { source: 'center', target: 'fmusp',  label: 'vinculado' } },
          { data: { source: 'center', target: 'ubs',    label: 'contraref.' } },
          { data: { source: 'center', target: 'sms',    label: 'repasse' } },
          { data: { source: 'center', target: 'ms',     label: 'repasse FNS' } },
          { data: { source: 'center', target: 'samu',   label: 'regulação' } },
          { data: { source: 'center', target: 'hemo',   label: 'hemoderivados' } },
          { data: { source: 'center', target: 'sus',    label: 'credenciado' } },
          { data: { source: 'center', target: 'sinan',  label: 'notificações' } },
          { data: { source: 'center', target: 'sihsus', label: 'AIH' } },
          { data: { source: 'ms',     target: 'sms',    label: 'fundo a fundo' } },
          { data: { source: 'fmusp',  target: 'incor',  label: 'pesquisa' } },
        ]
      },
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 600,
        randomize: false,
        nodeRepulsion: 8000,
        gravity: 0.35,
        padding: 30,
      } as unknown as cytoscape.LayoutOptions,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      minZoom: 0.3,
      maxZoom: 3,
    });
  }
}
