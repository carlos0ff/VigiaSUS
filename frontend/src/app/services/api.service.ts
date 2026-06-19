import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { AnaliseBackend, DashboardStats } from '../models';

export type { AlertaBackend, DespesaDto, TcuDto, AnaliseBackend, DashboardStats } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  getAnalise(codigoCnes: string): Observable<AnaliseBackend | null> {
    return this.http
      .get<AnaliseBackend>(`/api/estabelecimentos/${codigoCnes}`)
      .pipe(catchError(() => of(null)));
  }

  getDashboardStats(): Observable<DashboardStats | null> {
    return this.http
      .get<DashboardStats>('/api/dashboard/stats')
      .pipe(catchError(() => of(null)));
  }
}
