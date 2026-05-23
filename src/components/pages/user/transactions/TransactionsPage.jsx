import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  ArrowUpRightIcon, ArrowDownLeftIcon, ArrowDownTrayIcon, BanknotesIcon,
  ArrowUturnUpIcon, PlusIcon, LinkIcon, ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'
import { ChargeModal } from '../home/partials/BalanceCard'
import { Button } from '../../../elements/user/Button'
import Modal from '../../../elements/user/Modal'
import { LoanRequestModal, WithdrawalRequestModal } from '../requests/Requests'
import { SendOrRequestModal } from '../home/partials/BalanceCard'
import ManageTxModal from './partials/ManageTxModal'
import { accountThunk } from '../../../../store/slices/account.slice'
import { activityThunk } from '../../../../store/slices/activity.slice'
import { setLoad } from '../../../../store/slices/loader.slice'
import api from '../../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../../utils/appError'

const KIND_CONFIG = {
  transfer_sent:     { label: 'Transferencia enviada',   icon: <ArrowUpRightIcon className="size-4" />,   iconBg: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',                   amountPrefix: '-', amountColor: 'text-red-500' },
  transfer_received: { label: 'Transferencia recibida',  icon: <ArrowDownLeftIcon className="size-4" />,  iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',    amountPrefix: '+', amountColor: 'text-emerald-500' },
  withdrawal:        { label: 'Retiro',                  icon: <ArrowDownTrayIcon className="size-4" />,  iconBg: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',                   amountPrefix: '-', amountColor: 'text-red-500' },
  loan:              { label: 'Préstamo',                icon: <BanknotesIcon className="size-4" />,      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',    amountPrefix: '+', amountColor: 'text-emerald-500' },
  payment:           { label: 'Abono a deuda',           icon: <ArrowUturnUpIcon className="size-4" />,  iconBg: 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400',                amountPrefix: '-', amountColor: 'text-blue-500' },
  deposit:           { label: 'Recarga de fondos',       icon: <ArrowUpTrayIcon className="size-4" />,   iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',    amountPrefix: '+', amountColor: 'text-emerald-500' },
}

export const STATUS_STYLE = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-slate-400',
  accepted:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  paid:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export const STATUS_LABEL = {
  completed: 'Completado', pending: 'Pendiente', cancelled: 'Cancelado',
  accepted: 'Aceptado', rejected: 'Rechazado', paid: 'Pagado',
}

const fmt = (amount, currency) =>
  new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency, maximumFractionDigits: 2, currencyDisplay: 'code',
  }).format(amount)

const txSubtitle = (item) => {
  if (item.kind === 'transfer_sent' || item.kind === 'transfer_received')
    return item.meta.counterparty ?? item.meta.hash
  if (item.kind === 'withdrawal') {
    const parts = [item.meta.bankName, item.meta.accountNumber].filter(Boolean)
    return parts.length ? parts.join(' · ') : 'Cuenta bancaria'
  }
  if (item.kind === 'deposit') {
    const parts = [item.meta.bankName, item.meta.accountNumber].filter(Boolean)
    return parts.length ? parts.join(' · ') : 'Cuenta de la app'
  }
  return null
}

const groupByDate = (items) => {
  const map = new Map()
  items.forEach(item => {
    const d = new Date(item.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!map.has(key)) map.set(key, { date: d, items: [] })
    map.get(key).items.push(item)
  })
  return [...map.values()]
}

const dateLabel = (date) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 86400000
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  if (d === today) return 'Hoy'
  if (d === yesterday) return 'Ayer'
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

const Skeleton = () => (
  <div className="flex flex-col gap-3 py-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-3.5 px-4 py-3 animate-pulse bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800">
        <div className="size-10 rounded-full bg-slate-200 dark:bg-neutral-700 shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3.5 bg-slate-200 dark:bg-neutral-700 rounded w-2/5" />
          <div className="h-2.5 bg-slate-100 dark:bg-neutral-800 rounded w-1/4" />
        </div>
        <div className="h-3.5 bg-slate-200 dark:bg-neutral-700 rounded w-20" />
      </div>
    ))}
  </div>
)

const Empty = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
    <div className="size-14 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
      <BanknotesIcon className="size-7" />
    </div>
    <p className="text-sm">{text}</p>
  </div>
)

