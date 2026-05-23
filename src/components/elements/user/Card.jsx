import React from 'react'

export const Card = ({ as: As = 'div', children, className = '', ...props }) => {
  return (
    <As
      {...props}
      className={`rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-sm ${className}`}
    >
      {children}
    </As>
  )
}
