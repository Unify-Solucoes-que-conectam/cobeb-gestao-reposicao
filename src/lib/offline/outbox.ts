import type { AxiosResponse } from 'axios'

import axios from '@/lib/axios'
import type { Avaria, Cliente, ItemAvaria, NotaFiscal, TiposAvaria } from '@/types/consults'

import { outboxAll, outboxDelete, outboxPut } from './idb'
import { assertReachable, isBrowserOffline, isUnreachable, REQUEST_TIMEOUT } from './network'

/**
 * Fila de operações feitas sem conexão (outbox).
 *
 * Cada ação do motorista que altera dados (registrar avaria, enviar para análise)
 * é gravada aqui (IndexedDB) e reenviada, em ordem, quando a conexão voltar.
 * Enquanto não sincroniza, as telas enxergam o efeito da fila por "overlay":
 * as avarias aparecem na lista e as quantidades da nota fiscal já são abatidas.
 */

export const LOCAL_ID_PREFIX = 'offline-'
export const isLocalId = (id: string) => id.startsWith(LOCAL_ID_PREFIX)

export const OFFLINE_SYNCED_EVENT = 'offline:synced'

// ------------------------------------------------------------------- tipos

export interface CreatePayload {
  cliente_id: string
  motorista_id: string
  produtos: Array<{ produto_id: string; tipo_avaria_id: string; quantidade: number }>
  anexos: Array<{ nome: string; base64: string }>
}

/** Dados só para exibir a avaria localmente enquanto ela não existe no servidor. */
export interface CreateMeta {
  notaFiscalId: string
  notaFiscalNumero: string
  itens: Array<{
    produtoId: string
    codigo: string
    descricao: string
    quantidade: number
    quantidadeTotal: number
    /** Opcional: itens enfileirados antes desta versão não possuem. */
    unidadeMedida?: string | null
    tipoAvaria: Pick<TiposAvaria, 'id' | 'codigo' | 'nome' | 'descricao'>
  }>
}

interface BaseOp {
  id: string
  createdAt: number
  status: 'pending' | 'error'
  error?: string
  clienteId: string
  /** Apenas em memória: true enquanto a sincronização está em andamento para este item. */
  syncing?: boolean
}

export interface CreateOp extends BaseOp {
  type: 'create'
  payload: CreatePayload
  meta: CreateMeta
}

export interface EnviarOp extends BaseOp {
  type: 'enviar'
  /** Id real (servidor). Ausente quando a avaria ainda é local: resolvemos pela nota fiscal. */
  avariaId?: string
  notaFiscalNumero: string
}

export type OutboxOp = CreateOp | EnviarOp

// ------------------------------------------------------------------ estado

let ops: OutboxOp[] = []
let syncingIds = new Set<string>()
const listeners = new Set<() => void>()

const ready: Promise<void> = outboxAll<OutboxOp>().then((stored) => {
  // mescla com o que possa ter sido enfileirado durante a leitura
  const ids = new Set(ops.map((o) => o.id))
  ops = [...stored.filter((o) => !ids.has(o.id)), ...ops].sort((a, b) => a.createdAt - b.createdAt)
  emit()
})

function emit() {
  ops = ops.map((o) => ({ ...o, syncing: syncingIds.has(o.id) }))
  listeners.forEach((l) => l())
}

