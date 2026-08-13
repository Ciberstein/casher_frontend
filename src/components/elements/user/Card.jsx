import React from 'react'

/** Una hoja: fondo de superficie, filete de línea, sin difuminados. */
export const Card = ({ as: As = 'div', children, className = '', ...props }) => {
  return (
    <As
      {...props}
      className={`rounded-2xl bg-surface border border-line ${className}`}
    >
      {children}
    </As>
  )
}
