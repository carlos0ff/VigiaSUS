package com.saude.vigisus.client.cnes;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CnesResponse(
        Integer codigo_cnes,
        String nome_fantasia,
        String nome_razao_social,
        String numero_cnpj,
        String tipo_gestao,
        String descricao_esfera_administrativa,
        Integer codigo_tipo_unidade,
        String codigo_cep_estabelecimento,
        String endereco_estabelecimento,
        String numero_estabelecimento,
        String bairro_estabelecimento,
        String numero_telefone_estabelecimento,
        String estabelecimento_faz_atendimento_ambulatorial_sus,
        String codigo_estabelecimento_saude,
        Integer codigo_uf,
        Integer codigo_municipio,
        Integer estabelecimento_possui_atendimento_hospitalar,
        String descricao_natureza_juridica_estabelecimento,
        String data_atualizacao
) {}