export function subscribeOutbox(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getOutboxSnapshot = () => ops

function newId() {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  return `${LOCAL_ID_PREFIX}${uuid}`
}

async function persist(op: OutboxOp) {
  // "syncing" é só estado de tela, não vai para o banco
  const { syncing: _syncing, ...clean } = op
  await outboxPut(clean as OutboxOp)
  ops = [...ops.filter((o) => o.id !== op.id), op].sort((a, b) => a.createdAt - b.createdAt)
  emit()
}

async function drop(id: string) {
  await outboxDelete(id)
  ops = ops.filter((o) => o.id !== id)
  emit()
}

export const pendingCount = () => ops.filter((o) => o.status === 'pending').length

// ----------------------------------------------------------------- enfileirar

export async function enqueueCreate(
  clienteId: string,
  payload: CreatePayload,
  meta: CreateMeta
): Promise<CreateOp> {
  await ready
  const op: CreateOp = {
    id: newId(),
    createdAt: Date.now(),
    status: 'pending',
    clienteId,
    type: 'create',
    payload,
    meta,
  }
  await persist(op)
  void flushOutbox()
  return op
}

export async function enqueueEnviar(
  clienteId: string,
  notaFiscalNumero: string,
  avariaId?: string
): Promise<EnviarOp | null> {
  await ready

  const duplicate = ops.some(
    (o) =>
      o.type === 'enviar' &&
      o.status === 'pending' &&
      o.clienteId === clienteId &&
      (avariaId ? o.avariaId === avariaId : !o.avariaId && o.notaFiscalNumero === notaFiscalNumero)
  )
  if (duplicate) return null

  const op: EnviarOp = {
    id: newId(),
    createdAt: Date.now(),
    status: 'pending',
    clienteId,
    type: 'enviar',
    avariaId,
    notaFiscalNumero,
  }
  await persist(op)
  void flushOutbox()
  return op
}

/** Remove uma avaria que ainda só existe no aparelho (cancela o registro enfileirado). */
export async function removeLocalAvaria(localId: string) {
  await ready
  await drop(localId)
}

export async function discardOp(id: string) {
  await ready
  await drop(id)
}

export async function retryOp(id: string) {
  await ready
  const op = ops.find((o) => o.id === id)
  if (!op) return
  await persist({ ...op, status: 'pending', error: undefined })
  void flushOutbox()
}

export async function hasPendingOps() {
  await ready
  return pendingCount() > 0
}

// -------------------------------------------------------------- sincronização

type ExecResult = { kind: 'done' } | { kind: 'network' } | { kind: 'error'; message: string }

function firstValidationMessage(data: any): string | undefined {
  const errors = data?.errors ?? data?.debug_errors
  if (!errors || typeof errors !== 'object') return undefined
  return (Object.values(errors).flat() as string[])[0]
}

type RequestResult = { response: AxiosResponse } | { network: true } | { failure: string }

async function request(fn: () => Promise<AxiosResponse>): Promise<RequestResult> {
  try {
    return { response: assertReachable(await fn()) }
  } catch (e) {
    if (isUnreachable(e)) return { network: true }
    return { failure: e instanceof Error ? e.message : 'Erro inesperado' }
  }
}

async function execCreate(op: CreateOp): Promise<ExecResult> {
  const res = await request(() => axios.post('/avarias', op.payload, { timeout: 60_000 }))
  if ('network' in res) return { kind: 'network' }
  if ('failure' in res) return { kind: 'error', message: res.failure }

  const { response } = res
  if (response.status === 401) return { kind: 'network' } // sessão expirada: mantém na fila
  if (response.data?.success) return { kind: 'done' }

  return {
    kind: 'error',
    message: firstValidationMessage(response.data) || response.data?.message || `Erro ${response.status}`,
  }
}

async function execEnviar(op: EnviarOp): Promise<ExecResult> {
  let ids: string[] = []

  if (op.avariaId) {
    ids = [op.avariaId]
  } else {
    // avaria criada offline: agora que o registro subiu, localizamos a pendente da nota
    const res = await request(() =>
      axios.get(`/clientes/${op.clienteId}/avarias`, {
        params: { status: 'pendente' },
        timeout: REQUEST_TIMEOUT,
      })
    )
    if ('network' in res) return { kind: 'network' }
    if ('failure' in res) return { kind: 'error', message: res.failure }
    if (res.response.status === 401) return { kind: 'network' }
    if (!res.response.data?.success) {
      return { kind: 'error', message: res.response.data?.message || 'Erro ao localizar avarias' }
    }

    ids = (res.response.data.data as Avaria[])
      .filter((a) => a.nota_fiscal?.numero === op.notaFiscalNumero)
      .map((a) => a.id)
  }

  // nada pendente para esta nota (ex.: já enviada por outro caminho): nada a fazer
  for (const id of ids) {
    const res = await request(() =>
      axios.put(`/avarias/${id}/status`, { status: 'aguardando_aprovacao' }, { timeout: REQUEST_TIMEOUT })
    )
    if ('network' in res) return { kind: 'network' }
    if ('failure' in res) return { kind: 'error', message: res.failure }
    if (res.response.status === 401) return { kind: 'network' }
    if (!res.response.data?.success) {
      return { kind: 'error', message: res.response.data?.message || `Erro ${res.response.status}` }
    }
  }

  return { kind: 'done' }
}

let flushing = false

/** Envia a fila em ordem. Para na primeira falha de rede; itens com erro de negócio ficam marcados. */
export async function flushOutbox(): Promise<void> {
  await ready
  if (flushing || isBrowserOffline()) return
  if (!localStorage.getItem('auth_token')) return

  flushing = true
  let synced = 0

  // tudo que está na fila passa a "Sincronizando" enquanto o envio estiver em andamento
  syncingIds = new Set(ops.filter((o) => o.status === 'pending').map((o) => o.id))
  emit()

  try {
    for (const op of [...ops]) {
      if (op.status !== 'pending') continue

      const result = op.type === 'create' ? await execCreate(op) : await execEnviar(op)

      if (result.kind === 'network') break

      syncingIds.delete(op.id)

      if (result.kind === 'done') {
        await drop(op.id)
        synced++
      } else {
        await persist({ ...op, status: 'error', error: result.message })
      }
    }
  } finally {
    flushing = false
    // o que não foi enviado (sem conexão) volta a "Aguardando conexão"
    syncingIds = new Set()
    emit()
  }

  if (synced > 0) window.dispatchEvent(new CustomEvent(OFFLINE_SYNCED_EVENT, { detail: { synced } }))
}

let started = false

/** Liga os gatilhos de sincronização (volta da conexão, app em primeiro plano, intervalo). */
export function startOfflineSync() {
  if (started || typeof window === 'undefined') return
  started = true

  const trigger = () => void flushOutbox()

  window.addEventListener('online', trigger)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') trigger()
  })
  setInterval(() => {
    if (pendingCount() > 0) trigger()
  }, 30_000)

  void ready.then(trigger)
}

