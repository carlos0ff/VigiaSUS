import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface NavItem {
  path: string;
  label: string;
  iconPath: string;
  exact?: boolean;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.html'
})
export class AppShellComponent implements OnInit {
  private apiService = inject(ApiService);

  sidebarOpen   = signal(true);
  backendOnline = signal<boolean | null>(null);

  navItems: NavItem[] = [
    {
      path: '/app/dashboard',
      label: 'Dashboard',
      exact: true,
      iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      path: '/app/search',
      label: 'Busca',
      iconPath: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    },
  ];

  entityItems: NavItem[] = [
    {
      path: '/app/search?tipo=hospital',
      label: 'Estabelecimentos',
      iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9',
    },
    {
      path: '/app/search?tipo=profissional',
      label: 'Profissionais',
      iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
    {
      path: '/app/search?tipo=medicamento',
      label: 'Medicamentos',
      iconPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
    {
      path: '/app/search?tipo=repasse',
      label: 'Repasses FNS',
      iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      path: '/app/search?tipo=agravo',
      label: 'Epidemiologia',
      iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
  ];

  ngOnInit(): void {
    this.apiService.getDashboardStats().subscribe(stats => {
      this.backendOnline.set(stats !== null);
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}
