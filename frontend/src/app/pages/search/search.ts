import { Component, signal, computed, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

type EntityType = 'todos' | 'hospital' | 'ubs' | 'upa' | 'laboratorio' | 'medico' | 'medicamento' | 'agravo';

interface SearchResult {
  id: string;
  name: string;
  type: string;
  typeColor: string;
  code: string;
  city: string;
  state: string;
  extra: string;
}

@Component({
  selector: 'app-search',
  imports: [RouterLink, FormsModule],
  templateUrl: './search.html'
})
export class SearchComponent implements OnInit {
  // Query params via input() binding (requires withComponentInputBinding)
  q    = input<string>('');
  tipo = input<string>('todos');

  query        = signal('');
  activeType   = signal<EntityType>('todos');
  isSearching  = signal(false);
  hasSearched  = signal(false);

  types: { value: EntityType; label: string }[] = [
    { value: 'todos',       label: 'Todos' },
    { value: 'hospital',    label: 'Hospitais' },
    { value: 'ubs',         label: 'UBS' },
    { value: 'upa',         label: 'UPA' },
    { value: 'laboratorio', label: 'Laboratórios' },
    { value: 'medico',      label: 'Profissionais' },
    { value: 'medicamento', label: 'Medicamentos' },
    { value: 'agravo',      label: 'Agravos / CID' },
  ];

  private allResults: SearchResult[] = [
    { id: '2078015', name: 'Hospital das Clínicas da FMUSP',          type: 'Hospital',       typeColor: '#4ade80', code: 'CNES 2078015', city: 'São Paulo',      state: 'SP', extra: '2.200 leitos · Universitário · SUS 100%' },
    { id: '2079869', name: 'Instituto do Coração — InCor',             type: 'Especializado',  typeColor: '#60a5fa', code: 'CNES 2079869', city: 'São Paulo',      state: 'SP', extra: '350 leitos · Cardiologia · SUS' },
    { id: '2269534', name: 'Hospital Sarah Kubitscheck',               type: 'Hospital',       typeColor: '#4ade80', code: 'CNES 2269534', city: 'Brasília',       state: 'DF', extra: '288 leitos · Reabilitação · Rede Sarah' },
    { id: '6935810', name: 'UPA 24h Senador Camará',                   type: 'UPA',            typeColor: '#fb923c', code: 'CNES 6935810', city: 'Rio de Janeiro', state: 'RJ', extra: 'Urgência e emergência · 24h' },
    { id: '2802236', name: 'UBS Heliópolis',                           type: 'UBS',            typeColor: '#34d399', code: 'CNES 2802236', city: 'São Paulo',      state: 'SP', extra: 'ESF · ACS · NASF' },
    { id: '3481079', name: 'Laboratório Central de Saúde Pública — SP',type: 'Laboratório',    typeColor: '#a78bfa', code: 'CNES 3481079', city: 'São Paulo',      state: 'SP', extra: 'LACEN · Referência estadual' },
    { id: '9912345', name: 'Dr. Carlos Eduardo Mendes (Cardiologista)',type: 'Médico',         typeColor: '#22d3ee', code: 'CRM 134521/SP', city: 'São Paulo',     state: 'SP', extra: 'CBO 225125 · Cardiologia Clínica' },
    { id: '9923456', name: 'Dra. Ana Beatriz Fonseca (Pediatra)',      type: 'Médico',         typeColor: '#22d3ee', code: 'CRM 098432/MG', city: 'Belo Horizonte', state: 'MG', extra: 'CBO 225133 · Pediatria' },
    { id: 'M001',    name: 'Metformina 500mg (cloridrato)',            type: 'Medicamento',    typeColor: '#facc15', code: 'ANVISA 1.0025.0001', city: '—',         state: '—',  extra: 'RENAME · Diabetes tipo 2 · Genérico' },
    { id: 'M002',    name: 'Insulina NPH humana 100UI/mL',             type: 'Medicamento',    typeColor: '#facc15', code: 'ANVISA 1.0025.0018', city: '—',         state: '—',  extra: 'RENAME · Componente Especializado' },
    { id: 'CID001',  name: 'E11 — Diabetes mellitus tipo 2',          type: 'Agravo / CID',   typeColor: '#f87171', code: 'CID-10 E11',    city: '—',             state: '—',  extra: 'Doenças endócrinas · SINAN / SIHSUS' },
    { id: 'CID002',  name: 'J18 — Pneumonia por microrganismo NE',    type: 'Agravo / CID',   typeColor: '#f87171', code: 'CID-10 J18',    city: '—',             state: '—',  extra: 'Doenças respiratórias · SINAN / SIM' },
  ];

  results = computed(() => {
    const q    = this.query().toLowerCase().trim();
    const type = this.activeType();

    if (!q && type === 'todos') return [];

    return this.allResults.filter(r => {
      const matchType = type === 'todos' || r.type.toLowerCase().includes(type.replace('laboratorio', 'laborat').replace('medico', 'médico').replace('agravo', 'agravo'));
      const matchQ    = !q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.city.toLowerCase().includes(q);
      return matchType && matchQ;
    });
  });

  ngOnInit(): void {
    if (this.q())    this.query.set(this.q());
    if (this.tipo() && this.tipo() !== 'todos') {
      const mapped: Record<string, EntityType> = {
        hospital: 'hospital', ubs: 'ubs', upa: 'upa',
        laboratorio: 'laboratorio', medico: 'medico',
        medicamento: 'medicamento', agravo: 'agravo',
      };
      this.activeType.set(mapped[this.tipo()] ?? 'todos');
    }
    if (this.q() || this.tipo() !== 'todos') {
      this.hasSearched.set(true);
    }
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.query.set(val);
    this.hasSearched.set(true);
  }

  setType(t: EntityType): void {
    this.activeType.set(t);
    this.hasSearched.set(true);
  }

  clear(): void {
    this.query.set('');
    this.activeType.set('todos');
    this.hasSearched.set(false);
  }
}
