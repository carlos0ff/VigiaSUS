/**
 * API BNAFAR-HORUS — Estoque de Medicamentos da Assistência Farmacêutica
 * Fonte: DAF / Ministério da Saúde
 * Base: https://apidadosabertos.saude.gov.br
 * Docs: https://apidadosabertos.saude.gov.br/v1/#/DAF
 *
 * Relevância para o VigiaSUS: detecta medicamentos distribuídos para
 * estabelecimentos descredenciados ou com estoques incompatíveis com
 * a capacidade declarada no CNES.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';

export interface BnafarItem {
  codigo_cnes: number;
  descricao_produto: string | null;
  codigo_catmat: string;
  quantidade_estoque: number;
  numero_lote: string;
  data_validade: string;
  data_posicao_estoque: string;
  tipo_produto: string;
  sigla_programa_saude: string | null;
  descricao_programa_saude: string | null;
  sigla_sistema_origem: string;
  razao_social: string | null;
  nome_fantasia: string | null;
  municipio: string | null;
  uf: string | null;
}

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