const DateGroupList = ({ items, renderRow }) => {
  const groups = groupByDate(items)
  return (
    <div className="flex flex-col gap-3">
      {groups.map(({ date, items: groupItems }) => (
        <div key={date.toISOString()}>
          <p className="sticky top-0 z-10 text-xs font-semibold text-slate-400 dark:text-slate-500
            px-1 py-2 uppercase tracking-wider bg-slate-50 dark:bg-neutral-950">
            {dateLabel(date)}
          </p>
          <ul className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800
            divide-y divide-slate-100 dark:divide-neutral-800 overflow-hidden">
            {groupItems.map(renderRow)}
          </ul>
        </div>
      ))}
    </div>
  )
}

const ActivityRow = ({ item, onClick, onVoucher }) => {
  const cfg = KIND_CONFIG[item.kind]
  const sub = txSubtitle(item)
  const isTransfer = item.kind === 'transfer_sent' || item.kind === 'transfer_received'
  const hasVoucher = (item.kind === 'deposit' || item.kind === 'withdrawal') && item.meta?.screenshot
  const time = new Date(item.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  return (
    <li
      onClick={isTransfer && onClick ? () => onClick(item) : undefined}
      className={`flex items-center gap-3.5 px-4 py-3.5 transition-colors
        ${isTransfer && onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-800/60' : ''}`}
    >
      <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{cfg.label}</p>
        {sub && <p className="text-xs text-slate-400 truncate mt-0.5">{sub}</p>}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`text-sm font-bold ${cfg.amountColor}`}>
          {cfg.amountPrefix}{fmt(item.amount, item.currency)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{time}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[item.status]}`}>
            {STATUS_LABEL[item.status]}
          </span>
          {hasVoucher && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onVoucher?.(item.meta.screenshot) }}
              className="text-xs text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-0.5">
              <LinkIcon className="size-3" /> Comprobante
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

const ActivityList = ({ items, loading, emptyText, onRowClick, onVoucher }) => {
  if (loading) return <Skeleton />
  if (items.length === 0) return <Empty text={emptyText} />
  return (
    <DateGroupList items={items} renderRow={(item) => (
      <ActivityRow key={item.id} item={item} onClick={onRowClick} onVoucher={onVoucher} />
    )} />
  )
}

const LoansTab = () => {
  const [loans, setLoans] = useState([])
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  const fetchLoans = async () => {
    setLoading(true)
    try { const r = await api.get('/api/v1/loans'); setLoans(r.data) }
    catch (err) { appError(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLoans() }, [])

  const onSuccess = () => { fetchLoans(); dispatch(accountThunk()); dispatch(activityThunk()) }

  const cancel = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cancelar solicitud?', text: 'Esta acción no se puede deshacer.',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sí, cancelar', cancelButtonText: 'Volver', confirmButtonColor: '#ef4444',
    })
    if (!isConfirmed) return
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/loans/${id}/cancel`)
      onSuccess()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Solicitud cancelada', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }

  const cfg = KIND_CONFIG.loan

  return (
    <div className="flex flex-col gap-4">
      <LoanRequestModal open={modal} setOpen={setModal} onSuccess={onSuccess} />
      <div className="flex justify-end">
        <Button size="md" color="green" onClick={() => setModal(true)} className="flex items-center gap-1.5">
          <PlusIcon className="size-4" /> Solicitar préstamo
        </Button>
      </div>
      {loading ? <Skeleton /> : loans.length === 0 ? <Empty text="No tienes préstamos aún." /> : (
        <DateGroupList items={loans} renderRow={(loan) => (
          <li key={loan.id} className="flex items-center gap-3.5 px-4 py-3.5">
            <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{cfg.label}</p>
              {loan.status === 'accepted' && loan.outstanding != null
                ? <p className="text-xs text-slate-400 truncate mt-0.5">Pendiente: {fmt(loan.outstanding, loan.currency)}</p>
                : <p className="text-xs text-slate-400 truncate mt-0.5">Tasa: {loan.interest_rate}% diario</p>
              }
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-sm font-bold ${cfg.amountColor}`}>
                {cfg.amountPrefix}{fmt(loan.amount, loan.currency)}
              </span>
              <div className="flex items-center gap-2">
                {loan.status === 'pending' && (
                  <button onClick={() => cancel(loan.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors">
                    Cancelar
                  </button>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[loan.status]}`}>
                  {STATUS_LABEL[loan.status]}
                </span>
              </div>
            </div>
          </li>
        )} />
      )}
    </div>
  )
}

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

