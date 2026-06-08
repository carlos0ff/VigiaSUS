import { Component, ElementRef, viewChild, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Stat {
  value: string;
  label: string;
  source: string;
}

interface Feature {
  iconPath: string;
  title: string;
  description: string;
  tag: string;
}

interface DataSource {
  abbr: string;
  full: string;
  description: string;
  badge: string;
  color: string;
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.html'
})
export class LandingComponent {
  private canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('networkCanvas');

  stats: Stat[] = [
    { value: 'R$ 244bi', label: 'Orçamento SUS 2024', source: 'LOA/MS' },
    { value: 'R$ 20bi+', label: 'Estimativa desviada', source: 'CGU / TCU' },
    { value: '4.318',    label: 'Casos investigados',  source: 'PGR/PF/CGU' },
    { value: '338k+',    label: 'Estabelecimentos',    source: 'CNES' },
  ];

  features: Feature[] = [
    {
      iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9',
      title: 'Rede de Estabelecimentos',
      description: 'Visualize hospitais, UBS, UPA, laboratórios e farmácias em grafo. Identifique referências, contrarreferências e lacunas de cobertura.',
      tag: 'CNES'
    },
    {
      iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Rastreio de Repasses FNS',
      description: 'Acompanhe o fluxo de recursos federais do Fundo Nacional de Saúde para estados e municípios. Identifique onde o dinheiro chega.',
      tag: 'FNS / SIOPS'
    },
    {
      iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      title: 'Mapa de Profissionais',
      description: 'Localize especialistas por CBO, vínculo com unidade e distribuição geográfica. Revele desertos assistenciais e sobreposições.',
      tag: 'CNES / CFM'
    },
    {
      iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      title: 'Vigilância Epidemiológica',
      description: 'Analise notificações do SINAN, mortalidade (SIM) e nascimentos (SINASC) por agravo, região e período histórico.',
      tag: 'SINAN / SIM'
    },
    {
      iconPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
      title: 'Medicamentos e ANVISA',
      description: 'Rastreie medicamentos da RENAME, irregularidades sanitárias e repasses da Farmácia Popular por estabelecimento credenciado.',
      tag: 'BNAFAR / CMED'
    },
    {
      iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      title: 'Internações e AIH',
      description: 'Analise AIHs por hospital, CID-10, tempo de permanência, custo médio e desfechos. Detecte padrões anômalos de cobrança.',
      tag: 'SIHSUS'
    },
    {
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      title: 'Detecção de Desvios e Lavagem',
      description: 'Cruzamento automático de CNPJ, COMPRASNET, FNS e RAIS para identificar empresas fantasma, superfaturamento e fluxos de lavagem de dinheiro.',
      tag: 'CGU / TCU'
    }
  ];

  sources: DataSource[] = [
    { abbr: 'CNES',   full: 'Cadastro Nacional de Estabelecimentos de Saúde', description: 'Hospitais, clínicas, laboratórios e profissionais',     badge: '338k estab.',   color: '#4ade80' },
    { abbr: 'SINAN',  full: 'Sistema de Informação de Agravos de Notificação', description: 'Notificações de doenças e agravos compulsórios',         badge: '200M+ notif.',  color: '#facc15' },
    { abbr: 'SIM',    full: 'Sistema de Informações sobre Mortalidade',         description: 'Declarações de óbito desde 1979',                        badge: '90M+ DO',       color: '#f87171' },
    { abbr: 'SINASC', full: 'Sistema de Informações sobre Nascidos Vivos',      description: 'Declarações de nascido vivo e indicadores maternos',     badge: '100M+ DN',      color: '#60a5fa' },
    { abbr: 'SIHSUS', full: 'Sistema de Informações Hospitalares do SUS',       description: 'Autorizações de internação hospitalar (AIH)',             badge: '1.2bi+ AIH',    color: '#a78bfa' },
    { abbr: 'FNS',    full: 'Fundo Nacional de Saúde',                          description: 'Transferências fundo a fundo entre entes federativos',   badge: 'R$ 180bi/ano',  color: '#34d399' },
    { abbr: 'ANVISA', full: 'Agência Nacional de Vigilância Sanitária',         description: 'Registros sanitários, irregularidades e apreensões',     badge: '25k produtos',  color: '#fb923c' },
    { abbr: 'BNAFAR', full: 'Banco Nacional de Preços em Saúde',                description: 'Farmácia Popular e compras públicas de medicamentos',    badge: '72M entregas',  color: '#22d3ee' },
  ];

  constructor() {
    afterNextRender(() => {
      this.initAnimation();
    });
  }

  private initAnimation(): void {
    const el = this.canvasRef();
    if (!el) return;

    const canvas = el.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();

    const logicalW = () => canvas.offsetWidth;
    const logicalH = () => canvas.offsetHeight;

    type NodeType = 'hospital' | 'ubs' | 'doctor' | 'lab' | 'pill' | 'chart';
    const typeColors: Record<NodeType, string> = {
      hospital: '#4ade80',
      ubs:      '#34d399',
      doctor:   '#22d3ee',
      lab:      '#60a5fa',
      pill:     '#a78bfa',
      chart:    '#facc15',
    };
    const types: NodeType[] = ['hospital', 'ubs', 'doctor', 'lab', 'pill', 'chart'];

    const nodes = Array.from({ length: 55 }, () => {
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        x:   Math.random() * logicalW(),
        y:   Math.random() * logicalH(),
        vx:  (Math.random() - 0.5) * 0.35,
        vy:  (Math.random() - 0.5) * 0.35,
        r:   Math.random() * 2.5 + 1.5,
        opacity: Math.random() * 0.45 + 0.25,
        type,
        color: typeColors[type],
      };
    });

    let animId: number;
    const draw = () => {
      const w = logicalW();
      const h = logicalH();
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.18;
            ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        if (n.type === 'hospital') {
          ctx.fillStyle = `rgba(74, 222, 128, ${n.opacity})`;
          ctx.beginPath();
          // Draw cross shape for hospitals
          const s = n.r;
          ctx.fillRect(n.x - s / 3, n.y - s, s * 0.67, s * 2);
          ctx.fillRect(n.x - s, n.y - s / 3, s * 2, s * 0.67);
        } else {
          const colors: Record<string, string> = {
            ubs:   `rgba(52, 211, 153, ${n.opacity})`,
            doctor:`rgba(34, 211, 238, ${n.opacity})`,
            lab:   `rgba(96, 165, 250, ${n.opacity})`,
            pill:  `rgba(167, 139, 250, ${n.opacity})`,
            chart: `rgba(250, 204, 21, ${n.opacity})`,
          };
          ctx.fillStyle = colors[n.type] ?? `rgba(74, 222, 128, ${n.opacity})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }

        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -10)  { n.x = w + 10; }
        if (n.x > w+10) { n.x = -10; }
        if (n.y < -10)  { n.y = h + 10; }
        if (n.y > h+10) { n.y = -10; }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener('resize', () => {
      cancelAnimationFrame(animId);
      resize();
      draw();
    });
  }
}
