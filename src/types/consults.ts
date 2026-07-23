import { Base } from "./app"

export type StatusAvaria = 'pendente' | 'aprovada' | 'reprovada'

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
  marca: TipoMarca
  embalagem: Embalagem
  ean: string
}

export type TipoMarca = {
  id: string
  codigo: string
  descricao: string
}

export type Embalagem = {
  id: string
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
  descricao: string
}

export type Contato = {
  id: string
  telefone: string
  isWhatsapp: boolean
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
  filial: Filial
  categoria: Categoria
  contatos: Contato[]
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
  status: 'ativo' | 'inativo'
  tipo_pessoa: string
  quantidade_notas: number
}

export type NotaFiscal = Base & {
  numero: string
  pedido: string
  operacao: string
  data_emissao: string
  produtos: (ProdutoNotaFiscal & Produto)[]
}

export type Mapa = {
  id: string
  codigo: string
  data_entrega: string
  placa: string
}

export type TiposAvaria = Base & {
  nome: string
  descricao: string
}

export type ProdutoNotaFiscal = Base & {
  quantidade: number
  quantidade_avariada?: number
  valor_total: string
}