import { useEffect, useMemo, useState } from 'react'
import { BanknotesIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useDispatch } from 'react-redux'
import { setLoad } from '../../../store/slices/loader.slice'
import api from '../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../utils/appError'
import { fmt, fmtDate, StatusBadge, UserAvatar, EmptyState, ViewToggle, ItemList, ItemRow, PageHeader, Pagination } from './adminShared'

const daysOwed = (acceptedAt) =>
  acceptedAt ? Math.max(0, Math.floor((Date.now() - new Date(acceptedAt).getTime()) / 86400000)) : null

const fmtDays = (acceptedAt) => {
  const d = daysOwed(acceptedAt)
  return d == null ? '—' : `${d} ${d === 1 ? 'día' : 'días'}`
}

const INPUT_CLS = 'h-10 px-3 rounded-lg leading-none bg-surface border border-line text-sm text-ink placeholder:text-faint focus:outline-none focus:border-ink'

const LIST_PAGE_SIZE = 10
const DEBT_PAGE_SIZE = 5

// Agrupa los préstamos aceptados con saldo por usuario y suma el total por moneda
const groupDebtsByUser = (loans) => {
  const users = new Map()
  loans
    .filter(l => l.status === 'accepted' && Number(l.outstanding) > 0)
    .forEach(l => {
      const key = l.account?.id ?? l.accountId
      if (!users.has(key)) users.set(key, { account: l.account, loans: [], totals: {} })
      const u = users.get(key)
      u.loans.push(l)
      u.totals[l.currency] = (u.totals[l.currency] ?? 0) + Number(l.outstanding)
    })
  return [...users.values()]
    .map(u => ({ ...u, loans: u.loans.sort((a, b) => new Date(a.accepted_at ?? a.createdAt) - new Date(b.accepted_at ?? b.createdAt)) }))
    .sort((a, b) => Object.values(b.totals).reduce((s, n) => s + n, 0) - Object.values(a.totals).reduce((s, n) => s + n, 0))
}

