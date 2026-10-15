import { SearchIcon } from 'lucide-react'

import { DatePicker } from '@/components/custom/date-picker'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface Filter {
  label: string
  value: string
}

export interface DateRange {
  initial?: Date
  final?: Date
}

interface SearchPanelProps {
  total?: number
  placeholder?: string
  fetchData: () => void
  search?: string
  onSearchChange: (search: string) => void
  defaultFilter?: string
  filters?: Filter[]
  onFilterChange?: (filters: Filter[]) => void
  addons?: React.ReactElement
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange) => void
  initialDatePlaceholder?: string
  finalDatePlaceholder?: string
  className?: string
}
export default function SearchPanel({
  placeholder,
  fetchData,
  search,
  onSearchChange,
  defaultFilter,
  filters,
  onFilterChange,
  addons,
  dateRange,
  onDateRangeChange,
  initialDatePlaceholder = 'Data inicial',
  finalDatePlaceholder = 'Data final',
  className,
}: SearchPanelProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <InputGroup className='h-10 min-w-64 flex-1'>
        <InputGroupInput
          onKeyDown={(key) => ['Enter', 'NumpadEnter'].includes(key.code) && fetchData()}
          placeholder={placeholder || 'Buscar...'}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <Button size='icon' aria-label='Pesquisar' onClick={() => fetchData()}>
        <SearchIcon className='h-4 w-4' />
      </Button>

      {filters && onFilterChange && (
        <Select
          defaultValue={defaultFilter}
          onValueChange={(value) =>
            onFilterChange([{ ...filters.find((f) => f.value === value)!, value }])
          }
        >
          <SelectTrigger className='w-45'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {filters.map((filter, index) => (
                <SelectItem key={index} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {dateRange && onDateRangeChange && (
        <>
          <DatePicker
            className='h-10 w-full sm:w-48'
            placeholder={initialDatePlaceholder}
            date={dateRange.initial}
            maxDate={dateRange.final}
            onSelect={(initial) => onDateRangeChange({ ...dateRange, initial })}
          />
          <DatePicker
            className='h-10 w-full sm:w-48'
            placeholder={finalDatePlaceholder}
            date={dateRange.final}
            minDate={dateRange.initial}
            onSelect={(final) => onDateRangeChange({ ...dateRange, final })}
          />
        </>
      )}

      {addons}
    </div>
  )
}
