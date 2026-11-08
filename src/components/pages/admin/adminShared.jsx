import { LoadingImage } from '../../elements/user/LoadingImage'
import { useEffect, useState } from 'react'
import { LinkIcon, ClockIcon, ScaleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'
import Modal from '../../elements/user/Modal'
import { Button } from '../../elements/user/Button'
import { FileUpload } from '../../elements/user/FileUpload'
import { Input } from '../../elements/user/Input'
import { useDispatch } from 'react-redux'
import { setLoad } from '../../../store/slices/loader.slice'
import api from '../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../utils/appError'

export const fmt = (amount, currency) =>
  new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency: currency || 'COP', currencyDisplay: 'code', maximumFractionDigits: 2,
  }).format(amount)

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  cls: 'border-rule border-dashed text-espera' },
  accepted:  { label: 'Aceptado',   cls: 'border-entrada/35 bg-entrada-soft text-entrada' },
  paid:      { label: 'Pagado',     cls: 'border-entrada/35 bg-entrada-soft text-entrada' },
  rejected:  { label: 'Rechazado',  cls: 'border-salida/35 bg-salida-soft text-salida' },
  cancelled: { label: 'Cancelado',  cls: 'border-line bg-sunken text-faint' },
}

export const StatusBadge = ({ status }) => {
  const { label, cls } = STATUS_CONFIG[status] ?? { label: status, cls: 'border-line bg-sunken text-faint' }
  return (
    <span className={`eyebrow !text-[0.625rem] px-2 py-1 rounded border whitespace-nowrap ${cls}`}>
      {label}
    </span>
  )
}

export const UserAvatar = ({ username }) => (
  <div className="size-10 rounded-lg bg-ink flex items-center justify-center shrink-0">
    <span className="figure text-[0.7rem] font-semibold uppercase text-reverse">{username?.slice(0, 2) ?? '??'}</span>
  </div>
)

export const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-3 text-faint">
    <div className="size-16 flex items-center justify-center">{icon}</div>
    <p className="text-sm text-faint">{text}</p>
  </div>
)

const VIEWS = {
  pending: { label: 'Pendientes', hint: 'Por revisar', Icon: ClockIcon },
  debts:   { label: 'Deudas',     hint: 'Por cobrar',  Icon: ScaleIcon },
  history: { label: 'Historial',  hint: 'Resueltos',   Icon: ArchiveBoxIcon },
}

// Barra de pestañas a todo el ancho: icono, rótulo, nota y contador por vista.
// `counts` es opcional: { pending: 3, history: 40 }
export const ViewToggle = ({ value, onChange, views = ['pending', 'history'], counts = {} }) => (
  <div role="tablist"
    className="grid w-full bg-surface rounded-2xl border border-line overflow-hidden shadow-sm"
    style={{ gridTemplateColumns: `repeat(${views.length}, minmax(0, 1fr))` }}>
    {views.map((v, i) => {
      const { label, hint, Icon } = VIEWS[v]
      const active = value === v
      const count = counts[v]
      return (
        <button key={v} role="tab" aria-selected={active} onClick={() => onChange(v)}
          className={`group relative flex items-center justify-center sm:justify-start gap-3 px-3 sm:px-5 py-3.5 text-left transition-colors
            ${i > 0 ? 'border-l border-line' : ''}
            ${active ? 'bg-sunken text-ink' : 'text-muted hover:bg-sunken hover:text-ink'}`}>
          <span className={`hidden sm:flex size-9 shrink-0 items-center justify-center rounded-lg border bg-surface transition-colors
            ${active ? 'border-ink' : 'border-line'}`}>
            <Icon className="size-5" />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-sm font-semibold leading-tight">{label}</span>
            <span className="eyebrow !text-[0.625rem] hidden sm:block">{hint}</span>
          </span>
          {count != null && (
            <span className="figure ml-auto text-xs font-semibold px-2 py-0.5 rounded-md border border-line bg-surface text-ink">
              {count}
            </span>
          )}
          {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-ink" />}
        </button>
      )
    })}
  </div>
)

export const Pagination = ({ page, total, pageSize, onChange }) => {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const btn = 'px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="figure text-faint">{from}–{to} de {total}</span>
      <div className="flex items-center gap-1 bg-sunken rounded-lg p-0.5">
        <button className={`${btn} text-muted hover:text-ink`} disabled={page === 1} onClick={() => onChange(page - 1)}>Anterior</button>
        <span className="figure px-2 text-ink">{page} / {pages}</span>
        <button className={`${btn} text-muted hover:text-ink`} disabled={page === pages} onClick={() => onChange(page + 1)}>Siguiente</button>
      </div>
    </div>
  )
}

export const ItemList =({ children }) => (
  <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-sm">
    {children}
  </div>
)

export const ItemRow = ({ children, last }) => (
  <div className={`flex items-center gap-4 px-5 py-4 ${!last ? 'border-b border-line' : ''}`}>
    {children}
  </div>
)

