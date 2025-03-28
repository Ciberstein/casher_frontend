import React from 'react'

export const Card = ({ as: As = "div", children, className, ...props }) => {
  return (
    <As {...props} className={`rounded-2xl dark:bg-zinc-900 bg-slate-50 p-6 shadow-lg ${className}`}>
      {children}
    </As>
  )
}
