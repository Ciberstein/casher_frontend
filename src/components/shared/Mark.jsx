/**
 * El logotipo de Casher lleva dos marcas troqueladas: una apunta arriba,
 * otra abajo. Son entrada y salida de dinero. Se reutilizan como el signo
 * de la marca en toda la interfaz.
 */
export const Mark = ({ direction = 'in', className = '' }) => (
  <svg
    viewBox="0 0 16 20"
    aria-hidden="true"
    className={`shrink-0 ${className}`}
    fill="currentColor"
  >
    {direction === 'in'
      ? <path d="M0 20V4.6L8 0l8 4.6V20H0Z" />
      : <path d="M16 0v15.4L8 20l-8-4.6V0h16Z" />}
  </svg>
)

/** Marca completa: la pareja, escalonada como en el logotipo. */
export const MarkPair = ({ className = '' }) => (
  <span className={`inline-flex items-center gap-[3px] ${className}`}>
    <Mark direction="in" className="h-[1em] w-auto" />
    <Mark direction="out" className="h-[1em] w-auto opacity-40" />
  </span>
)
