import { useState } from 'react'
import { LinkIcon } from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'
import Modal from '../../elements/user/Modal'
import { Button } from '../../elements/user/Button'
import { FileUpload } from '../../elements/user/FileUpload'
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

export const ViewToggle = ({ value, onChange }) => (
  <div className="flex gap-1 bg-sunken rounded-lg p-0.5 w-fit text-xs">
    {['pending', 'history'].map(v => (
      <button key={v} onClick={() => onChange(v)}
        className={`px-3 py-1.5 rounded-md font-medium transition-colors
          ${value === v
            ? 'bg-surface text-ink shadow-sm'
            : 'text-muted hover:text-ink'
          }`}>
        {v === 'pending' ? 'Pendientes' : 'Historial'}
      </button>
    ))}
  </div>
)

export const ItemList = ({ children }) => (
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
          : <img src={url} alt="Comprobante" className="w-full max-h-[70vh] object-contain bg-slate-950" />
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

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <h1 className="font-wide text-xl font-bold tracking-tight text-ink">{title}</h1>
      {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
)
