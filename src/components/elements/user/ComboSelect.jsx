import { useState, useMemo } from 'react'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid'

export const ComboSelect = ({
  label = null,
  options = [],
  value,
  onChange,
  placeholder = 'Selecciona...',
  error = null,
  icon = null,
  searchable = true,
}) => {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() =>
    !searchable || query === ''
      ? options
      : options.filter(opt => opt.label.toLowerCase().includes(query.toLowerCase())),
    [query, options, searchable]
  )

  const selected = options.find(opt => opt.value === value) ?? null

  const fieldCls = `flex gap-2 items-center rounded-lg border bg-sunken py-2.5 px-3 w-full text-left
    transition-colors focus-within:border-sello focus-within:bg-surface
    ${error ? 'border-salida' : 'border-line hover:border-rule'}`

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="eyebrow">{label}</label>}

      <Combobox value={selected} onChange={(opt) => onChange(opt?.value ?? '')} onClose={() => setQuery('')}>
        <div className="relative">
          {searchable ? (
            <div className={fieldCls}>
              {icon && <span className="text-faint shrink-0">{icon}</span>}
              {selected?.icon && !icon && <span className="text-lg shrink-0">{selected.icon}</span>}
              <ComboboxInput
                className="bg-transparent w-full text-sm text-ink placeholder:text-faint focus-visible:outline-none"
                displayValue={(opt) => opt?.label ?? ''}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
              />
              <ComboboxButton className="shrink-0">
                <ChevronUpDownIcon className="size-4 text-faint" />
              </ComboboxButton>
            </div>
          ) : (
            <ComboboxButton className={fieldCls}>
              {icon && <span className="text-faint shrink-0">{icon}</span>}
              {selected?.icon && !icon && <span className="text-lg shrink-0">{selected.icon}</span>}
              <span className={`flex-1 text-sm ${selected ? 'text-ink' : 'text-faint'}`}>
                {selected?.label ?? placeholder}
              </span>
              <ChevronUpDownIcon className="size-4 text-faint shrink-0" />
            </ComboboxButton>
          )}

          <ComboboxOptions
            className="absolute z-50 w-full mt-1 max-h-56 overflow-y-auto rounded-lg bg-surface
              border border-line shadow-xl p-1 empty:hidden"
          >
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-faint">Sin resultados</p>
            )}
            {filtered.map(opt => (
              <ComboboxOption
                key={opt.value}
                value={opt}
                className="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer select-none
                  data-[focus]:bg-sunken transition-colors"
              >
                {opt.icon && <span className="text-lg w-6 text-center shrink-0">{opt.icon}</span>}
                <span className="flex-1 flex flex-col min-w-0">
                  <span className="text-sm text-ink">{opt.label}</span>
                  {opt.subtitle && <span className="text-xs text-faint truncate">{opt.subtitle}</span>}
                </span>
                {value === opt.value && <CheckIcon className="size-4 text-sello shrink-0" />}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>

      {error?.message && <span className="text-xs text-salida font-medium">{error.message}</span>}
    </div>
  )
}
