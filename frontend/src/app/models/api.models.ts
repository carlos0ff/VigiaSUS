import { CnesEstabelecimento } from './cnes.models';
import { BnafarItem } from './bnafar.models';

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
