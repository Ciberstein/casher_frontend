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

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</label>
      )}
      <Combobox value={selected} onChange={(opt) => onChange(opt?.value ?? '')} onClose={() => setQuery('')}>
        <div className="relative">
          {searchable ? (
            <div className={`flex gap-2 items-center rounded-xl border py-2.5 px-3 transition-colors
              bg-slate-100 dark:bg-neutral-800/60
              ${error ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-neutral-700'}`}>
              {icon && <span className="text-slate-400 dark:text-slate-500 shrink-0">{icon}</span>}
              {selected?.icon && !icon && <span className="text-lg shrink-0">{selected.icon}</span>}
              <ComboboxInput
                className="bg-transparent w-full placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:outline-none text-slate-900 dark:text-white text-sm"
                displayValue={(opt) => opt?.label ?? ''}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
              />
              <ComboboxButton className="shrink-0">
                <ChevronUpDownIcon className="size-4 text-slate-400" />
              </ComboboxButton>
            </div>
          ) : (
            <ComboboxButton className={`flex gap-2 items-center rounded-xl border py-2.5 px-3 w-full text-left transition-colors
              bg-slate-100 dark:bg-neutral-800/60
              ${error ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-neutral-700'}`}>
              {icon && <span className="text-slate-400 dark:text-slate-500 shrink-0">{icon}</span>}
              {selected?.icon && !icon && <span className="text-lg shrink-0">{selected.icon}</span>}
              <span className={`flex-1 text-sm ${selected ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                {selected?.label ?? placeholder}
              </span>
              <ChevronUpDownIcon className="size-4 text-slate-400 shrink-0" />
            </ComboboxButton>
          )}

          <ComboboxOptions className="absolute z-50 w-full mt-1.5 max-h-52 overflow-y-auto rounded-xl bg-white dark:bg-neutral-900 shadow-xl border border-slate-200 dark:border-neutral-800 p-1 empty:hidden">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-400">Sin resultados</p>
            )}
            {filtered.map(opt => (
              <ComboboxOption
                key={opt.value}
                value={opt}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer select-none data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-800 transition-colors"
              >
                {opt.icon && <span className="text-lg w-6 text-center shrink-0">{opt.icon}</span>}
                <span className="flex-1 flex flex-col min-w-0">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
                  {opt.subtitle && <span className="text-xs text-slate-400 truncate">{opt.subtitle}</span>}
                </span>
                {value === opt.value && <CheckIcon className="size-4 text-emerald-500 shrink-0" />}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
      {error?.message && <span className="text-xs text-red-500 dark:text-red-400">{error.message}</span>}
    </div>
  )
}
