import Loader from "@/components/custom/loader";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";

interface SelectFilterAddonProps {
  filters: { label: string; value: string }[];
  defaultFilter: string;
  onFilterChange: (newFilters: { label: string; value: string }[]) => void;
  loading?: boolean;
  disabled?: boolean;
}
export default function SelectFilterAddon({
  filters,
  defaultFilter,
  onFilterChange,
  loading,
  disabled
}: SelectFilterAddonProps) {
  return (
    <div className="flex items-center gap-2">
      <Select disabled={disabled} defaultValue={defaultFilter} onValueChange={(value) => onFilterChange([{ ...filters.find(f => f.value === value)!, value }])}>
        <SelectTrigger className="w-45">
          
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {
              filters.map((filter, index) => (
                <SelectItem key={index} value={filter.value}>
                  {loading && <Loader />}
                  {filter.label}
                </SelectItem>
              ))
            }
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}