const WithdrawalsTab = () => {
  const [withdrawals, setWithdrawals] = useState([])
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [voucherUrl, setVoucherUrl] = useState(null)
  const dispatch = useDispatch()

  const fetchWithdrawals = async () => {
    setLoading(true)
    try { const r = await api.get('/api/v1/withdrawals'); setWithdrawals(r.data) }
    catch (err) { appError(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchWithdrawals() }, [])

  const onSuccess = () => { fetchWithdrawals(); dispatch(accountThunk()); dispatch(activityThunk()) }

  const cancel = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cancelar solicitud?', text: 'El saldo congelado será devuelto a tu cuenta disponible.',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sí, cancelar', cancelButtonText: 'Volver', confirmButtonColor: '#ef4444',
    })
    if (!isConfirmed) return
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/withdrawals/${id}/cancel`)
      onSuccess()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Solicitud cancelada', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }

  const cfg = KIND_CONFIG.withdrawal

  return (
    <div className="flex flex-col gap-4">
      <VoucherModal open={!!voucherUrl} setOpen={() => setVoucherUrl(null)} url={voucherUrl} />
      <WithdrawalRequestModal open={modal} setOpen={setModal} onSuccess={onSuccess} />
      <div className="flex justify-end">
        <Button size="md" color="green" onClick={() => setModal(true)} className="flex items-center gap-1.5">
          <PlusIcon className="size-4" /> Solicitar retiro
        </Button>
      </div>
      {loading ? <Skeleton /> : withdrawals.length === 0 ? <Empty text="No tienes retiros aún." /> : (
        <DateGroupList items={withdrawals} renderRow={(w) => (
          <li key={w.id} className="flex items-center gap-3.5 px-4 py-3.5">
            <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{cfg.label}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {w.bankAccount?.bank_name ?? 'Cuenta bancaria'}
                {w.bankAccount?.account_number ? ` · ${w.bankAccount.account_number}` : ''}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-sm font-bold ${cfg.amountColor}`}>
                {cfg.amountPrefix}{fmt(w.amount, w.currency)}
              </span>
              <div className="flex items-center gap-2">
                {w.status === 'pending' && (
                  <button onClick={() => cancel(w.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors">
                    Cancelar
                  </button>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[w.status]}`}>
                  {STATUS_LABEL[w.status]}
                </span>
                {w.screenshot && (
                  <button type="button" onClick={() => setVoucherUrl(w.screenshot)}
                    className="text-xs text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-0.5">
                    <LinkIcon className="size-3" /> Comprobante
                  </button>
                )}
              </div>
            </div>
          </li>
        )} />
      )}
    </div>
  )
}

const DepositsTab = () => {
  const [deposits, setDeposits] = useState([])
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [voucherUrl, setVoucherUrl] = useState(null)
  const dispatch = useDispatch()

  const fetchDeposits = async () => {
    setLoading(true)
    try { const r = await api.get('/api/v1/deposit-requests'); setDeposits(r.data) }
    catch (err) { appError(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDeposits() }, [])

  const onSuccess = () => { fetchDeposits(); dispatch(accountThunk()); dispatch(activityThunk()) }

  const cancel = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cancelar solicitud?', text: 'Esta acción no se puede deshacer.',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sí, cancelar', cancelButtonText: 'Volver', confirmButtonColor: '#ef4444',
    })
    if (!isConfirmed) return
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/deposit-requests/${id}/cancel`)
      onSuccess()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Solicitud cancelada', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }

  const cfg = KIND_CONFIG.deposit

  return (
    <div className="flex flex-col gap-4">
      <VoucherModal open={!!voucherUrl} setOpen={() => setVoucherUrl(null)} url={voucherUrl} />
      <ChargeModal open={modal} setOpen={(v) => { setModal(v); if (!v) onSuccess() }} />
      <div className="flex justify-end">
        <Button size="md" color="green" onClick={() => setModal(true)} className="flex items-center gap-1.5">
          <PlusIcon className="size-4" /> Nueva recarga
        </Button>
      </div>
      {loading ? <Skeleton /> : deposits.length === 0 ? <Empty text="No tienes recargas aún." /> : (
        <DateGroupList items={deposits} renderRow={(d) => (
          <li key={d.id} className="flex items-center gap-3.5 px-4 py-3.5">
            <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{cfg.label}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {d.appBankAccount?.bank_name ?? 'Cuenta de la app'}
                {d.appBankAccount?.account_number ? ` · ${d.appBankAccount.account_number}` : ''}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-sm font-bold ${cfg.amountColor}`}>
                {cfg.amountPrefix}{fmt(d.amount, d.currency)}
              </span>
              <div className="flex items-center gap-2">
                {d.status === 'pending' && (
                  <button onClick={() => cancel(d.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors">
                    Cancelar
                  </button>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[d.status]}`}>
                  {STATUS_LABEL[d.status]}
                </span>
                {d.screenshot && (
                  <button type="button" onClick={() => setVoucherUrl(d.screenshot)}
                    className="text-xs text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-0.5">
                    <LinkIcon className="size-3" /> Comprobante
                  </button>
                )}
              </div>
            </div>
          </li>
        )} />
      )}
    </div>
  )
}

