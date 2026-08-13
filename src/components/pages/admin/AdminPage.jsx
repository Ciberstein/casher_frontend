import { useEffect, useState } from 'react'
import {
  BanknotesIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, LinkIcon, CalendarIcon,
  BuildingLibraryIcon, IdentificationIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { CheckIcon, XMarkIcon, PlusIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/20/solid'
import { useForm, Controller } from 'react-hook-form'
import Modal from '../../elements/user/Modal'
import { Button } from '../../elements/user/Button'
import { Input } from '../../elements/user/Input'
import { ComboSelect } from '../../elements/user/ComboSelect'
import { FileUpload } from '../../elements/user/FileUpload'
import api from '../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../utils/appError'
import { useDispatch, useSelector } from 'react-redux'
import { setLoad } from '../../../store/slices/loader.slice'
import { banksThunk } from '../../../store/slices/banks.slice'
import { documentTypesThunk } from '../../../store/slices/documentTypes.slice'

const fmt = (amount, currency) =>
  new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency: currency || 'COP', currencyDisplay: 'code', maximumFractionDigits: 2,
  }).format(amount)

const fmtDate = (d) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  cls: 'bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400' },
  accepted:  { label: 'Aceptado',   cls: 'bg-sello-soft text-sello-ink dark:bg-emerald-900/30 text-sello-ink' },
  rejected:  { label: 'Rechazado',  cls: 'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400' },
  paid:      { label: 'Pagado',     cls: 'bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-400' },
  cancelled: { label: 'Cancelado',  cls: 'bg-sunken   text-muted   bg-sunken   text-muted' },
}

