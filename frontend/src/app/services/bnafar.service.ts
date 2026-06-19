import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { BnafarItem } from '../models';

export type { BnafarItem } from '../models';

interface BnafarResponse {
  parametros: BnafarItem[];
}

@Injectable({ providedIn: 'root' })
export class BnafarService {
  private http = inject(HttpClient);
  private readonly base = '/api-gov';

  buscarEstoque(cnesCode: string, limit = 20): Observable<BnafarItem[]> {
    return this.http
      .get<BnafarResponse>(
        `${this.base}/daf/estoque-medicamentos-bnafar-horus` +
          `?codigo_cnes=${cnesCode}&limit=${limit}`
      )
      .pipe(
        map(r => r.parametros ?? []),
        catchError(() => of([]))
      );
  }
}
