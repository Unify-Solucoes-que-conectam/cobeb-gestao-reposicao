import { Base } from "./app"

export type TiposAvaria = 'avariado' | 'faltante' | 'inversao'
export type StatusAvaria = 'aguardando_analise' | 'em_analise' | 'concluido'

export type Avaria = {
  mapa: string
  motorista: Motorista
  produto: Produto[]
  cliente: Cliente
  tipo: TiposAvaria
  quantidade: number
  data: string
  nf: string
  status: StatusAvaria
  imagens: string[]
}

export type Produto = Base & {
  codigo: string
  descricao: string
  quantidade: number
  marca: Marca
  embalagem: Embalagem
  ean: string
}

export type Marca = Base & {
  codigo: string
  descricao: string
}

export type Embalagem = Base & {
  codigo: string
  descricao: string
}

export type Filial = Base & {
  codigo: string
  descricao: string
}

export type Cluster = Base & {
  codigo: string
  descricao: string
}

export type Categoria = Base & {
  codigo: string
  descricao: string
}

export type Contato = Base & {
  tipo: string
  valor: string
}

export type Motorista = Base & {
  codigo: string
  nome: string
  cpf: string
  status: "ativo" | "inativo"
  celular_corporativo: string
  data_admissao: string
  filial: Filial
  cluster: Cluster
}

export type Cliente = Base & {
  codigo: string
  documento: string
  nome_fantasia: string
  razao_social: string
  endereco: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  latitude: number
  longitude: number
  categoria: string
  tipo_pessoa: string
  pdv_ativo: boolean
  contatos: Contato[]
}

export type NotaFiscal = Base & {
  codigo: string
  pedido: string
  mapa: string
  cliente: Cliente
  produtos: Produto[]
  data_operacao: string
  data_emissao: string
  valor_bruto: number
  total_desconto: number
  valor_total: number
  status: string
}

export type Mapa = {
  mapa: string
  qntd_notas: number
  qntd_clientes: number
  motorista: {
    id: string
    codigo: string
    nome: string
    cluster: string
    filial: string
  }
  clientes: {
    id: string
    nome: string
    notas_fiscais: {
      id: string
      numero_nota: string
      valor_total_nota: string
      produtos: {
        id: string
        descricao: string
        quantidade: number
        valor_unitario: number
        valor_total: number
      }[]
    }[]
  }[]
}