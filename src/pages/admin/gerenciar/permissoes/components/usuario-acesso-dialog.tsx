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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Catalogo, Grupo, mensagemErro, PERFIL_LABEL, permissoesService, UsuarioAcesso, UsuarioAcessoPayload } from '../service'

interface UsuarioAcessoDialogProps {
  usuario: UsuarioAcesso | null
  onOpenChange: (open: boolean) => void
  catalogo: Catalogo
  grupos: Grupo[]
  onSaved: () => void
}

export default function UsuarioAcessoDialog({ usuario, onOpenChange, catalogo, grupos, onSaved }: UsuarioAcessoDialogProps) {
  const [form, setForm] = useState<UsuarioAcessoPayload>({ grupo_id: '', acesso_geral: false, filiais: [] })
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!usuario) return
    setForm({
      grupo_id: usuario.grupo?.id ?? '',
      acesso_geral: usuario.acesso_geral,
      filiais: usuario.filiais.map((f) => f.id),
    })
  }, [usuario])

  const grupoSelecionado = grupos.find((g) => g.id === form.grupo_id)
  const administrador = grupoSelecionado?.perfil === 'administrador'

  const handleSubmit = async () => {
    if (!usuario) return
    if (!form.grupo_id) {
      toast.error('Selecione o grupo do usuário')
      return
    }

    setSalvando(true)
    try {
      const response = await permissoesService.salvarUsuario(usuario.id, form)
      if (response.success) {
        toast.success(response.message)
        onOpenChange(false)
        onSaved()
      } else {
        toast.error(mensagemErro(response, 'Erro ao salvar os acessos'))
      }
    } catch {
      toast.error('Erro ao salvar os acessos')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={!!usuario} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Acessos de {usuario?.nome}</DialogTitle>
          <DialogDescription>Defina o grupo de permissão e as filiais que o usuário pode acessar.</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <Label>Grupo</Label>
            <Select
              value={form.grupo_id ? [form.grupo_id] : []}
              onChange={(v) => v[0] && setForm({ ...form, grupo_id: v[0] })}
              options={grupos.map((g) => ({ value: g.id, label: `${g.nome} · ${PERFIL_LABEL[g.perfil]}` }))}
            />
          </Field>

          {administrador ? (
            <p className='text-sm text-muted-foreground'>Administradores acessam todas as filiais, inclusive o Geral.</p>
          ) : (
            <>
              <label className='flex items-start justify-between gap-4 rounded-md border p-3'>
                <span className='space-y-0.5'>
                  <span className='block text-sm font-medium'>Geral (todas as filiais)</span>
                  <span className='block text-xs text-muted-foreground'>
                    Pode alternar para qualquer filial. No Geral, cada registro importado informa a sua filial.
                  </span>
                </span>
                <Switch checked={form.acesso_geral} onCheckedChange={(c) => setForm({ ...form, acesso_geral: c })} />
              </label>

              {!form.acesso_geral && (
                <Field>
                  <Label>Filiais liberadas</Label>
                  <div className='space-y-2 rounded-md border p-3'>
                    {catalogo.filiais.map((filial) => (
                      <label key={filial.id} className='flex items-center gap-2 text-sm'>
                        <Checkbox
                          checked={form.filiais.includes(filial.id)}
                          onCheckedChange={(c) => setForm((prev) => ({
                            ...prev,
                            filiais: c === true ? [...prev.filiais, filial.id] : prev.filiais.filter((id) => id !== filial.id),
                          }))}
                        />
                        <span className='flex-1'>{filial.descricao}</span>
                        <span className='text-xs text-muted-foreground'>{filial.codigo}</span>
                      </label>
                    ))}
                  </div>
                  {form.filiais.length === 0 && (
                    <p className='text-xs text-amber-600'>Sem filiais liberadas o usuário não conseguirá importar dados.</p>
                  )}
                </Field>
              )}
            </>
          )}
        </FieldGroup>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={salvando}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={salvando} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar acessos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
