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
  const [query, setQuery] = useState('');

  const filtered = useMemo(() =>
    !searchable || query === ''
      ? options
      : options.filter(opt => opt.label.toLowerCase().includes(query.toLowerCase())),
    [query, options, searchable]
  );

  const selected = options.find(opt => opt.value === value) ?? null;

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm text-gray-500">{label}</label>}
      <Combobox value={selected} onChange={(opt) => onChange(opt?.value ?? '')} onClose={() => setQuery('')}>
        <div className="relative">
          {searchable ? (
            <div className={`flex gap-2 items-center border rounded-xl bg-gray-200 dark:bg-zinc-800 p-2
              ${error ? 'border-red-400 text-red-400' : 'border-transparent'}`}>
              {icon && <span className="text-gray-500 dark:text-gray-400 shrink-0">{icon}</span>}
              {selected?.icon && !icon && <span className="text-lg shrink-0">{selected.icon}</span>}
              <ComboboxInput
                className="bg-transparent w-full placeholder:text-gray-500 focus-visible:outline-none text-black dark:text-white text-md"
                displayValue={(opt) => opt?.label ?? ''}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
              />
              <ComboboxButton className="shrink-0">
                <ChevronUpDownIcon className="size-5 text-gray-400" />
              </ComboboxButton>
            </div>
          ) : (
            <ComboboxButton className={`flex gap-2 items-center border rounded-xl bg-gray-200 dark:bg-zinc-800 p-2 w-full text-left
              ${error ? 'border-red-400' : 'border-transparent'}`}>
              {icon && <span className="text-gray-500 dark:text-gray-400 shrink-0">{icon}</span>}
              {selected?.icon && !icon && <span className="text-lg shrink-0">{selected.icon}</span>}
              <span className={`flex-1 text-md ${selected ? 'text-black dark:text-white' : 'text-gray-500'}`}>
                {selected?.label ?? placeholder}
              </span>
              <ChevronUpDownIcon className="size-5 text-gray-400 shrink-0" />
            </ComboboxButton>
          )}

          <ComboboxOptions className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-xl bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 p-1 empty:hidden">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
            )}
            {filtered.map(opt => (
              <ComboboxOption
                key={opt.value}
                value={opt}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer select-none data-[focus]:bg-gray-100 dark:data-[focus]:bg-zinc-700 transition-colors"
              >
                {opt.icon && <span className="text-lg w-6 text-center shrink-0">{opt.icon}</span>}
                <span className="flex-1 flex flex-col min-w-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                  {opt.subtitle && <span className="text-xs text-gray-400 truncate">{opt.subtitle}</span>}
                </span>
                {value === opt.value && <CheckIcon className="size-4 text-blue-500 shrink-0" />}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
      {error?.message && <span className="text-xs text-red-400">{error.message}</span>}
    </div>
  );
};
