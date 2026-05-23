import React from 'react'
import { Link } from 'react-router-dom'

export const Input = ({
  label = null,
  type = 'text',
  className = '',
  size = 'md',
  icon = null,
  element = null,
  full = false,
  helperLink = { url: null, text: null },
  register = {
    function: null,
    errors: { function: null, rules: {} },
  },
  ...props
}) => {
  const sizes = {
    sm: 'text-sm py-1.5 px-3',
    md: 'text-sm py-2.5 px-3',
    lg: 'text-base py-3 px-4',
    xl: 'text-lg py-3.5 px-4',
  }

  const hasError = register.errors.function && register.errors.function[props.name]

  return (
    <div className={`flex flex-col gap-1.5 ${full ? 'w-full' : ''}`}>
      {(label || helperLink.url || helperLink.text) && (
        <div className="flex justify-between items-center gap-2">
          {label && (
            <label htmlFor={props.id ?? null} className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {label}
            </label>
          )}
          {(helperLink.url || helperLink.text) && (
            <Link to={helperLink.url ?? null} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
              {helperLink.text}
            </Link>
          )}
        </div>
      )}

      <label
        htmlFor={props.id ?? null}
        className={`flex gap-2 items-center rounded-xl border transition-colors
          ${props.disabled
            ? 'bg-slate-100 dark:bg-neutral-800/40 border-slate-200 dark:border-neutral-700 opacity-60'
            : 'bg-slate-100 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700'
          }
          ${hasError ? '!border-red-400 dark:!border-red-500' : ''}
          ${sizes[size] ?? sizes.md}
          ${className}`}
      >
        {icon && <span className="text-slate-400 dark:text-slate-500 shrink-0">{icon}</span>}
        <input
          id={props.id ?? null}
          name={props.name ?? null}
          type={type}
          className="bg-transparent w-full placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:outline-none text-slate-900 dark:text-white disabled:text-slate-400"
          {...(register.function
            ? register.function(props.name, register.errors.rules)
            : {}
          )}
          {...props}
        />
        {element && element}
      </label>

      {hasError && register.errors.function[props.name]?.message && (
        <span className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          {register.errors.function[props.name].message}
        </span>
      )}
    </div>
  )
}
