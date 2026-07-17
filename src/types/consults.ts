import { Base } from "./app"

export type StatusAvaria = 'pendente' | 'em_analise' | 'concluido'

export type Avaria = Base & {
  status: StatusAvaria
  mapa: Mapa
  cliente: Cliente
  notas_fiscais: NotaFiscal[]
  produtos: Produto[]
  anexos: Anexo[]
  usuario_responsavel_id: string
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

export type Anexo = Base & {
  path: string
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
  qntd_notas_fiscais?: number // quantidade de notas fiscais associadas ao cliente, se solicitadas via parâmetro na consulta
  qntd_produtos?: number // quantidade de produtos associados às notas fiscais do cliente, se solicitadas via parâmetro na consulta
}

export type NotaFiscal = Base & {
  numero: string
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
  codigo: string
  status: "ativo" | "inativo"
  motorista: Motorista
  clientes: Cliente[]
  notas_fiscais: Exclude<NotaFiscal, 'produtos' | 'cliente' | 'mapa'>[]
  usuario_responsavel_id: string
}

export type TiposAvaria = Base & {
  nome: string
  descricao: string
}