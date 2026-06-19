/**
 * Serviço que consome o backend VigiaSUS.
 * Retorna dados enriquecidos: CNES + BNAFAR + alertas detectados + cache info.
 * Fallback automático para null quando o backend não está disponível.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { CnesEstabelecimento } from './cnes.service';
import { BnafarItem } from './bnafar.service';

export interface AlertaBackend {
  id: string;
  severidade: 'alto' | 'medio' | 'baixo';
  titulo: string;
  detalhe: string;
  valor?: string;
}

export interface DespesaDto {
  ano: string;
  mes: string;
  tipoDocumento: string;
  valorPago: number | null;
  funcao: string | null;
  orgao: string | null;
}

export interface TcuDto {
  status: 'limpo' | 'sancionado' | 'indisponivel';
  sancionado: boolean;
  totalOcorrencias: number;
}

export interface AnaliseBackend {
  cnes: CnesEstabelecimento;
  estoque: BnafarItem[];
  alertas: AlertaBackend[];
  despesas: DespesaDto[];
  tcu: TcuDto;
  fonte: 'live' | 'cache';
  sincronizado: string;
}

export interface DashboardStats {
  totalEstabelecimentos: number;
  totalAlertas: number;
  alertasAlto: number;
  alertasMedio: number;
  alertasBaixo: number;
  estabelecimentosComAlerta: number;
}

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
