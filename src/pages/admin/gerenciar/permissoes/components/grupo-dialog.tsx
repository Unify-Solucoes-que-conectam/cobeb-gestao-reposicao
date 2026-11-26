import { Select } from '@/components/custom/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Permissao } from '@/types/app'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Catalogo, Grupo, GrupoPayload, mensagemErro, Perfil, PERFIL_LABEL, permissoesService } from '../service'

interface GrupoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogo: Catalogo
  grupo: Grupo | null // null = novo grupo
  onSaved: () => void
}

const VAZIO: GrupoPayload = { nome: '', descricao: '', perfil: 'monitoramento', menus: [], permissoes: [] }

const alternar = <T,>(lista: T[], item: T, marcado: boolean) =>
  marcado ? Array.from(new Set([...lista, item])) : lista.filter((i) => i !== item)

export default function GrupoDialog({ open, onOpenChange, catalogo, grupo, onSaved }: GrupoDialogProps) {
  const [form, setForm] = useState<GrupoPayload>(VAZIO)
  const [salvando, setSalvando] = useState(false)

  const administrador = form.perfil === 'administrador'

  useEffect(() => {
    if (!open) return
    setForm(grupo
      ? { nome: grupo.nome, descricao: grupo.descricao ?? '', perfil: grupo.perfil, menus: grupo.menus, permissoes: grupo.permissoes }
      : VAZIO)
  }, [open, grupo])

  const acoesPorModulo = useMemo(() => {
    const mapa = new Map<string, typeof catalogo.acoes>()
    catalogo.acoes.forEach((acao) => mapa.set(acao.modulo, [...(mapa.get(acao.modulo) ?? []), acao]))
    return Array.from(mapa.entries())
  }, [catalogo.acoes])

  const marcarMenu = (id: string, marcado: boolean, subIds: string[] = []) => {
    setForm((prev) => {
      let menus = alternar(prev.menus, id, marcado)
      // marcar/desmarcar um agrupador aplica a todos os seus submenus
      subIds.forEach((sub) => { menus = alternar(menus, sub, marcado) })
      return { ...prev, menus }
    })
  }

  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      toast.error('Informe o nome do grupo')
      return
    }

    setSalvando(true)
    try {
      const response = await permissoesService.salvarGrupo(form, grupo?.id)
      if (response.success) {
        toast.success(response.message)
        onOpenChange(false)
        onSaved()
      } else {
        toast.error(mensagemErro(response, 'Erro ao salvar o grupo'))
      }
    } catch {
      toast.error('Erro ao salvar o grupo')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{grupo ? `Editar grupo ${grupo.nome}` : 'Novo grupo'}</DialogTitle>
          <DialogDescription>Defina quais menus e ações os usuários deste grupo podem acessar.</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Field>
              <Label htmlFor='grupo-nome'>Nome</Label>
              <Input id='grupo-nome' value={form.nome} maxLength={100} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </Field>
            <Field>
              <Label>Perfil</Label>
              <Select
                value={[form.perfil]}
                onChange={(v) => v[0] && setForm({ ...form, perfil: v[0] as Perfil })}
                disabled={grupo?.sistema}
                options={catalogo.perfis.map((p) => ({ value: p, label: PERFIL_LABEL[p] }))}
              />
            </Field>
          </div>
          <Field>
            <Label htmlFor='grupo-descricao'>Descrição</Label>
            <Input id='grupo-descricao' value={form.descricao ?? ''} maxLength={255} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </Field>

          {administrador ? (
            <p className='rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'>
              Grupos com perfil Administrador possuem acesso a todos os menus, ações e filiais.
            </p>
          ) : (
            <div className='grid gap-6 sm:grid-cols-2'>
              <section className='space-y-2'>
                <h3 className='text-sm font-semibold'>Menus</h3>
                {catalogo.menus.map((menu) => {
                  const subIds = menu.sub_menus.map((s) => s.id)
                  const agrupador = subIds.length > 0
                  const marcado = agrupador ? subIds.every((id) => form.menus.includes(id)) : form.menus.includes(menu.id)
                  return (
                    <div key={menu.id} className='space-y-1.5'>
                      <label className='flex items-center gap-2 text-sm font-medium'>
                        <Checkbox checked={marcado} onCheckedChange={(c) => marcarMenu(menu.id, c === true, subIds)} />
                        {menu.titulo}
                      </label>
                      {menu.sub_menus.map((sub) => (
                        <label key={sub.id} className='ml-6 flex items-center gap-2 text-sm'>
                          <Checkbox checked={form.menus.includes(sub.id)} onCheckedChange={(c) => marcarMenu(sub.id, c === true)} />
                          {sub.titulo}
                        </label>
                      ))}
                    </div>
                  )
                })}
              </section>

              <section className='space-y-3'>
                <h3 className='text-sm font-semibold'>Ações</h3>
                {acoesPorModulo.map(([modulo, acoes]) => (
                  <div key={modulo} className='space-y-1.5'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{modulo}</p>
                    {acoes.map((acao) => (
                      <label key={acao.chave} className='flex items-start gap-2 text-sm'>
                        <Checkbox
                          className='mt-0.5'
                          checked={form.permissoes.includes(acao.chave)}
                          onCheckedChange={(c) => setForm((prev) => ({ ...prev, permissoes: alternar<Permissao>(prev.permissoes, acao.chave, c === true) }))}
                        />
                        {acao.descricao}
                      </label>
                    ))}
                  </div>
                ))}
              </section>
            </div>
          )}
        </FieldGroup>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={salvando}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={salvando} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar grupo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