const UserDebtCard = ({ debt }) => {
  const [open, setOpen] = useState(true)
  const { account, loans, totals } = debt
  const currencies = Object.entries(totals)

  return (
    <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-sm">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-sunken transition-colors">
        <UserAvatar username={account?.username} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">{account?.username}</p>
          <p className="text-xs text-faint truncate">{account?.email}</p>
          <p className="eyebrow !text-[0.625rem] mt-1">{loans.length} {loans.length === 1 ? 'préstamo activo' : 'préstamos activos'}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="eyebrow !text-[0.625rem]">Deuda total</p>
          {currencies.map(([cur, total]) => (
            <p key={cur} className="figure text-base font-bold text-salida">{fmt(total, cur)}</p>
          ))}
        </div>
        <ChevronDownIcon className={`size-4 text-faint shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-line bg-sunken">
          <div className="hidden sm:grid grid-cols-[1fr_1fr_5rem_6rem_1fr] gap-4 px-5 py-2 eyebrow !text-[0.625rem] border-b border-line">
            <span>Aceptado</span><span>Monto original</span><span>Días</span><span>Interés</span><span className="text-right">Saldo</span>
          </div>
          {loans.map((l, i) => (
            <div key={l.id} className={`grid grid-cols-2 sm:grid-cols-[1fr_1fr_5rem_6rem_1fr] gap-x-4 gap-y-1 px-5 py-3 text-sm ${i < loans.length - 1 ? 'border-b border-line' : ''}`}>
              <span className="text-muted">{fmtDate(l.accepted_at ?? l.createdAt)}</span>
              <span className="figure text-ink text-right sm:text-left">{fmt(l.amount, l.currency)}</span>
              <span className="figure text-ink">{fmtDays(l.accepted_at)}</span>
              <span className="text-xs text-faint self-center text-right sm:text-left">{l.interest_rate}% diario</span>
              <span className="figure font-semibold text-salida text-right">{fmt(l.outstanding, l.currency)}</span>
            </div>
          ))}
          {currencies.length > 0 && loans.length > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-rule bg-surface">
              <span className="eyebrow !text-[0.625rem]">Total adeudado</span>
              <div className="text-right">
                {currencies.map(([cur, total]) => (
                  <p key={cur} className="figure text-sm font-bold text-ink">{fmt(total, cur)}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const AdminLoansPage = () => {
  const [lists, setLists] = useState({ pending: [], history: [] })
  const [view, setView] = useState('pending')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ user: '', from: '', to: '' })
  const dispatch = useDispatch()

  const fetchLoans = async () => {
    try {
      const [pending, history] = await Promise.all([
        api.get('/api/v1/loans/admin'),
        api.get('/api/v1/loans/admin?history=true'),
      ])
      setLists({ pending: pending.data, history: history.data })
    } catch (err) { appError(err) }
  }

  useEffect(() => { fetchLoans() }, [])
  useEffect(() => { setPage(1) }, [view])

  const loans = view === 'pending' ? lists.pending : lists.history
  const counts = useMemo(() => ({
    pending: lists.pending.length,
    debts: groupDebtsByUser(lists.history).length,
    history: lists.history.length,
  }), [lists])

  const action = async (id, type) => {
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/loans/${id}/${type}`)
      fetchLoans()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: `Préstamo ${type === 'accept' ? 'aceptado' : 'rechazado'}`, showConfirmButton: false, timer: 3000 })
    } catch (err) { appError(err) }
    finally { dispatch(setLoad(true)) }
  }

  const filtered = useMemo(() => {
    const q = filters.user.trim().toLowerCase()
    const from = filters.from ? new Date(`${filters.from}T00:00:00`) : null
    const to = filters.to ? new Date(`${filters.to}T23:59:59.999`) : null
    return loans.filter(l => {
      if (q && !`${l.account?.username ?? ''} ${l.account?.email ?? ''}`.toLowerCase().includes(q)) return false
      const date = new Date(view === 'debts' ? (l.accepted_at ?? l.createdAt) : l.createdAt)
      return (!from || date >= from) && (!to || date <= to)
    })
  }, [loans, filters, view])

  const hasFilters = filters.user || filters.from || filters.to
  const setFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(1) }

  const debts = useMemo(() => view === 'debts' ? groupDebtsByUser(filtered) : [], [filtered, view])
  const grandTotals = useMemo(() => debts.reduce((acc, d) => {
    Object.entries(d.totals).forEach(([cur, n]) => { acc[cur] = (acc[cur] ?? 0) + n })
    return acc
  }, {}), [debts])

  // Si al aceptar/rechazar se vacía la última página, retrocede
  const pageSize = view === 'debts' ? DEBT_PAGE_SIZE : LIST_PAGE_SIZE
  const totalItems = view === 'debts' ? debts.length : filtered.length
  const currentPage = Math.min(page, Math.max(1, Math.ceil(totalItems / pageSize)))
  const from = (currentPage - 1) * pageSize
  const pagedDebts = debts.slice(from, from + pageSize)
  const pagedLoans = filtered.slice(from, from + pageSize)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Préstamos" subtitle="Gestiona las solicitudes de préstamo de los usuarios" />

      <div className="flex flex-col gap-4">
        <ViewToggle value={view} onChange={setView} views={['pending', 'debts', 'history']} counts={counts} />

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 flex-1 min-w-48">
            <span className="eyebrow !text-[0.625rem]">Usuario</span>
            <div className="relative">
              <MagnifyingGlassIcon className="size-4 text-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={filters.user} onChange={e => setFilter('user', e.target.value)}
                placeholder="Nombre o correo"
                className={`${INPUT_CLS} w-full pl-9`} />
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="eyebrow !text-[0.625rem]">Desde</span>
            <input type="date" value={filters.from} max={filters.to || undefined}
              onChange={e => setFilter('from', e.target.value)} className={INPUT_CLS} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="eyebrow !text-[0.625rem]">Hasta</span>
            <input type="date" value={filters.to} min={filters.from || undefined}
              onChange={e => setFilter('to', e.target.value)} className={INPUT_CLS} />
          </label>
          {hasFilters && (
            <button onClick={() => { setFilters({ user: '', from: '', to: '' }); setPage(1) }}
              className="flex items-center gap-1 h-10 px-3 rounded-lg text-xs font-medium text-muted hover:text-ink bg-sunken transition-colors">
              <XMarkIcon className="size-4" /> Limpiar
            </button>
          )}
        </div>

        {view === 'debts'
          ? (debts.length === 0
            ? <EmptyState icon={<BanknotesIcon className="size-16" />} text={hasFilters ? 'Ninguna deuda coincide con los filtros' : 'Nadie tiene deudas activas'} />
            : (
              <>
                <div className="flex items-center justify-between bg-surface rounded-2xl border border-line px-5 py-4">
                  <div>
                    <p className="eyebrow !text-[0.625rem]">Total en la calle</p>
                    <p className="text-xs text-faint mt-0.5">{debts.length} {debts.length === 1 ? 'usuario' : 'usuarios'} con deuda</p>
                  </div>
                  <div className="text-right">
                    {Object.entries(grandTotals).map(([cur, total]) => (
                      <p key={cur} className="figure text-lg font-bold text-ink">{fmt(total, cur)}</p>
                    ))}
                  </div>
                </div>
                {pagedDebts.map(d => <UserDebtCard key={d.account?.id} debt={d} />)}
                <Pagination page={currentPage} total={totalItems} pageSize={pageSize} onChange={setPage} />
              </>
            ))
          : filtered.length === 0
          ? <EmptyState icon={<BanknotesIcon className="size-16" />} text={hasFilters ? 'Ningún préstamo coincide con los filtros' : view === 'pending' ? 'No hay préstamos pendientes' : 'Sin historial de préstamos'} />
          : (
            <>
            <ItemList>
              {pagedLoans.map((loan, i) => (
                <ItemRow key={loan.id} last={i === pagedLoans.length - 1}>
                  <UserAvatar username={loan.account?.username} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-ink">{loan.account?.username}</span>
                      <span className="text-xs text-faint hidden sm:block truncate">{loan.account?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-base font-bold text-ink">{fmt(loan.amount, loan.currency)}</span>
                      <span className="text-xs text-faint">{loan.interest_rate}% diario</span>
                      {loan.outstanding != null && (
                        <span className="text-xs font-semibold text-orange-500">Pendiente: {fmt(loan.outstanding, loan.currency)}</span>
                      )}
                      {loan.status === 'accepted' && (
                        <span className="text-xs text-faint">{fmtDays(loan.accepted_at)} adeudados</span>
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
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sunken hover:bg-sunken text-muted text-sm font-semibold transition-colors">
                        <XMarkIcon className="size-4" /> Rechazar
                      </button>
                    </div>
                  )}
                </ItemRow>
              ))}
            </ItemList>
            <Pagination page={currentPage} total={totalItems} pageSize={pageSize} onChange={setPage} />
            </>
          )
        }
      </div>
    </div>
  )
}
