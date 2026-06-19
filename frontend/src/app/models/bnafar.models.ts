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