// ------------------------------------------------------- status de sincronização

export type SyncState = 'aguardando_conexao' | 'sincronizando'

/**
 * Situação de uma avaria em relação à fila offline:
 *  - 'sincronizando': há registro/envio dela sendo enviado agora;
 *  - 'aguardando_conexao': há registro/envio dela na fila, esperando conexão;
 *  - null: nada pendente (o status normal da avaria vale).
 */
export function getSyncState(
  avaria: Pick<Avaria, 'id' | 'nota_fiscal'> & { cliente?: Pick<Cliente, 'id'> },
  queue: OutboxOp[]
): SyncState | null {
  const related = queue.filter((o) => {
    if (o.status !== 'pending') return false
    if (o.id === avaria.id) return true
    if (o.type !== 'enviar') return false
    if (o.avariaId) return o.avariaId === avaria.id
    return (
      isLocalId(avaria.id) &&
      o.clienteId === avaria.cliente?.id &&
      o.notaFiscalNumero === avaria.nota_fiscal?.numero
    )
  })

  if (related.length === 0) return null
  return related.some((o) => o.syncing) ? 'sincronizando' : 'aguardando_conexao'
}

// ------------------------------------------------------------------- overlays

function buildLocalAvaria(op: CreateOp, enviada: boolean): Avaria {
  const iso = new Date(op.createdAt).toISOString()

  const itens = op.meta.itens.map(
    (it, i) =>
      ({
        id: `${op.id}-item-${i}`,
        created_at: iso,
        updated_at: iso,
        produto: {
          id: it.produtoId,
          codigo: it.codigo,
          descricao: it.descricao,
          quantidade_avariada: it.quantidade,
          quantidade_total: it.quantidadeTotal,
          unidade_medida: it.unidadeMedida ?? null,
          tipo_avaria: it.tipoAvaria,
        },
      }) as unknown as ItemAvaria
  )

  return {
    id: op.id,
    created_at: iso,
    updated_at: iso,
    status: enviada ? 'aguardando_aprovacao' : 'pendente',
    data_emissao: iso,
    data_aprovacao: null,
    motivo_reprovacao: null,
    whatsapp_notification_status: null,
    whatsapp_notification_phone: null,
    whatsapp_notification_error: null,
    whatsapp_notification_sent_at: null,
    itens,
    anexos: op.payload.anexos.map((a, i) => ({
      id: `${op.id}-anexo-${i}`,
      created_at: iso,
      updated_at: iso,
      path: a.base64,
    })),
    nota_fiscal: {
      id: op.meta.notaFiscalId,
      numero: op.meta.notaFiscalNumero,
      pedido: '',
      data_emissao: iso,
      produtos: [],
      created_at: iso,
      updated_at: iso,
    } as NotaFiscal,
    cliente: { id: op.clienteId } as Cliente,
  }
}

/** Abate das quantidades da nota fiscal o que já foi registrado offline e ainda não subiu. */
export async function applyNotaOverlay<T extends NotaFiscal | null>(clienteId: string, nota: T): Promise<T> {
  await ready
  if (!nota) return nota

  const creates = ops.filter(
    (o): o is CreateOp => o.type === 'create' && o.status === 'pending' && o.clienteId === clienteId
  )
  if (creates.length === 0) return nota

  const produtos = nota.produtos.map((p) => ({ ...p }))
  for (const op of creates) {
    for (const item of op.payload.produtos) {
      const produto = produtos.find((p) => p.id === item.produto_id)
      if (!produto) continue
      produto.quantidade = Math.max(0, produto.quantidade - item.quantidade)
      produto.quantidade_avariada = (produto.quantidade_avariada ?? 0) + item.quantidade
    }
  }

  return { ...nota, produtos } as T
}

/** Mescla a lista de avarias do cliente com o que está na fila (novas e envios pendentes). */
export async function applyAvariasOverlay(
  clienteId: string,
  avarias: Avaria[],
  status?: string
): Promise<Avaria[]> {
  await ready

  const mine = ops.filter((o) => o.clienteId === clienteId && o.status === 'pending')
  const enviarOps = mine.filter((o): o is EnviarOp => o.type === 'enviar')
  const creates = mine.filter((o): o is CreateOp => o.type === 'create')

  const server = avarias.map((a) =>
    a.status === 'pendente' && enviarOps.some((e) => e.avariaId === a.id)
      ? { ...a, status: 'aguardando_aprovacao' as const }
      : a
  )

  const local = creates.map((c) =>
    buildLocalAvaria(
      c,
      enviarOps.some(
        (e) => !e.avariaId && e.notaFiscalNumero === c.meta.notaFiscalNumero && e.createdAt > c.createdAt
      )
    )
  )

  const merged = [...local.reverse(), ...server]
  return status ? merged.filter((a) => a.status === status) : merged
}
