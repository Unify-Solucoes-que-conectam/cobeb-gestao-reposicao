import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/custom/date-picker";
import { Button } from "@/components/ui/button";
import dayjs from "@/lib/dayjs";

interface ExportarTrocasProps {
  exportOpen: boolean;
  setExportOpen: (open: boolean) => void;
  exportDates: { inicial: string; final: string };
  setExportDates: (dates: { inicial: string; final: string }) => void;
  exporting: boolean;
  exportTrades: () => Promise<void>;
}

const toDate = (value: string): Date | undefined => {
  if (!value) return undefined;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.toDate() : undefined;
};

const toApiDate = (value: Date | undefined): string =>
  value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : '';

export default function ExportarTrocas(props: ExportarTrocasProps) {
  return (
    <Dialog open={props.exportOpen} onOpenChange={props.setExportOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar trocas</DialogTitle>
          <DialogDescription>Selecione o período da data da operação. O arquivo terá uma linha por cliente.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label>Data inicial</Label>
            <DatePicker
              className="h-10 w-full"
              placeholder="Selecione a data inicial"
              date={toDate(props.exportDates.inicial)}
              maxDate={toDate(props.exportDates.final)}
              onSelect={date => props.setExportDates({ inicial: toApiDate(date), final: props.exportDates.final })}
            />
          </div>
          <div className="grid gap-1">
            <Label>Data final</Label>
            <DatePicker
              className="h-10 w-full"
              placeholder="Selecione a data final"
              date={toDate(props.exportDates.final)}
              minDate={toDate(props.exportDates.inicial)}
              onSelect={date => props.setExportDates({ inicial: props.exportDates.inicial, final: toApiDate(date) })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.setExportOpen(false)}>Cancelar</Button>
          <Button disabled={!props.exportDates.inicial || !props.exportDates.final || props.exporting} loading={props.exporting} onClick={props.exportTrades}>Exportar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
