import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { PrinterIcon } from '@heroicons/react/24/outline'
import { LedgerRow, Stamp } from '../../shared/Receipt'
import api from '../../../api/axios'

const STATUS = {
  completed: { label: 'Verificado', tone: 'entrada' },
  pending:   { label: 'En trámite', tone: 'espera' },
  cancelled: { label: 'Anulado',    tone: 'salida' },
}

const fmt = (amount, currency) =>
  new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency, maximumFractionDigits: 2, currencyDisplay: 'code',
  }).format(amount)

const Centered = ({ children }) => (
  <div className="flex min-h-screen items-center justify-center bg-canvas px-4 text-ink">
    <div className="flex flex-col items-center gap-3 text-center">{children}</div>
  </div>
)

/**
 * El comprobante público. Es la única pantalla que alguien ajeno a Casher
 * llega a ver, así que es literalmente el recibo: papel, sello y código.
 */
export const TransactionPublicPage = () => {
  const { hash } = useParams()
  const [tx, setTx] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get(`/api/v1/public/tx/${hash}`)
      .then(r => setTx(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [hash])

  if (loading)
    return (
      <Centered>
        <div className="h-1 w-24 overflow-hidden rounded-full bg-sunken">
          <div className="h-full w-1/3 animate-bar rounded-full bg-sello" />
        </div>
        <p className="eyebrow">Buscando comprobante</p>
      </Centered>
    )

  if (error || !tx)
    return (
      <Centered>
        <p className="eyebrow">Comprobante {hash?.slice(0, 12)}</p>
        <h1 className="font-wide text-xl font-bold">No existe este comprobante</h1>
        <p className="max-w-xs text-sm leading-relaxed text-muted">
          Revisa el enlace: puede estar incompleto o la transacción pudo ser anulada.
        </p>
      </Centered>
    )

  const status = STATUS[tx.status] ?? STATUS.pending
  const shortRef = tx.hash?.slice(0, 8).toUpperCase()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-canvas px-4 py-10 text-ink">
      <article className="print-sheet w-full max-w-sm animate-feed-in bg-surface tear-y pb-6 pt-6 shadow-xl">
        <header className="flex items-center justify-between px-6">
          <img src="/img/logo.svg" alt="Casher" className="max-h-4 dark:hidden" />
          <img src="/img/logo_dark.svg" alt="Casher" className="hidden max-h-4 dark:block" />
          <span className="figure text-[0.625rem] text-faint">REF {shortRef}</span>
        </header>

        <p className="eyebrow px-6 pt-5">Comprobante de transferencia</p>

        <div className="flex items-end justify-between gap-4 px-6 pt-1">
          <p className="figure text-[1.875rem] font-semibold leading-tight tracking-tight">
            {fmt(tx.amount, tx.currency)}
          </p>
          <Stamp tone={status.tone} className="mb-1.5">{status.label}</Stamp>
        </div>

        <div className="perf mx-6 my-4" />

        <div className="px-6">
          <LedgerRow label="Emisor" value={tx.sender} />
          <LedgerRow label="Destinatario" value={tx.receiver} />
          <LedgerRow
            label="Fecha"
            value={new Date(tx.createdAt).toLocaleDateString('es-CO', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            })}
          />
          <LedgerRow
            label="Hora"
            value={new Date(tx.createdAt).toLocaleTimeString('es-CO', {
              hour: '2-digit', minute: '2-digit',
            })}
          />
        </div>

        <div className="perf mx-6 my-4" />

        <div className="flex flex-col items-center gap-3 px-6">
          <div className="rounded border border-line bg-white p-2.5">
            <QRCodeSVG
              value={`${window.location.origin}/tx/${tx.hash}`}
              size={124}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#17181B"
            />
          </div>
          <p className="figure break-all text-center text-[0.625rem] leading-relaxed text-faint">
            {tx.hash}
          </p>
          <p className="text-center text-[0.6875rem] leading-relaxed text-muted">
            Escanea el código para volver a verificar esta operación en cualquier momento.
          </p>
        </div>
      </article>

      <button
        onClick={() => window.print()}
        className="no-print flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted
          transition-colors hover:bg-sunken hover:text-ink"
      >
        <PrinterIcon className="size-4" />
        Imprimir comprobante
      </button>
    </div>
  )
}