const TABS = [
  { key: 'all',         label: 'Todas' },
  { key: 'transfers',   label: 'Transferencias' },
  { key: 'loans',       label: 'Préstamos' },
  { key: 'withdrawals', label: 'Retiros' },
  { key: 'deposits',    label: 'Recargas' },
]

export const TransactionsPage = () => {
  const [tab, setTab] = useState('all')
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [txModal, setTxModal] = useState(false)
  const [txType, setTxType] = useState(true)
  const [selectedTx, setSelectedTx] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [voucherUrl, setVoucherUrl] = useState(null)

  const openDetail = async (item) => {
    try {
      const res = await api.get(`/api/v1/transfers/${item.meta.hash}`)
      setSelectedTx(res.data)
      setDetailOpen(true)
    } catch (err) { appError(err) }
  }

  useEffect(() => {
    const controller = new AbortController()
    api.get('/api/v1/activity?all=true', { signal: controller.signal })
      .then(r => setActivity(r.data))
      .catch(err => { if (err.name !== 'CanceledError') appError(err) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const transfers = useMemo(
    () => activity.filter(i => i.kind === 'transfer_sent' || i.kind === 'transfer_received'),
    [activity]
  )

  return (
    <div className="flex flex-col gap-6">
      <VoucherModal open={!!voucherUrl} setOpen={() => setVoucherUrl(null)} url={voucherUrl} />
      <ManageTxModal open={detailOpen} setOpen={setDetailOpen} tx={selectedTx} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transacciones</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Historial completo de tu actividad financiera</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 shrink-0 bg-slate-100 dark:bg-neutral-900 p-1 rounded-2xl gap-1">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-2 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
              ${tab === key
                ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
            {label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'all' && (
          <ActivityList items={activity} loading={loading} emptyText="Sin actividad aún"
            onRowClick={openDetail} onVoucher={setVoucherUrl} />
        )}
        {tab === 'transfers' && (
          <div className="flex flex-col gap-4">
            <SendOrRequestModal open={txModal} setOpen={setTxModal} txType={txType} />
            <div className="flex justify-end gap-2">
              <Button size="md" color="green" variant="outline"
                onClick={() => { setTxType(false); setTxModal(true) }}
                className="flex items-center gap-1.5">
                <ArrowDownLeftIcon className="size-4" /> Solicitar
              </Button>
              <Button size="md" color="green"
                onClick={() => { setTxType(true); setTxModal(true) }}
                className="flex items-center gap-1.5">
                <ArrowUpRightIcon className="size-4" /> Enviar
              </Button>
            </div>
            <ActivityList items={transfers} loading={loading} emptyText="Sin transferencias aún" onRowClick={openDetail} />
          </div>
        )}
        {tab === 'loans' && <LoansTab />}
        {tab === 'withdrawals' && <WithdrawalsTab />}
        {tab === 'deposits' && <DepositsTab />}
      </div>
    </div>
  )
}
