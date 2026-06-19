import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DashboardStats } from '../../models';

interface QuickEntity {
  label: string; description: string; count: string;
  iconPath: string; color: string; queryParam: string;
}

interface RecentItem {
  id: string; name: string; type: string; typeColor: string;
  code: string; city: string; state: string;
}

interface CorruptionAlert {
  id: string; state: string; value: string; type: string;
  color: string; detail: string; year: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  searchQuery  = signal('');
  statsLoading = signal(true);
  liveStats    = signal<DashboardStats | null>(null);

  entities: QuickEntity[] = [
    { label: 'Hospitais',    description: 'CNES tipo 05 e 07',    count: '7.842',  iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9', color: '#4ade80', queryParam: 'hospital' },
    { label: 'UBS',          description: 'Atenção básica',       count: '45.621', iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: '#34d399', queryParam: 'ubs' },
    { label: 'Médicos',      description: 'CBO 2251 e similares', count: '584k+',  iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: '#22d3ee', queryParam: 'medico' },
    { label: 'Laboratórios', description: 'CNES tipo 70',         count: '14.310', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: '#60a5fa', queryParam: 'laboratorio' },
    { label: 'Medicamentos', description: 'RENAME / CMED',        count: '25.300', iconPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z', color: '#a78bfa', queryParam: 'medicamento' },
    { label: 'Agravos',      description: 'SINAN notificações',   count: '800+',   iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: '#facc15', queryParam: 'agravo' },
  ];

  recent: RecentItem[] = [
    { id: '2078015', name: 'Hospital das Clínicas da FMUSP',  type: 'Hospital',      typeColor: '#4ade80', code: 'CNES 2078015', city: 'São Paulo',      state: 'SP' },
    { id: '2802236', name: 'UBS Heliópolis (ESF)',             type: 'UBS',           typeColor: '#34d399', code: 'CNES 2802236', city: 'São Paulo',      state: 'SP' },
    { id: '2269534', name: 'Hospital Sarah Kubitscheck',       type: 'Hospital',      typeColor: '#4ade80', code: 'CNES 2269534', city: 'Brasília',       state: 'DF' },
    { id: '6935810', name: 'UPA 24h Senador Camará',           type: 'UPA',           typeColor: '#fb923c', code: 'CNES 6935810', city: 'Rio de Janeiro', state: 'RJ' },
    { id: '2079869', name: 'Instituto do Coração (InCor)',     type: 'Especializado', typeColor: '#60a5fa', code: 'CNES 2079869', city: 'São Paulo',      state: 'SP' },
  ];

  corruptionAlerts: CorruptionAlert[] = [
    { id: 'CA1', state: 'SP', value: 'R$ 62,1M', type: 'Superfaturamento',  color: '#ef4444', detail: 'Insumos cirúrgicos 340% acima do COMPRASNET',     year: '2023' },
    { id: 'CA2', state: 'RJ', value: 'R$ 48,7M', type: 'Empresa fantasma',  color: '#ef4444', detail: 'Fornecedor sem funcionários — 12 contratos FNS',   year: '2024' },
    { id: 'CA3', state: 'PA', value: 'R$ 31,2M', type: 'Desvio de verba',   color: '#f97316', detail: 'Repasse sem prestação de contas — 22 meses',       year: '2023' },
    { id: 'CA4', state: 'BA', value: 'R$ 19,4M', type: 'Fraude em AIH',     color: '#f97316', detail: 'AIHs cobradas para internações não realizadas',     year: '2024' },
    { id: 'CA5', state: 'MG', value: 'R$ 14,8M', type: 'Estoque irregular', color: '#facc15', detail: 'Divergência 87% BNAFAR-HORUS × estoque declarado', year: '2024' },
  ];

  readonly nationalStats = [
    { label: 'Orçamento SUS 2024',  value: 'R$ 244bi', color: '#4ade80', sub: 'Lei Orçamentária Anual' },
    { label: 'Estimativa desviada', value: 'R$ 20bi+', color: '#ef4444', sub: 'CGU / TCU 2020–2024'    },
    { label: 'Casos investigados',  value: '4.318',    color: '#f97316', sub: 'Operações PGR/PF/CGU'   },
    { label: 'Empresas suspeitas',  value: '12.470',   color: '#facc15', sub: 'Cruzamento CNPJ/RAIS'   },
  ];

  readonly liveStatsDefs = [
    { key: 'totalEstabelecimentos',   label: 'Estabelecimentos',     color: '#4ade80', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' },
    { key: 'totalAlertas',            label: 'Total de alertas',     color: '#f97316', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { key: 'alertasAlto',             label: 'Alertas alto risco',   color: '#ef4444', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
    { key: 'estabelecimentosComAlerta', label: 'Com irregularidade', color: '#dc2626', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ] as const;

  ngOnInit(): void {
    this.apiService.getDashboardStats().subscribe(stats => {
      this.liveStats.set(stats);
      this.statsLoading.set(false);
    });
  }

  statValue(key: string): number {
    const s = this.liveStats();
    if (!s) return 0;
    return (s as unknown as Record<string, number>)[key] ?? 0;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }
}
