import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CheckIcon, ChevronsUpDownIcon, LoaderCircleIcon, XIcon } from 'lucide-react'

export type OptionBadge = {
  text: string
  variant: 'success' | 'warning' | 'error' | 'muted'
}

export type Option = {
  value: string
  label: string
  badge?: OptionBadge
}

export interface SelectProps {
  options?: Option[]
  placeholder?: string
  emptyMessage?: string
  loadingMessage?: string
  value?: string[]
  onChange?: (value: string[]) => void
  maxItems?: number
  disabled?: boolean
  searchFn?: (query: string) => Promise<Option[]>
  preload?: boolean
  searchDebounce?: number
  multiple?: boolean
  initialQuery?: string
  clearable?: boolean
}

export const Select = (props: SelectProps) => {
  const {
    options = [],
    multiple = false,
    placeholder = multiple ? 'Selecione os itens...' : 'Selecione um item...',
    emptyMessage = 'Nenhum item encontrado.',
    loadingMessage = 'Carregando...',
    value = [],
    onChange,
    maxItems,
    disabled = false,
    searchFn,
    preload = false,
    searchDebounce = 300,
    initialQuery = '',
    clearable = false,
  } = props

  const [open, setOpen] = useState(false)
  const [selectedValues, setSelectedValues] = useState<string[]>(value)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<Option[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [cachedSelectedOptions, setCachedSelectedOptions] = useState<Option[]>([])

  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const initialSearchDone = useRef(false)
  const lastSearchQuery = useRef<string>('')

  useEffect(() => {
    if (preload) {
      performSearch(initialQuery)
    }
  }, [])

  // Stable search function with useCallback
  const performSearch = useCallback(
    async (query: string) => {
      if (!searchFn) return

      // Avoid duplicate searches
      if (lastSearchQuery.current === query && !preload) return
      lastSearchQuery.current = query

      setIsSearching(true)
      try {
        const results = await searchFn(query)
        setSearchResults(results)
      } catch (error) {
        console.error('Erro ao buscar:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [searchFn]
  )

  // Update selected values when value prop changes
  useEffect(() => {
    setSelectedValues(value)
  }, [value])

  // Update cached options when we have new options or selected values
  useEffect(() => {
    if (selectedValues.length > 0) {
      const allOptions = [...options, ...searchResults]
      const filledOptions = selectedValues
        .map((val) => allOptions.find((opt) => opt.value === val))
        .filter((opt): opt is Option => opt !== undefined)

      setCachedSelectedOptions((prev) => {
        // Only update if we have new options to add
        const prevValues = prev.map((p) => p.value).sort()
        const newValues = filledOptions.map((f) => f.value).sort()

        // If we have more options now, update
        if (
          filledOptions.length > prev.length ||
          JSON.stringify(prevValues) !== JSON.stringify(newValues)
        ) {
          return filledOptions
        }
        return prev
      })
    } else {
      setCachedSelectedOptions([])
    }
  }, [selectedValues, options, searchResults])

  // Handle initial search - run only once
  useEffect(() => {
    if (!initialSearchDone.current && initialQuery && searchFn) {
      initialSearchDone.current = true
      performSearch(initialQuery)
    }
  }, [initialQuery, searchFn, performSearch])

  // Handle search with debouncing - ONLY when searchQuery changes
  useEffect(() => {
    if (!searchFn) return

    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    // If no preload and empty query (and not initial search), clear results
    if (!preload && searchQuery.trim() === '' && initialSearchDone.current) {
      setSearchResults([])
      setIsSearching(false)
      lastSearchQuery.current = ''
      return
    }

    // Skip if query is empty and no preload (except for initial search)
    if (!preload && searchQuery.trim() === '' && !initialQuery) {
      return
    }

    // Only search if query actually changed
    if (lastSearchQuery.current !== searchQuery) {
      // Debounced search
      searchTimeout.current = setTimeout(() => {
        performSearch(searchQuery)
      }, searchDebounce)
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [searchQuery, searchFn, preload, initialQuery, searchDebounce, performSearch])

  // Memoize display options
  const displayOptions = useMemo(() => {
    if (searchFn) {
      return !preload && searchQuery.trim() === '' && initialSearchDone.current
        ? options
        : searchResults
    }

    if (searchQuery.trim() !== '') {
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return options
  }, [searchFn, searchQuery, options, searchResults, preload])

  // Memoize selected items
  const selectedItems = useMemo(() => {
    return selectedValues
      .map((value) => cachedSelectedOptions.find((option) => option.value === value))
      .filter((option): option is Option => option !== undefined)
  }, [selectedValues, cachedSelectedOptions])

  const handleSelect = useCallback(
    (value: string) => {
      let newValues: string[] = []

      const selectedOption = [...options, ...searchResults].find((opt) => opt.value === value)

      if (multiple) {
        const isSelected = selectedValues.includes(value)

        if (isSelected) {
          newValues = selectedValues.filter((item) => item !== value)
        } else {
          if (maxItems && selectedValues.length >= maxItems) return
          newValues = [...selectedValues, value]
        }
      } else {
        newValues = [value]
        setOpen(false)
      }

      // Update selected values
      setSelectedValues(newValues)
      onChange?.(newValues)

      // Update cached options immediately for the selected item
      if (selectedOption && !multiple) {
        setCachedSelectedOptions([selectedOption])
      } else if (selectedOption && multiple) {
        setCachedSelectedOptions((prev) => {
          const isSelected = selectedValues.includes(value)
          if (isSelected) {
            // Remove from cache
            return prev.filter((opt) => opt.value !== value)
          } else {
            // Add to cache if not already there
            const alreadyExists = prev.some((opt) => opt.value === value)
            return alreadyExists ? prev : [...prev, selectedOption]
          }
        })
      }
    },
    [selectedValues, onChange, maxItems, multiple, options, searchResults]
  )

  const handleRemove = useCallback(
    (value: string) => {
      const newValues = selectedValues.filter((item) => item !== value)
      setSelectedValues(newValues)
      setCachedSelectedOptions((prev) => prev.filter((opt) => opt.value !== value))
      onChange?.(newValues)
    },
    [selectedValues, onChange]
  )

  const handleClear = useCallback(() => {
    setSelectedValues([])
    setCachedSelectedOptions([])
    onChange?.([])
  }, [onChange])

  const handleToggleAll = useCallback(() => {
    const allValues = displayOptions.map((opt) => opt.value)
    const allSelected = allValues.every((val) => selectedValues.includes(val))

    if (allSelected) {
      setSelectedValues([])
      setCachedSelectedOptions([])
      onChange?.([])
    } else {
      let newValues = allValues

      if (maxItems) {
        newValues = newValues.slice(0, maxItems)
      }

      // Update cached options
      const newCachedOptions = displayOptions.slice(0, maxItems || displayOptions.length)

      setCachedSelectedOptions(newCachedOptions)
      setSelectedValues(newValues)
      onChange?.(newValues)
    }
  }, [displayOptions, selectedValues, onChange, maxItems])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'w-full justify-between text-left truncate',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
        >
          {selectedValues.length > 0 ? (
            <div className='flex flex-wrap gap-1 overflow-hidden'>
              {isSearching
                ? loadingMessage
                : multiple
                  ? `${selectedValues.length} itens selecionados`
                  : selectedItems[0]?.label || placeholder}
            </div>
          ) : (
            <span className='text-muted-foreground truncate'>{placeholder}</span>
          )}
          <div className='flex items-center gap-1 shrink-0'>
            {clearable && selectedValues.length > 0 && (
              <div
                role='button'
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    handleClear()
                  }
                }}
                className='ring-offset-background rounded-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-accent p-0.5 cursor-pointer'
              >
                <XIcon className='h-4 w-4 opacity-50 hover:opacity-100' />
              </div>
            )}
            <ChevronsUpDownIcon className='h-4 w-4 opacity-50' />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full max-w-96 p-0' align='start'>
        <Command shouldFilter={false} onWheel={(e) => e.stopPropagation()}>
          <CommandInput
            placeholder='Buscar...'
            value={searchQuery}
            onValueChange={setSearchQuery}
          />

          {multiple && (
            <>
              {selectedValues.length > 0 && (
                <div className='flex items-center p-2 border-b'>
                  <div className='flex flex-wrap gap-1 max-w-[90%]'>
                    {selectedItems.map((item) => (
                      <Badge key={item?.value} variant='outline' className='mr-1'>
                        {item?.label}
                        <button
                          className='ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                          onClick={() => handleRemove(item.value)}
                        >
                          <XIcon
                            className='h-3 w-3 text-muted-foreground hover:text-foreground'
                          />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-auto h-8 px-2'
                    onClick={handleClear}
                  >
                    Limpar
                  </Button>
                </div>
              )}
              {displayOptions.length > 0 && !isSearching && (
                <div className='pt-1 px-1'>
                  <Button variant='ghost' size='sm' className='w-full' onClick={handleToggleAll}>
                    {displayOptions.every((opt) => selectedValues.includes(opt.value))
                      ? 'Desmarcar tudo'
                      : 'Selecionar tudo'}
                  </Button>
                </div>
              )}
            </>
          )}

          <CommandList>
            {isSearching ? (
              <CommandEmpty>
                <div className='flex flex-col items-center justify-center text-muted-foreground'>
                  <LoaderCircleIcon />
                  <span>{loadingMessage}</span>
                </div>
              </CommandEmpty>
            ) : displayOptions.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {displayOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  const badgeClass = option.badge
                    ? {
                      success:
                        'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
                      warning:
                        'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
                      error: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
                      muted: 'bg-muted text-muted-foreground',
                    }[option.badge.variant]
                    : ''
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      {multiple && (
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <CheckIcon className='h-4 w-4' />
                        </div>
                      )}
                      <span className='flex-1 truncate'>{option.label}</span>
                      {option.badge && (
                        <span
                          className={cn(
                            'ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold',
                            badgeClass
                          )}
                        >
                          {option.badge.text}
                        </span>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
