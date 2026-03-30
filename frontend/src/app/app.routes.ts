import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing').then(m => m.LandingComponent)
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./components/app-shell/app-shell').then(m => m.AppShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./pages/search/search').then(m => m.SearchComponent)
      },
      {
        path: 'analysis/:id',
        loadComponent: () =>
          import('./pages/analysis/analysis').then(m => m.AnalysisComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
