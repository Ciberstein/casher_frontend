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
  pending:   { label: 'Pendiente',  cls: 'bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400' },
  accepted:  { label: 'Aceptado',   cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected:  { label: 'Rechazado',  cls: 'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400' },
  paid:      { label: 'Pagado',     cls: 'bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-400' },
  cancelled: { label: 'Cancelado',  cls: 'bg-slate-100   text-slate-500   dark:bg-neutral-800   dark:text-slate-400' },
}

export const StatusBadge = ({ status }) => {
  const { label, cls } = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500' }
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${cls}`}>{label}</span>
}

export const UserAvatar = ({ username }) => (
  <div className="size-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 dark:from-neutral-600 dark:to-neutral-400 flex items-center justify-center shrink-0">
    <span className="text-xs font-bold text-white">{username?.slice(0, 2).toUpperCase() ?? '??'}</span>
  </div>
)

export const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-300 dark:text-neutral-700">
    <div className="size-16 flex items-center justify-center">{icon}</div>
    <p className="text-sm text-slate-400 dark:text-slate-600">{text}</p>
  </div>
)

export const ViewToggle = ({ value, onChange }) => (
  <div className="flex gap-1 bg-slate-100 dark:bg-neutral-800 rounded-lg p-0.5 w-fit text-xs">
    {['pending', 'history'].map(v => (
      <button key={v} onClick={() => onChange(v)}
        className={`px-3 py-1.5 rounded-md font-medium transition-colors
          ${value === v
            ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}>
        {v === 'pending' ? 'Pendientes' : 'Historial'}
      </button>
    ))}
  </div>
)

export const ItemList = ({ children }) => (
  <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800 overflow-hidden shadow-sm">
    {children}
  </div>
)

export const ItemRow = ({ children, last }) => (
  <div className={`flex items-center gap-4 px-5 py-4 ${!last ? 'border-b border-slate-50 dark:border-neutral-800' : ''}`}>
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
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700">
          <UserAvatar username={withdrawal.account?.username} />
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{withdrawal.account?.username}</p>
            <p className="text-xs text-slate-400 truncate">{withdrawal.account?.email}</p>
            <p className="text-xs text-slate-400 truncate">{withdrawal.bankAccount?.bank_name} · {withdrawal.bankAccount?.account_number}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{fmt(withdrawal.amount, withdrawal.currency)}</p>
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
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
)
