import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { CnesEstabelecimento } from '../models';

export type { CnesEstabelecimento } from '../models';
export { ufFromCode, tipoUnidade } from '../models';

@Injectable({ providedIn: 'root' })
export class CnesService {
  private http = inject(HttpClient);
  private readonly base = '/api-gov';

  buscarEstabelecimento(cnesCode: string): Observable<CnesEstabelecimento | null> {
    return this.http
      .get<CnesEstabelecimento>(`${this.base}/cnes/estabelecimentos/${cnesCode}`)
      .pipe(catchError(() => of(null)));
  }
}
