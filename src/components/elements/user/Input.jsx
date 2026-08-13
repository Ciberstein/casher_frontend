import React from 'react'
import { Link } from 'react-router-dom'

const SIZES = {
  sm: 'text-sm py-1.5 px-3',
  md: 'text-sm py-2.5 px-3',
  lg: 'text-base py-3 px-3.5',
  xl: 'text-lg py-3.5 px-4',
}

/**
 * Un campo es un espacio en blanco de un formulario: rótulo impreso arriba,
 * caja hundida, filete que se tiñe de sello cuando recibe el foco.
 */
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
  const hasError = register.errors.function && register.errors.function[props.name]

  return (
    <div className={`flex flex-col gap-1.5 ${full ? 'w-full' : ''}`}>
      {(label || helperLink.url || helperLink.text) && (
        <div className="flex justify-between items-baseline gap-3">
          {label && (
            <label htmlFor={props.id ?? null} className="eyebrow">
              {label}
            </label>
          )}
          {(helperLink.url || helperLink.text) && (
            <Link
              to={helperLink.url ?? null}
              className="text-xs font-medium text-sello-ink underline decoration-sello/40 underline-offset-2 hover:decoration-sello"
            >
              {helperLink.text}
            </Link>
          )}
        </div>
      )}

      <label
        htmlFor={props.id ?? null}
        className={`flex gap-2 items-center rounded-lg border bg-sunken transition-colors
          focus-within:border-sello focus-within:bg-surface
          ${props.disabled ? 'opacity-50' : ''}
          ${hasError ? '!border-salida' : 'border-line hover:border-rule'}
          ${SIZES[size] ?? SIZES.md}
          ${className}`}
      >
        {icon && <span className="text-faint shrink-0">{icon}</span>}
        <input
          id={props.id ?? null}
          name={props.name ?? null}
          type={type}
          className="bg-transparent w-full text-ink placeholder:text-faint
            focus-visible:outline-none disabled:text-faint
            [&[type=number]]:figure"
          {...(register.function
            ? register.function(props.name, register.errors.rules)
            : {}
          )}
          {...props}
        />
        {element && element}
      </label>

      {hasError && register.errors.function[props.name]?.message && (
        <span className="text-xs text-salida font-medium">
          {register.errors.function[props.name].message}
        </span>
      )}
    </div>
  )
}
