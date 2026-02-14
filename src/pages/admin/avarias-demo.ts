import { Avaria } from "../../types/consults";

export const avarias_demo: Avaria[] = [
  {
    mapa: "90210",
    tipo: "faltante",
    quantidade: 12,
    data: "2026-02-13T11:55:00",
    nf: "972906",
    status: "em_analise",
    imagens: [
      "https://via.placeholder.com/300",
      "https://via.placeholder.com/400"
    ],

    motorista: {
      id: "mot-1",
      created_at: "2026-02-13T10:00:00Z",
      updated_at: "2026-02-13T10:00:00Z",
      codigo: "122",
      nome: "BRENO DE SOUZA SPINDOLA",
      status: "ativo",
      celular_corporativo: "31999999999",
      filial: {
        id: "fil-1",
        created_at: "2026-02-13T10:00:00Z",
        updated_at: "2026-02-13T10:00:00Z",
        codigo: "F01",
        descricao: "FILIAL SÃO PAULO"
      },
      cluster: {
        id: "clu-1",
        created_at: "2026-02-13T10:00:00Z",
        updated_at: "2026-02-13T10:00:00Z",
        codigo: "C01",
        descricao: "Caminhão Diesel"
      }
    },

    cliente: {
      id: "cli-1",
      created_at: "2026-02-13T10:00:00Z",
      updated_at: "2026-02-13T10:00:00Z",
      codigo: "4509",
      documento: "12345678000199",
      nome_fantasia: "DUMONT BEBIDAS",
      razao_social: "Dumont Bebidas LTDA",
      endereco: "Rua A, 123",
      complemento: "Loja 01",
      bairro: "Centro",
      cidade: "Belo Horizonte",
      uf: "MG",
      cep: "30100-000",
      latitude: -19.9167,
      longitude: -43.9345,
      categoria: "Supermercado",
      tipo_pessoa: "J",
      pdv_ativo: true,
      contatos: [
        {
          id: "cont-1",
          created_at: "2026-02-13T10:00:00Z",
          updated_at: "2026-02-13T10:00:00Z",
          tipo: "telefone",
          valor: "3133334444"
        }
      ]
    },

    produto: [
      {
        id: "prod-1",
        created_at: "2026-02-13T10:00:00Z",
        updated_at: "2026-02-13T10:00:00Z",
        codigo: "P001",
        descricao: "BRAHMA LIGHT LATA 350ML TWIN-STACK",
        quantidade: 12,
        ean: "7891234567890",
        marca: {
          id: "marca-1",
          created_at: "2026-02-13T10:00:00Z",
          updated_at: "2026-02-13T10:00:00Z",
          codigo: "MAR01",
          descricao: "Brahma"
        },
        embalagem: {
          id: "emb-1",
          created_at: "2026-02-13T10:00:00Z",
          updated_at: "2026-02-13T10:00:00Z",
          codigo: "EMB01",
          descricao: "Lata"
        }
      }
    ]
  }
]