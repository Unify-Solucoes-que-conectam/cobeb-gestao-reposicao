import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import dayjs from "@/lib/dayjs"
import { cn } from "@/lib/utils"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"
import { useEffect, useState } from "react"

interface DatePickerProps {
  className?: string
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  date?: Date
  onSelect?: (date: Date | undefined) => void
}

const validDate = (date?: Date): Date | undefined =>
  date && !Number.isNaN(date.getTime()) ? date : undefined

export function DatePicker({ className, placeholder, minDate, maxDate, date, onSelect }: DatePickerProps) {

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => validDate(date));
  const minimumDate = validDate(minDate);
  const maximumDate = validDate(maxDate);

  useEffect(() => {
    setSelectedDate(validDate(date));
  }, [date]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!selectedDate}
          className={cn("data-[empty=true]:text-muted-foreground w-53 justify-between text-left font-normal", className)}
        >
          <div className="flex gap-3 items-center">
            <CalendarIcon />
            {selectedDate ? dayjs(selectedDate).format("DD/MM/YYYY") : <span className="max-w-32 text-ellipsis overflow-hidden">{placeholder || "Pick a date"}</span>}
          </div>
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date);
            setOpen(false);
            if (onSelect) onSelect(date);
          }}
          defaultMonth={validDate(date)}
          locale={ptBR}
          disabled={(date) => ((minimumDate && date < minimumDate) || (maximumDate && date > maximumDate)) ?? false}
          required
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}
