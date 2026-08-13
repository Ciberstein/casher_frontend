import React from 'react'

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-sm px-5 py-3 gap-2',
  xl: 'text-base px-6 py-3.5 gap-2.5',
}

/**
 * La acción principal se imprime en tinta plena. El sello (naranja) firma,
 * no grita: aparece en el foco, en el contorno y en las acciones secundarias.
 */
const VARIANTS = {
  normal: {
    green:  'bg-ink text-reverse hover:bg-ink/88 active:bg-ink/95 shadow-sm',
    blue:   'bg-sello-soft text-sello-ink border border-sello/35 hover:border-sello/60 hover:bg-sello-soft/70',
    red:    'bg-salida text-white hover:bg-salida/88',
    gray:   'bg-sunken text-ink border border-line hover:border-rule',
    white:  'bg-surface text-ink border border-line hover:border-rule shadow-sm',
    yellow: 'bg-sello text-white hover:bg-sello/88',
  },
  outline: {
    green:  'border border-ink/25 text-ink hover:border-ink/60 hover:bg-ink/[0.04]',
    blue:   'border border-sello/45 text-sello-ink hover:bg-sello-soft',
    red:    'border border-salida/45 text-salida hover:bg-salida-soft',
    gray:   'border border-line text-muted hover:text-ink hover:border-rule',
    white:  'border border-line text-ink hover:border-rule',
    yellow: 'border border-sello/45 text-sello-ink hover:bg-sello-soft',
  },
}

export const Button = ({
  as: As = 'button',
  children = '',
  variant = 'normal',
  color = 'green',
  className = '',
  size = 'md',
  ...props
}) => {
  const variantStyles = VARIANTS[variant]?.[color] ?? VARIANTS.normal.green

  return (
    <As
      className={`inline-flex items-center justify-center rounded-lg font-medium font-semiwide
        transition-[background-color,border-color,color,opacity] duration-150
        disabled:opacity-40 disabled:pointer-events-none
        ${SIZES[size] ?? SIZES.md}
        ${variantStyles}
        ${className}`}
      {...props}
    >
      {children}
    </As>
  )
}
