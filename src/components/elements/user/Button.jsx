import React from 'react'

const SIZES = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-xl',
  lg: 'text-sm px-5 py-3 rounded-xl',
  xl: 'text-base px-6 py-3.5 rounded-2xl',
}

const VARIANTS = {
  normal: {
    blue:   'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    green:  'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm',
    red:    'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    gray:   'bg-slate-200 dark:bg-neutral-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600',
    yellow: 'bg-yellow-400 text-slate-900 hover:bg-yellow-500 shadow-sm',
  },
  outline: {
    blue:   'border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    green:  'border border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    red:    'border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
    gray:   'border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800',
    yellow: 'border border-yellow-400 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
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
  const variantStyles = VARIANTS[variant]?.[color] ?? VARIANTS.normal.blue

  return (
    <As
      className={`inline-flex items-center justify-center font-medium transition-all duration-150
        disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1
        ${SIZES[size] ?? SIZES.md}
        ${variantStyles}
        ${className}`}
      {...props}
    >
      {children}
    </As>
  )
}
