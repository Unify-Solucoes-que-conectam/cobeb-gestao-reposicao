import Alert from '@/components/custom/alert-dialog'
import Loader from '@/components/custom/loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { useHeader } from '@/hooks/use-header'
import { formatCPF } from '@/utils/formatters'
import { GlobeIcon, LockIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon, UsersIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import GrupoDialog from './components/grupo-dialog'
import UsuarioAcessoDialog from './components/usuario-acesso-dialog'
import { Catalogo, Grupo, PERFIL_LABEL, permissoesService, UsuarioAcesso } from './service'

export default function AdminPermissoes() {
  const { setPageBreadcrumbs } = useHeader()
  const { refreshSession } = useAuth()

  // =============== STATES ===============
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null)
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioAcesso[]>([])
  const [busca, setBusca] = useState('')
  const [spinners, setSpinners] = useState({ geral: true, usuarios: false, excluindo: '' })

  const [grupoDialog, setGrupoDialog] = useState<{ open: boolean; grupo: Grupo | null }>({ open: false, grupo: null })
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioAcesso | null>(null)

  const [buscaDebounced, setBuscaDebounced] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setBuscaDebounced(busca.trim()), 400)
    return () => clearTimeout(timer)
  }, [busca])

  // =============== DATA ===============
  const fetchGrupos = useCallback(async () => {
    const response = await permissoesService.grupos()
    if (response.success) setGrupos(response.data)
    else toast.error(response.message || 'Erro ao carregar grupos')
  }, [])

  const fetchUsuarios = useCallback(async (search?: string) => {
    setSpinners((prev) => ({ ...prev, usuarios: true }))
    try {
      const response = await permissoesService.usuarios({ search: search || undefined })
      if (response.success) setUsuarios(response.data)
      else toast.error(response.message || 'Erro ao carregar usuários')
    } finally {
      setSpinners((prev) => ({ ...prev, usuarios: false }))
    }
  }, [])

  useEffect(() => {
    setPageBreadcrumbs([
      { title: 'Gerenciar', href: '#' },
      { title: 'Permissões', href: '/admin/gerenciar/permissoes' },
    ])

    const carregar = async () => {
      try {
        const response = await permissoesService.catalogo()
        if (response.success) setCatalogo(response.data)
        else toast.error(response.message || 'Erro ao carregar permissões')
        await fetchGrupos()
      } catch {
        toast.error('Erro ao carregar permissões')
      } finally {
        setSpinners((prev) => ({ ...prev, geral: false }))
      }
    }
    void carregar()
  }, [])

  useEffect(() => { void fetchUsuarios(buscaDebounced) }, [buscaDebounced, fetchUsuarios])

  // mudanças podem afetar o próprio usuário logado (menus/ações/filiais)
  const aposSalvar = () => {
    void fetchGrupos()
    void fetchUsuarios(buscaDebounced)
    void refreshSession()
  }

  const excluirGrupo = async (grupo: Grupo) => {
    setSpinners((prev) => ({ ...prev, excluindo: grupo.id }))
    try {
      const response = await permissoesService.excluirGrupo(grupo.id)
      if (response.success) {
        toast.success(response.message)
        void fetchGrupos()
      } else {
        toast.error(response.message || 'Erro ao excluir o grupo')
      }
    } finally {
      setSpinners((prev) => ({ ...prev, excluindo: '' }))
    }
  }

  if (spinners.geral || !catalogo) return <Loader showMessage />

  const nomeMenus = new Map(catalogo.menus.flatMap((m) => [[m.id, m.titulo], ...m.sub_menus.map((s) => [s.id, s.titulo] as const)]))

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='text-2xl font-bold'>Permissões</h1>
        <p className='text-sm text-muted-foreground'>
          Grupos definem os menus e ações liberados. Em cada usuário, defina o grupo e as filiais (tenants) que ele pode acessar.
        </p>
      </div>

      <Tabs defaultValue='grupos'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='grupos'>Grupos</TabsTrigger>
          <TabsTrigger value='usuarios'>Acessos dos usuários</TabsTrigger>
        </TabsList>

        {/* ─── Grupos ─── */}
        <TabsContent value='grupos' className='mt-4 space-y-4'>
          <div className='flex justify-end'>
            <Button onClick={() => setGrupoDialog({ open: true, grupo: null })}>
              <PlusIcon size={18} /> Novo grupo
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {grupos.map((grupo) => {
              const admin = grupo.perfil === 'administrador'
              const menus = grupo.menus.map((id) => nomeMenus.get(id)).filter(Boolean)
              return (
                <Card key={grupo.id} className='flex flex-col'>
                  <CardHeader className='space-y-1'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      {grupo.nome}
                      {grupo.sistema && <LockIcon className='size-3.5 text-muted-foreground' aria-label='Grupo de sistema' />}
                    </CardTitle>
                    <CardDescription>{grupo.descricao || PERFIL_LABEL[grupo.perfil]}</CardDescription>
                    <div className='flex flex-wrap gap-1.5 pt-1'>
                      <Badge variant='secondary'>{PERFIL_LABEL[grupo.perfil]}</Badge>
                      <Badge variant='outline' className='gap-1'><UsersIcon className='size-3' />{grupo.usuarios_count}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className='flex-1 space-y-2 text-sm'>
                    {admin ? (
                      <p className='text-muted-foreground'>Acesso total.</p>
                    ) : (
                      <>
                        <p><span className='font-medium'>{grupo.permissoes.length}</span> <span className='text-muted-foreground'>ação(ões) liberada(s)</span></p>
                        <p className='line-clamp-2 text-muted-foreground'>{menus.length ? menus.join(', ') : 'Nenhum menu liberado'}</p>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className='justify-end gap-2'>
                    {!grupo.sistema && (
                      <Alert
                        title='Excluir grupo?'
                        description={`O grupo "${grupo.nome}" será excluído. Só é possível excluir grupos sem usuários.`}
                        confirmButton={{ text: 'Excluir', onClick: () => excluirGrupo(grupo) }}
                        loading={spinners.excluindo === grupo.id}
                      >
                        <Button variant='outline' size='icon' aria-label={`Excluir ${grupo.nome}`}><Trash2Icon size={16} /></Button>
                      </Alert>
                    )}
                    <Button variant='outline' onClick={() => setGrupoDialog({ open: true, grupo })}>
                      <PencilIcon size={16} /> Editar
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ─── Acessos dos usuários ─── */}
        <TabsContent value='usuarios' className='mt-4 space-y-4'>
          <div className='relative'>
            <SearchIcon className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input className='pl-9' placeholder='Pesquise pelo nome ou CPF' value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>

          {spinners.usuarios ? (
            <Loader />
          ) : usuarios.length === 0 ? (
            <p className='py-8 text-center text-muted-foreground'>Nenhum usuário encontrado</p>
          ) : (
            <div className='divide-y rounded-md border'>
              {usuarios.map((u) => {
                const geral = u.role === 'administrador' || u.acesso_geral
                return (
                  <div key={u.id} className='flex flex-col gap-2 p-3 sm:flex-row sm:items-center'>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate font-medium'>{u.nome}</p>
                      <p className='text-xs text-muted-foreground'>{formatCPF(u.cpf)}</p>
                    </div>
                    <div className='flex flex-wrap items-center gap-1.5 sm:justify-end'>
                      <Badge variant='secondary'>{u.grupo?.nome ?? 'Sem grupo'}</Badge>
                      {geral ? (
                        <Badge variant='outline' className='gap-1'><GlobeIcon className='size-3' />Geral</Badge>
                      ) : u.filiais.length > 0 ? (
                        u.filiais.map((f) => <Badge key={f.id} variant='outline'>{f.descricao}</Badge>)
                      ) : (
                        <Badge variant='destructive'>Sem filial</Badge>
                      )}
                      <Button variant='outline' size='sm' onClick={() => setUsuarioEditando(u)}>
                        <PencilIcon size={14} /> Acessos
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <GrupoDialog
        open={grupoDialog.open}
        onOpenChange={(open) => setGrupoDialog((prev) => ({ ...prev, open }))}
        catalogo={catalogo}
        grupo={grupoDialog.grupo}
        onSaved={aposSalvar}
      />
      <UsuarioAcessoDialog
        usuario={usuarioEditando}
        onOpenChange={(open) => !open && setUsuarioEditando(null)}
        catalogo={catalogo}
        grupos={grupos}
        onSaved={aposSalvar}
      />
    </div>
  )
}
