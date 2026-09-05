import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Copy, MessageCircleMore, Power, QrCode, RefreshCw, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, PasswordInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useHeader } from '@/hooks/use-header'
import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/api-response'
import type { Filial } from '@/types/consults'

type WhatsAppProvider = 'official' | 'baileys'
type WhatsAppStatus = 'creating' | 'pending_webhook' | 'waiting_qr' | 'connected' | 'disconnected' | 'error'
type WhatsAppEvent = 'avaria_approved' | 'avaria_rejected' | 'import_report' | 'manual_notification'

type TemplateMapping = {
  event: WhatsAppEvent
  template_name: string
  language_code: string
  status: string
}

type MetaWebhook = { url: string | null; verify_token: string | null }

type WhatsAppConfiguration = {
  id: string
  filial_id: string
  is_global: boolean
  provider: WhatsAppProvider
  instance_name: string
  status: WhatsAppStatus
  connected_at: string | null
  last_checked_at: string | null
  last_error: string | null
  token_configured: boolean
  phone_number_id: string | null
  business_account_id: string | null
  token_expires_at: string | null
  connected_phone: string | null
  templates: TemplateMapping[]
  meta_webhook: MetaWebhook | null
}

type ConfigurationEntry = {
  filial: Filial
  configuration: WhatsAppConfiguration | null
  uses_global: boolean
  configuration_owner: Filial | null
}
type QrCodeData = { base64: string; expires_at: string }
type RemoteTemplate = { name: string; language_code: string; status: string }

const eventLabels: Record<WhatsAppEvent, string> = {
  avaria_approved: 'Avaria aprovada',
  avaria_rejected: 'Avaria reprovada',
  import_report: 'Relatório de importação/avaria',
  manual_notification: 'Notificação manual',
}

const eventVariableHints: Record<WhatsAppEvent, string> = {
  avaria_approved: 'Variáveis: cliente, protocolo e filial.',
  avaria_rejected: 'Variáveis: cliente, protocolo, motivo e filial.',
  import_report: 'Cabeçalho de documento; variáveis: cliente e protocolo.',
  manual_notification: 'Variável: mensagem informada pelo operador.',
}

const statusLabels: Record<WhatsAppStatus, string> = {
  creating: 'Criando',
  pending_webhook: 'Aguardando webhook',
  waiting_qr: 'Aguardando QR Code',
  connected: 'Conectado',
  disconnected: 'Desconectado',
  error: 'Erro',
}

