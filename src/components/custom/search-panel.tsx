import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";

interface Filter {
  label: string;
  value: string;
}

interface SearchPanelProps {
  total?: number;
  placeholder?: string;
  fetchData: () => void;
  search?: string;
  onSearchChange: (search: string) => void;
  defaultFilter: string;
  filters: Filter[];
  onFilterChange: (filters: Filter[]) => void;
}
export default function SearchPanel({ total, placeholder, fetchData, search, onSearchChange, defaultFilter, filters, onFilterChange }: SearchPanelProps) {
  return (
    <div className="flex justify-between items-center gap-3">
      <InputGroup className="h-10">
        <InputGroupInput onKeyDown={(key) => ['Enter', 'NumpadEnter'].includes(key.code) && fetchData()} placeholder={placeholder || "Buscar..."} value={search} onChange={(e) => onSearchChange(e.target.value)} />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">{total || 0} {total === 1 ? "resultado" : "resultados"}</InputGroupAddon>
      </InputGroup>

      <Button onClick={() => fetchData()}>
        <SearchIcon />
        Buscar
      </Button>

      <Select defaultValue={defaultFilter} onValueChange={(value) => onFilterChange([{ ...filters.find(f => f.value === value)!, value }])}>
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {
              filters.map((filter, index) => (
                <SelectItem key={index} value={filter.value}>{filter.label}</SelectItem>
              ))
            }
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}