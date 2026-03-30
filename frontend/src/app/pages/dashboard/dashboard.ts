import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface QuickEntity {
  label: string;
  description: string;
  count: string;
  iconPath: string;
  color: string;
  queryParam: string;
}

interface RecentItem {
  id: string;
  name: string;
  type: string;
  typeColor: string;
  code: string;
  city: string;
  state: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  searchQuery = signal('');

  entities: QuickEntity[] = [
    {
      label: 'Hospitais',
      description: 'CNES tipo 05 e 07',
      count: '7.842',
      iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9',
      color: '#4ade80',
      queryParam: 'hospital',
    },
    {
      label: 'UBS',
      description: 'Atenção básica',
      count: '45.621',
      iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      color: '#34d399',
      queryParam: 'ubs',
    },
    {
      label: 'Médicos',
      description: 'CBO 2251 e similares',
      count: '584k+',
      iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      color: '#22d3ee',
      queryParam: 'medico',
    },
    {
      label: 'Laboratórios',
      description: 'CNES tipo 70',
      count: '14.310',
      iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
      color: '#60a5fa',
      queryParam: 'laboratorio',
    },
    {
      label: 'Medicamentos',
      description: 'RENAME / CMED',
      count: '25.300',
      iconPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z',
      color: '#a78bfa',
      queryParam: 'medicamento',
    },
    {
      label: 'Agravos',
      description: 'SINAN notificações',
      count: '800+',
      iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: '#facc15',
      queryParam: 'agravo',
    },
  ];

  recent: RecentItem[] = [
    { id: '2078015',  name: 'Hospital das Clínicas da FMUSP',     type: 'Hospital',       typeColor: '#4ade80', code: 'CNES 2078015', city: 'São Paulo',     state: 'SP' },
    { id: '2802236',  name: 'UBS Heliópolis (ESF)',                type: 'UBS',            typeColor: '#34d399', code: 'CNES 2802236', city: 'São Paulo',     state: 'SP' },
    { id: '2269534',  name: 'Hospital Sarah Kubitscheck',          type: 'Hospital',       typeColor: '#4ade80', code: 'CNES 2269534', city: 'Brasília',      state: 'DF' },
    { id: '6935810',  name: 'UPA 24h Senador Camará',              type: 'UPA',            typeColor: '#fb923c', code: 'CNES 6935810', city: 'Rio de Janeiro', state: 'RJ' },
    { id: '2079869',  name: 'Instituto do Coração (InCor)',        type: 'Especializado',  typeColor: '#60a5fa', code: 'CNES 2079869', city: 'São Paulo',     state: 'SP' },
  ];

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }
}