const StatusBadge = ({ status }) => {
  const { label, cls } = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-sunken text-muted' }
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${cls}`}>{label}</span>
}

const UserAvatar = ({ username }) => (
  <div className="size-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
    <span className="text-xs font-bold text-white">{username?.slice(0, 2).toUpperCase() ?? '??'}</span>
  </div>
)

const StatCard = ({ label, count, icon, gradient }) => (
  <div className={`rounded-2xl p-5 bg-gradient-to-br ${gradient} text-white flex items-center gap-4`}>
    <div className="p-3 bg-white/20 rounded-xl shrink-0">{icon}</div>
    <div>
      <p className="text-3xl font-bold leading-none">{count}</p>
      <p className="text-sm text-white/75 mt-1">{label}</p>
    </div>
  </div>
)

const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-faint">
    <div className="size-14 flex items-center justify-center opacity-40">{icon}</div>
    <p className="text-sm">{text}</p>
  </div>
)

const ViewToggle = ({ value, onChange }) => (
  <div className="flex gap-1 bg-sunken rounded-lg p-0.5 w-fit text-xs">
    {['pending', 'history'].map(v => (
      <button key={v} onClick={() => onChange(v)}
        className={`px-3 py-1.5 rounded-md font-medium transition-colors
          ${value === v
            ? 'bg-white dark:bg-neutral-700 text-ink shadow-sm'
            : 'text-muted hover:text-ink'
          }`}>
        {v === 'pending' ? 'Pendientes' : 'Historial'}
      </button>
    ))}
  </div>
)

const ItemRow = ({ children, last }) => (
  <div className={`flex items-center gap-4 px-5 py-4 ${!last ? 'border-b border-line' : ''}`}>
    {children}
  </div>
)

const ItemList = ({ children }) => (
  <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-sm">
    {children}
  </div>
)

/* ─── Modals ─────────────────────────────────────────────────────── */

const VoucherModal = ({ open, setOpen, url }) => {
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

const AcceptWithdrawalModal = ({ open, setOpen, withdrawal, onSuccess }) => {
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
      await api.patch(`/api/v1/withdrawals/${withdrawal?.id}/accept`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
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
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-canvas bg-sunken border border-line">
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

/* ─── Panels ─────────────────────────────────────────────────────── */

const LoansPanel = () => {
  const [loans, setLoans] = useState([])
  const [view, setView] = useState('pending')
  const dispatch = useDispatch()

  const fetchLoans = async (v = view) => {
    try {
      const r = await api.get(`/api/v1/loans/admin${v === 'history' ? '?history=true' : ''}`)
      setLoans(r.data)
    } catch (err) { appError(err) }
  }

  useEffect(() => { fetchLoans(view) }, [view])

  const action = async (id, type) => {
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/loans/${id}/${type}`)
      fetchLoans()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: `Préstamo ${type === 'accept' ? 'aceptado' : 'rechazado'}`, showConfirmButton: false, timer: 3000 })
    } catch (err) { appError(err) }
    finally { dispatch(setLoad(true)) }
  }

  return (
    <div className="flex flex-col gap-4">
      <ViewToggle value={view} onChange={setView} />
      {loans.length === 0
        ? <EmptyState icon={<BanknotesIcon className="size-14" />} text={view === 'pending' ? 'No hay préstamos pendientes' : 'Sin historial de préstamos'} />
        : (
          <ItemList>
            {loans.map((loan, i) => (
              <ItemRow key={loan.id} last={i === loans.length - 1}>
                <UserAvatar username={loan.account?.username} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-ink">{loan.account?.username}</span>
                    <span className="text-xs text-faint truncate hidden sm:block">{loan.account?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-base font-bold text-ink">{fmt(loan.amount, loan.currency)}</span>
                    <span className="text-xs text-faint">{loan.interest_rate}% diario</span>
                    {loan.outstanding != null && (
                      <span className="text-xs font-medium text-orange-500">Pendiente: {fmt(loan.outstanding, loan.currency)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={loan.status} />
                    <span className="text-xs text-faint">{fmtDate(loan.createdAt)}</span>
                  </div>
                </div>
                {view === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => action(loan.id, 'accept')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sello hover:bg-ink text-reverse text-sm font-semibold transition-colors">
                      <CheckIcon className="size-4" /> Aceptar
                    </button>
                    <button onClick={() => action(loan.id, 'reject')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sunken hover:bg-sunken text-muted text-muted text-sm font-semibold transition-colors">
                      <XMarkIcon className="size-4" /> Rechazar
                    </button>
                  </div>
                )}
              </ItemRow>
            ))}
          </ItemList>
        )
      }
    </div>
  )
}

const WithdrawalsPanel = () => {
  const [withdrawals, setWithdrawals] = useState([])
  const [view, setView] = useState('pending')
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [voucherUrl, setVoucherUrl] = useState(null)
  const dispatch = useDispatch()

  const fetchWithdrawals = async (v = view) => {
    try {
      const r = await api.get(`/api/v1/withdrawals/admin${v === 'history' ? '?history=true' : ''}`)
      setWithdrawals(r.data)
    } catch (err) { appError(err) }
  }

  useEffect(() => { fetchWithdrawals(view) }, [view])

  const reject = async (id) => {
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/withdrawals/${id}/reject`)
      fetchWithdrawals()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Retiro rechazado', showConfirmButton: false, timer: 3000 })
    } catch (err) { appError(err) }
    finally { dispatch(setLoad(true)) }
  }

  return (
    <div className="flex flex-col gap-4">
      <VoucherModal open={!!voucherUrl} setOpen={() => setVoucherUrl(null)} url={voucherUrl} />
      <AcceptWithdrawalModal open={modal} setOpen={setModal} withdrawal={selected} onSuccess={() => fetchWithdrawals()} />
      <ViewToggle value={view} onChange={setView} />
      {withdrawals.length === 0
        ? <EmptyState icon={<ArrowDownTrayIcon className="size-14" />} text={view === 'pending' ? 'No hay retiros pendientes' : 'Sin historial de retiros'} />
        : (
          <ItemList>
            {withdrawals.map((w, i) => (
              <ItemRow key={w.id} last={i === withdrawals.length - 1}>
                <UserAvatar username={w.account?.username} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-ink">{w.account?.username}</span>
                    <span className="text-xs text-faint truncate hidden sm:block">{w.account?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-base font-bold text-ink">{fmt(w.amount, w.currency)}</span>
                    <span className="text-xs text-faint truncate">{w.bankAccount?.bank_name} · {w.bankAccount?.account_number}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <StatusBadge status={w.status} />
                    <span className="text-xs text-faint">{fmtDate(w.createdAt)}</span>
                    {w.screenshot && (
                      <button type="button" onClick={() => setVoucherUrl(w.screenshot)}
                        className="flex items-center gap-1 text-xs text-sello-ink hover:underline">
                        <LinkIcon className="size-3" /> Ver comprobante
                      </button>
                    )}
                  </div>
                </div>
                {view === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setSelected(w); setModal(true) }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sello hover:bg-ink text-reverse text-sm font-semibold transition-colors">
                      <CheckIcon className="size-4" /> Aceptar
                    </button>
                    <button onClick={() => reject(w.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sunken hover:bg-sunken text-muted text-muted text-sm font-semibold transition-colors">
                      <XMarkIcon className="size-4" /> Rechazar
                    </button>
                  </div>
                )}
              </ItemRow>
            ))}
          </ItemList>
        )
      }
    </div>
  )
}

const DepositRequestsPanel = () => {
  const [requests, setRequests] = useState([])
  const [view, setView] = useState('pending')
  const [voucherUrl, setVoucherUrl] = useState(null)
  const dispatch = useDispatch()

  const fetchRequests = async (v = view) => {
    try {
      const r = await api.get(`/api/v1/deposit-requests/admin${v === 'history' ? '?history=true' : ''}`)
      setRequests(r.data)
    } catch (err) { appError(err) }
  }

  useEffect(() => { fetchRequests(view) }, [view])

  const action = async (id, type) => {
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/deposit-requests/${id}/${type}`)
      fetchRequests()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: type === 'accept' ? 'Recarga aprobada' : 'Recarga rechazada', showConfirmButton: false, timer: 3000 })
    } catch (err) { appError(err) }
    finally { dispatch(setLoad(true)) }
  }

  return (
    <div className="flex flex-col gap-4">
      <VoucherModal open={!!voucherUrl} setOpen={() => setVoucherUrl(null)} url={voucherUrl} />
      <ViewToggle value={view} onChange={setView} />
      {requests.length === 0
        ? <EmptyState icon={<ArrowUpTrayIcon className="size-14" />} text={view === 'pending' ? 'No hay recargas pendientes' : 'Sin historial de recargas'} />
        : (
          <ItemList>
            {requests.map((req, i) => (
              <ItemRow key={req.id} last={i === requests.length - 1}>
                <UserAvatar username={req.account?.username} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-ink">{req.account?.username}</span>
                    <span className="text-xs text-faint truncate hidden sm:block">{req.account?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-base font-bold text-ink">{fmt(req.amount, req.currency)}</span>
                    {req.appBankAccount && (
                      <span className="text-xs text-faint truncate">{req.appBankAccount.bank_name} · {req.appBankAccount.account_number}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <StatusBadge status={req.status} />
                    <span className="text-xs text-faint">{fmtDate(req.createdAt)}</span>
                    <button type="button" onClick={() => setVoucherUrl(req.screenshot)}
                      className="flex items-center gap-1 text-xs text-sello-ink hover:underline">
                      <LinkIcon className="size-3" /> Ver comprobante
                    </button>
                  </div>
                </div>
                {view === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => action(req.id, 'accept')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sello hover:bg-ink text-reverse text-sm font-semibold transition-colors">
                      <CheckIcon className="size-4" /> Aprobar
                    </button>
                    <button onClick={() => action(req.id, 'reject')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sunken hover:bg-sunken text-muted text-muted text-sm font-semibold transition-colors">
                      <XMarkIcon className="size-4" /> Rechazar
                    </button>
                  </div>
                )}
              </ItemRow>
            ))}
          </ItemList>
        )
      }
    </div>
  )
}

/* ─── App Bank Accounts ──────────────────────────────────────────── */

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'savings', label: 'Ahorros' },
  { value: 'checking', label: 'Corriente' },
]
const ACCOUNT_TYPE_LABEL = { savings: 'Ahorros', checking: 'Corriente' }
const ACCOUNT_TYPE_COLOR = {
  savings:  'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  checking: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const AppBankAccountForm = ({ onSubmit, defaultValues, submitLabel }) => {
  const { register, handleSubmit, reset, control, trigger, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' })
  const dispatch = useDispatch()
  const banks = useSelector((state) => state.banks)
  const documentTypes = useSelector((state) => state.documentTypes)

  useEffect(() => {
    if (banks.length === 0) dispatch(banksThunk())
    if (documentTypes.length === 0) dispatch(documentTypesThunk())
  }, [])

  useEffect(() => {
    if (defaultValues) { reset(defaultValues); trigger() }
  }, [defaultValues])

  const bankOptions = banks.map(b => ({ value: b.name, label: b.name, icon: b.logo }))
  const docTypeOptions = documentTypes.map(dt => ({ value: String(dt.id), label: dt.abbreviation, subtitle: dt.name }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <Controller name="bank_name" control={control} rules={{ required: 'Requerido' }}
        render={({ field }) => (
          <ComboSelect label="Banco" options={bankOptions} value={field.value}
            onChange={field.onChange} placeholder="Selecciona un banco"
            error={errors.bank_name} icon={<BuildingLibraryIcon className="size-6" />} />
        )} />
      <Input icon={<BuildingLibraryIcon className="size-6" />} id="account_number" name="account_number"
        label="Cuenta" placeholder="Email, número de cuenta..."
        register={{ function: register, errors: { function: errors, rules: { required: 'Requerido' } } }} />
      <Input icon={<BuildingLibraryIcon className="size-6" />} id="owner_name" name="owner_name"
        label="Titular" placeholder="Nombre completo"
        register={{ function: register, errors: { function: errors, rules: { required: 'Requerido' } } }} />
      <Controller name="account_type" control={control} rules={{ required: 'Requerido' }}
        render={({ field }) => (
          <ComboSelect label="Tipo de cuenta" options={ACCOUNT_TYPE_OPTIONS} value={field.value}
            onChange={field.onChange} placeholder="Selecciona el tipo"
            error={errors.account_type} searchable={false} />
        )} />
      <div className="grid grid-cols-2 gap-3">
        <Controller name="documentTypeId" control={control} rules={{ required: 'Requerido' }}
          render={({ field }) => (
            <ComboSelect label="Tipo de documento" options={docTypeOptions} value={field.value}
              onChange={field.onChange} placeholder="Tipo"
              error={errors.documentTypeId} searchable={false}
              icon={<IdentificationIcon className="size-6" />} />
          )} />
        <Input icon={<IdentificationIcon className="size-6" />} id="document_number" name="document_number"
          label="Número de documento" placeholder="00000000"
          register={{ function: register, errors: { function: errors, rules: { required: 'Requerido' } } }} />
      </div>
      <Button type="submit" disabled={!isValid || isSubmitting}>{submitLabel}</Button>
    </form>
  )
}

const AddAppBankAccountModal = ({ open, setOpen, onSuccess }) => {
  const dispatch = useDispatch()
  const submit = async (data) => {
    dispatch(setLoad(false))
    try {
      await api.post('/api/v1/app-bank-accounts', { ...data, documentTypeId: Number(data.documentTypeId) })
      setOpen(false)
      onSuccess()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Cuenta agregada', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }
  return (
    <Modal open={open} setOpen={setOpen} title="Agregar cuenta de la app" className="grid gap-6">
      {open && <AppBankAccountForm onSubmit={submit} submitLabel="Agregar" />}
    </Modal>
  )
}

const EditAppBankAccountModal = ({ open, setOpen, account, onSuccess }) => {
  const dispatch = useDispatch()
  const defaultValues = account ? {
    bank_name: account.bank_name,
    account_number: account.account_number,
    owner_name: account.owner_name,
    account_type: account.account_type,
    documentTypeId: account.documentTypeId ? String(account.documentTypeId) : '',
    document_number: account.document_number,
  } : null

  const submit = async (data) => {
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/app-bank-accounts/${account.id}`, { ...data, documentTypeId: Number(data.documentTypeId) })
      setOpen(false)
      onSuccess()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Cuenta actualizada', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }
  return (
    <Modal open={open} setOpen={setOpen} title="Editar cuenta de la app" className="grid gap-6">
      {open && account && <AppBankAccountForm onSubmit={submit} defaultValues={defaultValues} submitLabel="Guardar cambios" />}
    </Modal>
  )
}

const AppBankAccountsPanel = () => {
  const [accounts, setAccounts] = useState([])
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const dispatch = useDispatch()

  const fetchAccounts = async () => {
    try {
      const r = await api.get('/api/v1/app-bank-accounts')
      setAccounts(r.data)
    } catch (err) { appError(err) }
  }

  useEffect(() => { fetchAccounts() }, [])

  const remove = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar cuenta?', text: 'Esta acción no se puede deshacer', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#ef4444',
    })
    if (!isConfirmed) return
    dispatch(setLoad(false))
    try {
      await api.delete(`/api/v1/app-bank-accounts/${id}`)
      fetchAccounts()
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }

  return (
    <div className="flex flex-col gap-4">
      <AddAppBankAccountModal open={addModal} setOpen={setAddModal} onSuccess={fetchAccounts} />
      <EditAppBankAccountModal open={editModal} setOpen={setEditModal} account={editing} onSuccess={fetchAccounts} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button onClick={() => setAddModal(true)}
          className="flex flex-col gap-2 justify-center items-center min-h-40 rounded-2xl border-2 border-dashed
            border-line text-faint
            hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-sello dark:hover:text-emerald-400
            transition-colors group">
          <div className="size-10 rounded-full bg-sunken group-hover:bg-sello-soft dark:group-hover:bg-emerald-900/20 flex items-center justify-center transition-colors">
            <PlusIcon className="size-5" />
          </div>
          <span className="text-sm font-medium">Nueva cuenta</span>
        </button>

        {accounts.map(acc => (
          <div key={acc.id} className="bg-surface border border-line rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-9 rounded-xl bg-sello-soft flex items-center justify-center shrink-0">
                  <BuildingLibraryIcon className="size-5 text-sello-ink" />
                </div>
                <span className="font-bold text-ink truncate">{acc.bank_name}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditing(acc); setEditModal(true) }}
                  className="size-8 rounded-xl bg-sunken flex items-center justify-center
                    text-muted hover:bg-sunken hover:text-ink transition-colors">
                  <PencilSquareIcon className="size-4" />
                </button>
                <button onClick={() => remove(acc.id)}
                  className="size-8 rounded-xl bg-sunken flex items-center justify-center
                    text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-mono text-muted text-muted truncate">{acc.account_number}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${ACCOUNT_TYPE_COLOR[acc.account_type]}`}>
                  {ACCOUNT_TYPE_LABEL[acc.account_type]}
                </span>
              </div>
              <span className="text-sm text-muted">{acc.owner_name}</span>
              {acc.documentType && (
                <span className="text-xs text-faint">{acc.documentType.abbreviation} {acc.document_number}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <EmptyState icon={<BuildingLibraryIcon className="size-14" />} text="No hay cuentas registradas" />
      )}
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────────── */

const TABS = [
  { key: 'loans',        label: 'Préstamos',   Icon: BanknotesIcon,      countKey: 'loans' },
  { key: 'withdrawals',  label: 'Retiros',      Icon: ArrowDownTrayIcon,  countKey: 'withdrawals' },
  { key: 'deposits',     label: 'Recargas',     Icon: ArrowUpTrayIcon,    countKey: 'deposits' },
  { key: 'app-accounts', label: 'Cuentas App',  Icon: BuildingLibraryIcon, countKey: null },
]

const STATS = [
  { countKey: 'loans',       label: 'Préstamos pendientes', Icon: BanknotesIcon,     gradient: 'from-orange-400 to-orange-600' },
  { countKey: 'withdrawals', label: 'Retiros pendientes',   Icon: ArrowDownTrayIcon, gradient: 'from-red-400 to-red-600' },
  { countKey: 'deposits',    label: 'Recargas pendientes',  Icon: ArrowUpTrayIcon,   gradient: 'from-emerald-400 to-emerald-600' },
]

export const AdminPage = () => {
  const [tab, setTab] = useState('loans')
  const [counts, setCounts] = useState({ loans: 0, withdrawals: 0, deposits: 0 })

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/loans/admin'),
      api.get('/api/v1/withdrawals/admin'),
      api.get('/api/v1/deposit-requests/admin'),
    ]).then(([l, w, d]) => setCounts({ loans: l.data.length, withdrawals: w.data.length, deposits: d.data.length }))
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-7">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-sello-soft shrink-0">
          <ShieldCheckIcon className="size-7 text-sello-ink" />
        </div>
        <div>
          <h1 className="font-wide text-2xl font-bold tracking-tight text-ink">Panel de administración</h1>
          <p className="text-sm text-muted mt-0.5">Gestiona las solicitudes y cuentas de la plataforma</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map(({ countKey, label, Icon, gradient }) => (
          <StatCard key={countKey} label={label} count={counts[countKey]} gradient={gradient}
            icon={<Icon className="size-6" />} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-sunken rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(({ key, label, Icon, countKey }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
              ${tab === key
                ? 'bg-white dark:bg-neutral-700 text-ink shadow-sm'
                : 'text-muted hover:text-ink'
              }`}>
            <Icon className="size-4" />
            {label}
            {countKey && counts[countKey] > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
                {counts[countKey]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel */}
      {tab === 'loans'        && <LoansPanel />}
      {tab === 'withdrawals'  && <WithdrawalsPanel />}
      {tab === 'deposits'     && <DepositRequestsPanel />}
      {tab === 'app-accounts' && <AppBankAccountsPanel />}
    </div>
  )
}
