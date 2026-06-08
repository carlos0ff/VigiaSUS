/**
 * API CNES — Cadastro Nacional de Estabelecimentos de Saúde
 * Fonte: DATASUS / Ministério da Saúde
 * Base: https://apidadosabertos.saude.gov.br
 * Docs: https://apidadosabertos.saude.gov.br/v1/#/CNES
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';

export interface CnesEstabelecimento {
  codigo_cnes: number;
  nome_fantasia: string;
  nome_razao_social: string;
  numero_cnpj: string;
  tipo_gestao: string;                  // E=Estadual, M=Municipal, D=Dupla, S=Sem
  descricao_esfera_administrativa: string;
  codigo_tipo_unidade: number;
  codigo_cep_estabelecimento: string;
  endereco_estabelecimento: string;
  numero_estabelecimento: string;
  bairro_estabelecimento: string;
  numero_telefone_estabelecimento: string;
  estabelecimento_faz_atendimento_ambulatorial_sus: string;
  codigo_estabelecimento_saude: string;
  codigo_uf: number;
  codigo_municipio: number;
  estabelecimento_possui_atendimento_hospitalar: number;
  descricao_natureza_juridica_estabelecimento: string;
  data_atualizacao: string;
}

// Mapa código UF (IBGE) → sigla
const UF_MAP: Record<number, string> = {
  11:'RO',12:'AC',13:'AM',14:'RR',15:'PA',16:'AP',17:'TO',
  21:'MA',22:'PI',23:'CE',24:'RN',25:'PB',26:'PE',27:'AL',28:'SE',29:'BA',
  31:'MG',32:'ES',33:'RJ',35:'SP',
  41:'PR',42:'SC',43:'RS',
  50:'MS',51:'MT',52:'GO',53:'DF',
};

// Mapa código tipo unidade → descrição
const TIPO_UNIDADE_MAP: Record<number, string> = {
  1:'Posto de Saúde', 2:'Centro de Saúde / UBS', 4:'Policlínica',
  5:'Hospital Geral', 7:'Hospital Especializado', 15:'Unidade Mista',
  20:'Pronto Socorro', 22:'Consultório', 36:'Clínica/Especialidade',
  39:'UPA 24h', 40:'Unidade de Vigilância em Saúde', 71:'CAPS',
  83:'Polo Academia da Saúde',
};

export function ufFromCode(code: number): string {
  return UF_MAP[code] ?? String(code);
}

export function tipoUnidade(code: number): string {
  return TIPO_UNIDADE_MAP[code] ?? `Tipo ${code}`;
}

@Injectable({ providedIn: 'root' })
export class CnesService {
  private http = inject(HttpClient);
  // Em dev, o Angular proxy redireciona /api-gov → https://apidadosabertos.saude.gov.br
  private readonly base = '/api-gov';

  buscarEstabelecimento(cnesCode: string): Observable<CnesEstabelecimento | null> {
    return this.http
      .get<CnesEstabelecimento>(`${this.base}/cnes/estabelecimentos/${cnesCode}`)
      .pipe(catchError(() => of(null)));
  }
}