export default function AdminWhatsApp() {
  const { setPageBreadcrumbs } = useHeader()
  const [entries, setEntries] = useState<ConfigurationEntry[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [provider, setProvider] = useState<WhatsAppProvider>('baileys')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [qrCode, setQrCode] = useState<QrCodeData | null>(null)
  const [accessToken, setAccessToken] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [businessAccountId, setBusinessAccountId] = useState('')
  const [remoteTemplates, setRemoteTemplates] = useState<RemoteTemplate[]>([])
  const [templateMappings, setTemplateMappings] = useState<Partial<Record<WhatsAppEvent, string>>>({})
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Mensagem de teste do sistema Cobeb.')
  const [testEvent, setTestEvent] = useState<WhatsAppEvent>('manual_notification')
  const [clock, setClock] = useState(Date.now())
  const [useAsGlobal, setUseAsGlobal] = useState(false)
  const automaticQrRequests = useRef(new Set<string>())

  const selected = useMemo(() => entries.find((entry) => entry.filial.id === selectedId), [entries, selectedId])

  useEffect(() => {
    setPageBreadcrumbs([
      { title: 'Gerenciar', href: '#' },
      { title: 'WhatsApp', href: '/admin/gerenciar/whatsapp' },
    ])
  }, [setPageBreadcrumbs])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get<ApiResponse<ConfigurationEntry[]>>('/whatsapp/configurations')
      setEntries(response.data.data)
      setSelectedId((current) => current || response.data.data[0]?.filial.id || '')
    } catch {
      toast.error('Não foi possível carregar as configurações do WhatsApp.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  useEffect(() => {
    const configuration = selected?.configuration
    setProvider(configuration?.provider ?? 'baileys')
    setUseAsGlobal(configuration?.is_global ?? false)
    setAccessToken('')
    setPhoneNumberId(configuration?.phone_number_id ?? '')
    setBusinessAccountId(configuration?.business_account_id ?? '')
    setTemplateMappings(Object.fromEntries((configuration?.templates ?? []).map((item) => [item.event, `${item.template_name}|${item.language_code}`])))
    setQrCode(null)
    setRemoteTemplates([])
  }, [selectedId])

  const updateConfiguration = useCallback((configuration: WhatsAppConfiguration | null) => {
    setEntries((current) => {
      if (configuration?.is_global && selected) {
        const owner = current.find((entry) => entry.filial.id === configuration.filial_id)?.filial ?? selected.filial
        return current.map((entry) => ({
          ...entry,
          configuration,
          uses_global: entry.filial.id !== configuration.filial_id,
          configuration_owner: owner,
        }))
      }

      return current.map((entry) => entry.filial.id === selectedId
        ? { ...entry, configuration, uses_global: false, configuration_owner: null }
        : entry)
    })
  }, [selected, selectedId])

  const refreshConnection = useCallback(async (silent = false) => {
    if (!selectedId) return
    try {
      const response = await axios.get<ApiResponse<WhatsAppConfiguration>>(`/whatsapp/configurations/${selectedId}/connection`)
      updateConfiguration(response.data.data)
      if (!silent && response.data.data.status === 'connected') toast.success('WhatsApp conectado com sucesso.')
    } catch {
      if (!silent) toast.error('Não foi possível consultar a conexão.')
    }
  }, [selectedId, updateConfiguration])

  useEffect(() => {
    if (selected?.configuration?.status !== 'waiting_qr') return
    const timer = window.setInterval(() => { void refreshConnection(true) }, 3000)
    return () => window.clearInterval(timer)
  }, [selected?.configuration?.status, refreshConnection])

  useEffect(() => {
    if (!qrCode) return
    setClock(Date.now())
    const timer = window.setInterval(() => setClock(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [qrCode])

  const qrSecondsRemaining = qrCode
    ? Math.max(0, Math.ceil((new Date(qrCode.expires_at).getTime() - clock) / 1000))
    : 0

  const confirmReplacement = () => !selected?.configuration || window.confirm('Esta filial já possui uma configuração. Deseja substituí-la? Os envios podem ser interrompidos até a nova conexão ficar pronta.')

  const configureBaileys = async () => {
    if (!selectedId || !confirmReplacement()) return
    try {
      setSaving(true)
      const response = await axios.put<ApiResponse<{ configuration: WhatsAppConfiguration; qrcode: QrCodeData | null }>>(
        `/whatsapp/configurations/${selectedId}/baileys`,
        { replace: !!selected?.configuration, is_global: useAsGlobal },
      )
      updateConfiguration(response.data.data.configuration)
      setQrCode(response.data.data.qrcode)
      toast.success(response.data.message)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Não foi possível criar a instância.')
    } finally {
      setSaving(false)
    }
  }

  const configureOfficial = async () => {
    if (!selectedId || !phoneNumberId || !businessAccountId || (!accessToken && !selected?.configuration?.token_configured)) {
      toast.error('Preencha as credenciais obrigatórias da Meta.')
      return
    }
    if (!confirmReplacement()) return

    try {
      setSaving(true)
      const response = await axios.put<ApiResponse<{ configuration: WhatsAppConfiguration; meta_webhook: MetaWebhook }>>(
        `/whatsapp/configurations/${selectedId}/official`,
        {
          access_token: accessToken || undefined,
          phone_number_id: phoneNumberId,
          business_account_id: businessAccountId,
          replace: !!selected?.configuration,
          is_global: useAsGlobal,
        },
      )
      updateConfiguration({ ...response.data.data.configuration, meta_webhook: response.data.data.meta_webhook })
      setAccessToken('')
      toast.success(response.data.message)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Não foi possível configurar a API Oficial.')
    } finally {
      setSaving(false)
    }
  }

  const refreshQrCode = async () => {
    try {
      setSaving(true)
      const response = await axios.post<ApiResponse<{ configuration: WhatsAppConfiguration; qrcode: QrCodeData | null }>>(`/whatsapp/configurations/${selectedId}/qrcode`)
      updateConfiguration(response.data.data.configuration)
      setQrCode(response.data.data.qrcode)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Não foi possível renovar o QR Code.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const configuration = selected?.configuration
    if (!configuration || configuration.provider !== 'baileys' || configuration.status !== 'waiting_qr' || qrCode) return

    const requestKey = `${selectedId}:${configuration.instance_name}`
    if (automaticQrRequests.current.has(requestKey)) return

    automaticQrRequests.current.add(requestKey)
    void refreshQrCode()
  }, [selectedId, selected?.configuration, qrCode])

  const reconnect = async () => {
    try {
      setSaving(true)
      const response = await axios.post<ApiResponse<WhatsAppConfiguration | { configuration: WhatsAppConfiguration; qrcode: QrCodeData | null }>>(`/whatsapp/configurations/${selectedId}/reconnect`)
      if ('configuration' in response.data.data) {
        updateConfiguration(response.data.data.configuration)
        setQrCode(response.data.data.qrcode)
      } else {
        updateConfiguration(response.data.data)
      }
      toast.success(response.data.message)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Não foi possível reconectar a instância.')
    } finally {
      setSaving(false)
    }
  }

  const changeGlobalScope = async (enabled: boolean) => {
    if (!selectedId || selected?.uses_global) return
    if (enabled && !window.confirm('Usar esta mesma instância em todas as filiais? As configurações individuais ficarão temporariamente sem uso.')) return

    try {
      setSaving(true)
      const response = await axios.put<ApiResponse<WhatsAppConfiguration>>(`/whatsapp/configurations/${selectedId}/global`, { enabled })
      setUseAsGlobal(enabled)
      toast.success(response.data.message)
      await load()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Não foi possível alterar o alcance da instância.')
    } finally {
      setSaving(false)
    }
  }

  const loadTemplates = async () => {
    try {
      setSaving(true)
      const response = await axios.get<ApiResponse<RemoteTemplate[]>>(`/whatsapp/configurations/${selectedId}/official/templates`)
      setRemoteTemplates(response.data.data)
      if (!response.data.data.length) toast.info('Nenhum template aprovado foi encontrado na Meta.')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Não foi possível consultar os templates.')
    } finally {
      setSaving(false)
    }
  }

  const saveTemplates = async () => {
    const templates = (Object.entries(templateMappings) as [WhatsAppEvent, string][])
      .filter(([, name]) => !!name)
      .map(([event, value]) => {
        const separator = value.lastIndexOf('|')
        const name = separator >= 0 ? value.slice(0, separator) : value
        const language = separator >= 0 ? value.slice(separator + 1) : 'pt_BR'
        return { event, template_name: name, language_code: language, status: 'APPROVED' }
      })
    if (!templates.length) return toast.error('Selecione pelo menos um template.')

    try {
      setSaving(true)
      const response = await axios.put<ApiResponse<WhatsAppConfiguration>>(`/whatsapp/configurations/${selectedId}/templates`, { templates })
      updateConfiguration(response.data.data)
      toast.success(response.data.message)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Não foi possível salvar os templates.')
    } finally {
      setSaving(false)
    }
  }

  const sendTest = async () => {
    if (!testPhone) return toast.error('Informe o telefone de destino.')
    try {
      setSaving(true)
      const response = await axios.post<ApiResponse>(`/whatsapp/configurations/${selectedId}/test`, {
        phone: testPhone.replace(/\D/g, ''),
        message: testMessage,
        event: selected?.configuration?.provider === 'official' ? testEvent : undefined,
      })
      toast.success(response.data.message)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Não foi possível enfileirar o teste.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!selectedId || !window.confirm('Excluir a configuração e a instância desta filial?')) return
    try {
      setSaving(true)
      await axios.delete(`/whatsapp/configurations/${selectedId}`)
      updateConfiguration(null)
      setQrCode(null)
      await load()
      toast.success('Configuração removida.')
    } catch (error: any) {
      const force = window.confirm(`${error.response?.data?.message || 'A instância remota não pôde ser removida.'}\n\nDeseja remover somente a configuração local?`)
      if (force) {
        await axios.delete(`/whatsapp/configurations/${selectedId}`, { params: { force: true } })
        updateConfiguration(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const copy = async (value?: string | null) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    toast.success('Copiado.')
  }

  if (loading) return <div className="py-12 text-center text-muted-foreground">Carregando configurações...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">WhatsApp por filial</h1>
        <p className="text-muted-foreground">Configure a API Oficial ou conecte um aparelho usando QR Code.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader><CardTitle className="text-base">Filiais</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {entries.map((entry) => (
              <button key={entry.filial.id} onClick={() => setSelectedId(entry.filial.id)} className={`w-full rounded-lg border p-3 text-left transition ${selectedId === entry.filial.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                <div className="font-medium">{entry.filial.codigo} — {entry.filial.descricao}</div>
                <div className="mt-1 text-xs text-muted-foreground">{entry.configuration ? statusLabels[entry.configuration.status] : 'Não configurado'}</div>
                {entry.uses_global && <div className="mt-1 text-xs font-medium text-primary">Usando instância geral</div>}
              </button>
            ))}
          </CardContent>
        </Card>

        {selected ? (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{selected.filial.descricao}</CardTitle>
                  <CardDescription>{selected.configuration?.instance_name || 'Nenhuma instância criada'}</CardDescription>
                </div>
                {selected.configuration && <span className={`rounded-full px-3 py-1 text-xs font-medium ${selected.configuration.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{statusLabels[selected.configuration.status]}</span>}
              </CardHeader>
              {selected.configuration && (
                <CardContent className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => void refreshConnection()} disabled={saving}><RefreshCw /> Atualizar estado</Button>
                  <Button variant="outline" onClick={() => void reconnect()} disabled={saving}><Power /> Reconectar</Button>
                  <Button variant="destructive" onClick={() => void remove()} disabled={saving || selected.uses_global}><Trash2 /> Excluir</Button>
                  {selected.configuration.connected_phone && <span className="self-center text-sm">Telefone: {selected.configuration.connected_phone}</span>}
                  {selected.configuration.last_checked_at && <span className="self-center text-xs text-muted-foreground">Verificado em {new Date(selected.configuration.last_checked_at).toLocaleString('pt-BR')}</span>}
                </CardContent>
              )}
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between gap-4 pt-6">
                <div>
                  <p className="font-medium">Instância geral</p>
                  <p className="text-sm text-muted-foreground">
                    {selected.uses_global
                      ? `Esta filial usa a instância geral configurada por ${selected.configuration_owner?.descricao || 'outra filial'}.`
                      : 'Quando ativada, esta mesma conexão será utilizada nos envios de todas as filiais.'}
                  </p>
                </div>
                <Switch
                  checked={selected.configuration?.is_global ?? useAsGlobal}
                  disabled={saving || selected.uses_global}
                  onCheckedChange={(enabled) => {
                    if (selected.configuration) void changeGlobalScope(enabled)
                    else setUseAsGlobal(enabled)
                  }}
                  aria-label="Usar esta instância em todas as filiais"
                />
              </CardContent>
            </Card>

            <Tabs value={provider} onValueChange={(value) => setProvider(value as WhatsAppProvider)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="baileys"
                  disabled={selected.configuration?.provider === 'official'}
                  title={selected.configuration?.provider === 'official' ? 'Exclua a configuração da API Oficial antes de trocar de provedor.' : undefined}
                >
                  <QrCode /> QR Code
                </TabsTrigger>
                <TabsTrigger
                  value="official"
                  disabled={selected.configuration?.provider === 'baileys'}
                  title={selected.configuration?.provider === 'baileys' ? 'Exclua a configuração por QR Code antes de trocar de provedor.' : undefined}
                >
                  <MessageCircleMore /> API Oficial
                </TabsTrigger>
              </TabsList>

              {selected.configuration && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Para trocar de provedor, exclua primeiro a configuração atual desta filial.
                </p>
              )}

              <TabsContent value="baileys">
                <Card>
                  <CardHeader><CardTitle>Conectar aparelho</CardTitle><CardDescription>A sessão ficará armazenada no servidor da Cobeb.</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => void (selected.configuration?.provider === 'baileys' ? refreshQrCode() : configureBaileys())}
                      disabled={saving || selected.uses_global}
                    >
                      {selected.configuration?.provider === 'baileys' ? 'Gerar novo QR Code' : 'Criar instância e gerar QR Code'}
                    </Button>
                    {qrCode && <div className="flex flex-col items-center gap-3 rounded-lg border bg-white p-4"><img src={qrCode.base64} alt="QR Code para conectar o WhatsApp" className={`w-full max-w-72 ${qrSecondsRemaining === 0 ? 'opacity-30' : ''}`} /><p className="text-sm text-slate-600">{qrSecondsRemaining > 0 ? `Escaneie em Aparelhos conectados. Expira em ${qrSecondsRemaining}s.` : 'QR Code expirado. Gere um novo código para continuar.'}</p><Button variant="outline" onClick={() => void refreshQrCode()}><RefreshCw /> Renovar QR Code</Button></div>}
                    {selected.configuration?.status === 'connected' && <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700"><CheckCircle2 /> Aparelho conectado e pronto para enviar.</div>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="official">
                <Card>
                  <CardHeader><CardTitle>Credenciais da Meta</CardTitle><CardDescription>Use um token permanente de usuário do sistema. O Phone Number ID não é o número do telefone.</CardDescription></CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2"><Label>Token de acesso</Label><PasswordInput disabled={selected.uses_global} value={accessToken} onChange={(event) => setAccessToken(event.target.value)} placeholder={selected.configuration?.token_configured ? 'Token configurado — deixe vazio para preservar' : 'Cole o token permanente'} /></div>
                    <div className="space-y-2"><Label>Phone Number ID</Label><Input disabled={selected.uses_global} value={phoneNumberId} onChange={(event) => setPhoneNumberId(event.target.value)} /></div>
                    <div className="space-y-2"><Label>WhatsApp Business Account ID</Label><Input disabled={selected.uses_global} value={businessAccountId} onChange={(event) => setBusinessAccountId(event.target.value)} /></div>
                    <Button className="md:col-span-2" onClick={() => void configureOfficial()} disabled={saving || selected.uses_global}>Validar e criar instância oficial</Button>
                  </CardContent>
                </Card>

                {selected.configuration?.provider === 'official' && (
                  <div className="mt-6 space-y-6">
                    <Card>
                      <CardHeader><CardTitle>Webhook da Meta</CardTitle><CardDescription>Cadastre estes dados no painel do aplicativo Meta.</CardDescription></CardHeader>
                      <CardContent className="space-y-3">
                        <CopyField label="URL de callback" value={selected.configuration.meta_webhook?.url} onCopy={copy} />
                        <CopyField label="Token de verificação" value={selected.configuration.meta_webhook?.verify_token} onCopy={copy} secret />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle>Templates aprovados</CardTitle><CardDescription>Associe cada evento a um template já aprovado pela Meta.</CardDescription></CardHeader>
                      <CardContent className="space-y-4">
                        <Button variant="outline" onClick={() => void loadTemplates()} disabled={saving}><RefreshCw /> Buscar na Meta</Button>
                        {(Object.keys(eventLabels) as WhatsAppEvent[]).map((event) => (
                          <div key={event} className="grid gap-2 md:grid-cols-[220px_1fr]"><div><Label>{eventLabels[event]}</Label><p className="mt-1 text-xs text-muted-foreground">{eventVariableHints[event]}</p></div><Select disabled={selected.uses_global} value={templateMappings[event] || ''} onValueChange={(value) => setTemplateMappings((current) => ({ ...current, [event]: value }))}><SelectTrigger><SelectValue placeholder="Selecione um template aprovado" /></SelectTrigger><SelectContent>{remoteTemplates.map((template) => <SelectItem key={`${template.name}-${template.language_code}`} value={`${template.name}|${template.language_code}`}>{template.name} ({template.language_code})</SelectItem>)}</SelectContent></Select></div>
                        ))}
                        <Button onClick={() => void saveTemplates()} disabled={saving || selected.uses_global || !remoteTemplates.length}>Salvar associações</Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {selected.configuration && (
              <Card>
                <CardHeader><CardTitle>Enviar teste</CardTitle><CardDescription>O envio será processado pela fila WhatsApp da filial.</CardDescription></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Telefone com DDD</Label><Input value={testPhone} onChange={(event) => setTestPhone(event.target.value)} placeholder="37999999999" /></div>
                  {selected.configuration.provider === 'official' && <div className="space-y-2"><Label>Evento/template</Label><Select value={testEvent} onValueChange={(value) => setTestEvent(value as WhatsAppEvent)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(eventLabels) as WhatsAppEvent[]).map((event) => <SelectItem key={event} value={event}>{eventLabels[event]}</SelectItem>)}</SelectContent></Select></div>}
                  <div className="space-y-2 md:col-span-2"><Label>Mensagem ou variável de teste</Label><Textarea value={testMessage} onChange={(event) => setTestMessage(event.target.value)} /></div>
                  <Button onClick={() => void sendTest()} disabled={saving || selected.configuration.status !== 'connected'}><Send /> Enfileirar teste</Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : <div className="rounded-lg border p-8 text-center text-muted-foreground">Nenhuma filial cadastrada.</div>}
      </div>
    </div>
  )
}

function CopyField({ label, value, onCopy, secret = false }: { label: string; value?: string | null; onCopy: (value?: string | null) => void; secret?: boolean }) {
  return <div className="space-y-2"><Label>{label}</Label><div className="flex gap-2"><Input readOnly type={secret ? 'password' : 'text'} value={value || 'Não configurado no servidor'} /><Button type="button" variant="outline" size="icon" disabled={!value} onClick={() => void onCopy(value)}><Copy /></Button></div></div>
}
