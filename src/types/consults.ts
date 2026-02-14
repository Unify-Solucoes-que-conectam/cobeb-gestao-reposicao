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
  status: string
  celular_corporativo: string
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