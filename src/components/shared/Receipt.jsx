/**
 * Piezas del comprobante. Casher emite un recibo verificable por cada
 * movimiento, así que el recibo es también la forma de la interfaz:
 * renglón con relleno punteado, filete de corte y sello.
 */

/** Renglón de libreta: etiqueta, puntos, cifra. Las cifras van en mono tabular. */
export const LedgerRow = ({ label, value, tone = 'ink', mono = true, className = '' }) => {
  const tones = {
    ink: 'text-ink',
    muted: 'text-muted',
    entrada: 'text-entrada',
    salida: 'text-salida',
    sello: 'text-sello-ink',
  }

  return (
    <div className={`flex items-baseline gap-2 py-2 ${className}`}>
      <span className="text-[0.8125rem] text-muted shrink-0">{label}</span>
      <span className="leader" aria-hidden="true" />
      <span className={`text-[0.8125rem] font-medium shrink-0 ${mono ? 'figure' : ''} ${tones[tone] ?? tones.ink}`}>
        {value}
      </span>
    </div>
  )
}

/** Hoja con borde troquelado abajo: lo que sale de la impresora. */
export const ReceiptSheet = ({ children, className = '', as: As = 'div', ...props }) => (
  <As
    {...props}
    className={`relative bg-surface border border-line rounded-t-2xl tear-b pb-4 ${className}`}
  >
    {children}
  </As>
)

/** Sello de goma: se estampa una vez, en seco, y no compite con nada más. */
export const Stamp = ({ children, tone = 'entrada', className = '' }) => {
  const tones = {
    entrada: 'text-entrada',
    salida: 'text-salida',
    espera: 'text-espera',
    sello: 'text-sello',
  }

  return (
    <span
      className={`stamp inline-block px-2.5 py-1 text-[0.625rem] -rotate-6 ${tones[tone] ?? tones.entrada} ${className}`}
    >
      {children}
    </span>
  )
}
