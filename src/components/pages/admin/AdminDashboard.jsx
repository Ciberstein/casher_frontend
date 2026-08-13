import { useEffect, useState } from 'react'
import { BanknotesIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import api from '../../../api/axios'
import appError from '../../../utils/appError'
import { fmt, fmtDate, StatusBadge, UserAvatar } from './adminShared'

/** La bandeja: cuántas solicitudes esperan una decisión en cada mostrador. */
const CounterTile = ({ label, count, icon, to }) => (
  <Link
    to={to}
    className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-rule"
  >
    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-sunken text-muted">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="figure block text-[2rem] font-semibold leading-none tracking-tight text-ink">
        {count}
      </span>
      <span className="eyebrow mt-2 block">{label}</span>
    </span>
    <ChevronRightIcon className="size-5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
  </Link>
)

const RecentRow = ({ username, amount, currency, status, date, last }) => (
  <div className={`flex items-center gap-3 px-4 py-3 ${!last ? 'border-b border-line' : ''}`}>
    <UserAvatar username={username} />
    <div className="min-w-0 flex-1">
      <p className="figure truncate text-sm font-medium text-ink">@{username}</p>
      <p className="text-xs text-faint">{fmtDate(date)}</p>
    </div>
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <span className="figure text-sm font-semibold text-ink">{fmt(amount, currency)}</span>
      <StatusBadge status={status} />
    </div>
  </div>
)

export const AdminDashboard = () => {
  const [counts, setCounts] = useState({ loans: 0, withdrawals: 0, deposits: 0 })
  const [recent, setRecent] = useState({ loans: [], withdrawals: [], deposits: [] })

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/loans/admin'),
      api.get('/api/v1/withdrawals/admin'),
      api.get('/api/v1/deposit-requests/admin'),
    ]).then(([l, w, d]) => {
      setCounts({ loans: l.data.length, withdrawals: w.data.length, deposits: d.data.length })
      setRecent({ loans: l.data.slice(0, 3), withdrawals: w.data.slice(0, 3), deposits: d.data.slice(0, 3) })
    }).catch(appError)
  }, [])

  const STATS = [
    { countKey: 'loans',       label: 'Préstamos por revisar', Icon: BanknotesIcon,     to: '/admin/loans' },
    { countKey: 'withdrawals', label: 'Retiros por revisar',   Icon: ArrowDownTrayIcon, to: '/admin/withdrawals' },
    { countKey: 'deposits',    label: 'Recargas por revisar',  Icon: ArrowUpTrayIcon,   to: '/admin/deposits' },
  ]

  const sections = [
    { key: 'loans',       title: 'Préstamos',  to: '/admin/loans',       items: recent.loans,       mapFn: l => ({ username: l.account?.username, amount: l.amount, currency: l.currency, status: l.status, date: l.createdAt }) },
    { key: 'withdrawals', title: 'Retiros',    to: '/admin/withdrawals', items: recent.withdrawals, mapFn: w => ({ username: w.account?.username, amount: w.amount, currency: w.currency, status: w.status, date: w.createdAt }) },
    { key: 'deposits',    title: 'Recargas',   to: '/admin/deposits',    items: recent.deposits,    mapFn: r => ({ username: r.account?.username, amount: r.amount, currency: r.currency, status: r.status, date: r.createdAt }) },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="eyebrow">Panel de administración</p>
        <h1 className="font-wide text-2xl font-bold tracking-tight text-ink">Bandeja de solicitudes</h1>
        <p className="text-sm text-muted">Lo que está esperando una decisión tuya.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map(({ countKey, label, Icon, to }) => (
          <CounterTile
            key={countKey}
            label={label}
            count={counts[countKey]}
            to={to}
            icon={<Icon className="size-5" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {sections.map(({ key, title, to, items, mapFn }) => (
          <div key={key} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <span className="eyebrow">{title}</span>
              <Link
                to={to}
                className="flex items-center gap-0.5 text-xs font-medium text-sello-ink transition-colors hover:text-sello"
              >
                Ver todos <ChevronRightIcon className="size-3.5" />
              </Link>
            </div>
            <div className="perf mx-4" />
            {items.length === 0
              ? <p className="px-4 py-10 text-center text-xs text-faint">Nada pendiente por acá</p>
              : items.map((item, i) => {
                  const d = mapFn(item)
                  return <RecentRow key={i} {...d} last={i === items.length - 1} />
                })
            }
          </div>
        ))}
      </div>
    </div>
  )
}
