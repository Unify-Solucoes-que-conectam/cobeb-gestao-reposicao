import VisualizarDocumento from '@/components/custom/visualizar-documento'
import { Card, CardContent } from '@/components/ui/card'
import { Anexo, Avaria } from '@/types/consults'
import { CameraIcon } from 'lucide-react'
import VisualizarEvidencias from './visualizar-evidencias'

interface CardEvidenciasProps {
  anexos: Anexo[]
  avaria: Avaria
}
export default function CardEvidencias({ anexos, avaria }: CardEvidenciasProps) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          <span className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-950"><CameraIcon className="size-4" /></span>
          Evidências ({anexos.length})
        </div>
        {anexos.length > 0 && <span className="text-[10px] text-muted-foreground">Clique para ampliar</span>}
      </div>

      <Card className="w-fit max-w-full shadow-none">
        <CardContent className="p-2">
          {anexos.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {anexos.slice(0, 3).map((anexo, index) => (
                <div key={anexo.id} className="relative aspect-square w-24 overflow-hidden rounded-md border bg-muted sm:w-28 [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                  <VisualizarDocumento
                    isImage={['.png', '.jpg', '.jpeg', '.gif', '.webp'].some((extension) => anexo.path.toLowerCase().includes(extension))}
                    fileUrl={anexo.path}
                    fileId={anexo.id}
                  />
                  {anexos.length > 3 && index === 2 && <VisualizarEvidencias avaria={avaria} evidencias={anexos} />}
                </div>
              ))}
            </div>
          ) : (
            <p className="p-4 text-center text-xs text-muted-foreground">Nenhuma evidência disponível.</p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