export const VoucherModal = ({ open, setOpen, url }) => {
  const isPdf = url?.toLowerCase().includes('.pdf') || url?.toLowerCase().includes('/raw/')
  return (
    <Modal open={open} setOpen={setOpen} title="Comprobante" className="p-0">
      <div className="w-full overflow-hidden rounded-b-2xl">
        {isPdf
          ? <iframe src={url} className="w-full h-[70vh]" title="Comprobante PDF" />
          : <LoadingImage src={url} alt="Comprobante" spinner className="w-full bg-slate-950" imgClassName="w-full max-h-[70vh] object-contain" />
        }
      </div>
    </Modal>
  )
}

export const AcceptWithdrawalModal = ({ open, setOpen, withdrawal, onSuccess }) => {
  const [file, setFile] = useState(null)
  const [submitError, setSubmitError] = useState(false)
  const dispatch = useDispatch()

  const handleClose = (v) => { setOpen(v); if (!v) { setFile(null); setSubmitError(false) } }

  const submit = async (e) => {
    e.preventDefault()
    if (!file) { setSubmitError(true); return }
    setSubmitError(false)
    dispatch(setLoad(false))
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.patch(`/api/v1/withdrawals/${withdrawal?.id}/accept`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setFile(null)
      handleClose(false)
      onSuccess()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Retiro aceptado', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }

  return (
    <Modal open={open} setOpen={handleClose} title="Confirmar retiro" className="grid gap-6">
      {withdrawal && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-sunken border border-line">
          <UserAvatar username={withdrawal.account?.username} />
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink truncate">{withdrawal.account?.username}</p>
            <p className="text-xs text-faint truncate">{withdrawal.account?.email}</p>
            <p className="text-xs text-faint truncate">{withdrawal.bankAccount?.bank_name} · {withdrawal.bankAccount?.account_number}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-ink">{fmt(withdrawal.amount, withdrawal.currency)}</p>
          </div>
        </div>
      )}
      <form onSubmit={submit} className="grid gap-4">
        <FileUpload label="Comprobante de pago" accept="image/*,application/pdf" onUpload={setFile} deferred
          error={submitError && !file ? { message: 'Requerido' } : null} />
        <Button type="submit" color="green">Confirmar retiro</Button>
      </form>
    </Modal>
  )
}

// Saldo estimado con una tasa dada (misma fórmula que el backend)
const outstandingAt = (loan, rate) => {
  const days = loan.accepted_at ? Math.max(0, Math.floor((Date.now() - new Date(loan.accepted_at).getTime()) / 86400000)) : 0
  return Math.max(0, loan.amount * Math.pow(1 + rate / 100, days) - (loan.paid_amount ?? 0))
}

export const EditRateModal = ({ open, setOpen, loan, onSuccess }) => {
  const [rate, setRate] = useState('')
  const dispatch = useDispatch()

  useEffect(() => { if (loan) setRate(String(loan.interest_rate)) }, [loan])

  const value = Number(rate)
  const valid = rate !== '' && Number.isFinite(value) && value >= 0 && value <= 100
  const unchanged = loan && valid && value === Number(loan.interest_rate)
  const projected = loan && valid ? outstandingAt(loan, value) : null
  const diff = projected != null ? projected - Number(loan.outstanding) : 0

  const submit = async (e) => {
    e.preventDefault()
    if (!valid || unchanged) return
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/loans/${loan.id}/interest-rate`, { interest_rate: value })
      setOpen(false)
      onSuccess()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Tasa actualizada', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }

  return (
    <Modal open={open} setOpen={setOpen} title="Modificar tasa de interés" className="grid gap-6">
      {loan && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-sunken border border-line">
          <UserAvatar username={loan.account?.username} />
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink truncate">{loan.account?.username}</p>
            <p className="text-xs text-faint truncate">{loan.account?.email}</p>
            <p className="text-xs text-faint">Préstamo de {fmt(loan.amount, loan.currency)} · {loan.interest_rate}% diario</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="eyebrow !text-[0.625rem]">Saldo actual</p>
            <p className="figure text-lg font-bold text-ink">{fmt(loan.outstanding, loan.currency)}</p>
          </div>
        </div>
      )}
      <form onSubmit={submit} className="grid gap-4">
        <Input id="interest_rate" name="interest_rate" type="number" min="0" max="100" step="0.01"
          label="Nueva tasa (% diario)" placeholder="0.70" value={rate} onChange={(e) => setRate(e.target.value)}
          register={{ function: null, errors: { function: valid || rate === '' ? null : { interest_rate: { message: 'Ingresa un valor entre 0 y 100' } }, rules: {} } }} />

        {projected != null && !unchanged && (
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-line bg-sunken text-sm">
            <span className="text-muted">Nuevo saldo estimado</span>
            <span className="text-right">
              <span className="figure font-bold text-ink block">{fmt(projected, loan.currency)}</span>
              <span className={`figure text-xs ${diff < 0 ? 'text-entrada' : 'text-salida'}`}>
                {diff < 0 ? '−' : '+'}{fmt(Math.abs(diff), loan.currency)}
              </span>
            </span>
          </div>
        )}
        <p className="text-xs text-faint">
          El cambio es retroactivo: el saldo se recalcula con la nueva tasa desde la fecha de aceptación.
        </p>
        <Button type="submit" disabled={!valid || unchanged}>Guardar tasa</Button>
      </form>
    </Modal>
  )
}

export const PageHeader =({ title, subtitle, action }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <h1 className="font-wide text-xl font-bold tracking-tight text-ink">{title}</h1>
      {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
)
