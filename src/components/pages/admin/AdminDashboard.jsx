import { useEffect, useState } from 'react'
import { BanknotesIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, BuildingLibraryIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import api from '../../../api/axios'
import appError from '../../../utils/appError'
import { fmt, fmtDate, StatusBadge, UserAvatar } from './adminShared'

const StatCard = ({ label, count, icon, gradient, to }) => (
  <Link to={to} className={`rounded-2xl p-5 bg-gradient-to-br ${gradient} text-white flex items-center gap-4 hover:opacity-90 transition-opacity`}>
    <div className="p-3 bg-white/20 rounded-xl shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-3xl font-bold leading-none">{count}</p>
      <p className="text-sm text-white/75 mt-1">{label}</p>
    </div>
    <ChevronRightIcon className="size-5 text-white/60 shrink-0" />
  </Link>
)

const RecentRow = ({ username, amount, currency, status, date, last }) => (
  <div className={`flex items-center gap-3 px-4 py-3 ${!last ? 'border-b border-slate-50 dark:border-neutral-800' : ''}`}>
    <UserAvatar username={username} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{username}</p>
      <p className="text-xs text-slate-400">{fmtDate(date)}</p>
    </div>
    <div className="flex flex-col items-end gap-1">
      <span className="text-sm font-bold text-slate-900 dark:text-white">{fmt(amount, currency)}</span>
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
    { countKey: 'loans',       label: 'Préstamos pendientes', Icon: BanknotesIcon,      gradient: 'from-orange-400 to-orange-600', to: '/admin/loans' },
    { countKey: 'withdrawals', label: 'Retiros pendientes',   Icon: ArrowDownTrayIcon,  gradient: 'from-red-400    to-red-600',    to: '/admin/withdrawals' },
    { countKey: 'deposits',    label: 'Recargas pendientes',  Icon: ArrowUpTrayIcon,    gradient: 'from-emerald-400 to-emerald-600', to: '/admin/deposits' },
  ]

  const sections = [
    { key: 'loans',       title: 'Préstamos recientes',  to: '/admin/loans',       items: recent.loans,       mapFn: l => ({ username: l.account?.username, amount: l.amount, currency: l.currency, status: l.status, date: l.createdAt }) },
    { key: 'withdrawals', title: 'Retiros recientes',    to: '/admin/withdrawals', items: recent.withdrawals, mapFn: w => ({ username: w.account?.username, amount: w.amount, currency: w.currency, status: w.status, date: w.createdAt }) },
    { key: 'deposits',    title: 'Recargas recientes',   to: '/admin/deposits',    items: recent.deposits,    mapFn: r => ({ username: r.account?.username, amount: r.amount, currency: r.currency, status: r.status, date: r.createdAt }) },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 shrink-0">
          <ShieldCheckIcon className="size-7 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Resumen general de la plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map(({ countKey, label, Icon, gradient, to }) => (
          <StatCard key={countKey} label={label} count={counts[countKey]} gradient={gradient} to={to}
            icon={<Icon className="size-6" />} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sections.map(({ key, title, to, items, mapFn }) => (
          <div key={key} className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-neutral-800">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
              <Link to={to} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-0.5">
                Ver todos <ChevronRightIcon className="size-3.5" />
              </Link>
            </div>
            {items.length === 0
              ? <p className="text-xs text-slate-400 text-center py-8">Sin solicitudes pendientes</p>
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
