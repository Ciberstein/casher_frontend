import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/20/solid'
import { HomeIcon, BanknotesIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, BuildingLibraryIcon, UsersIcon } from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import api from '../../../api/axios'

const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      { label: 'Dashboard',  route: '/admin',              icon: HomeIcon,           countKey: null },
    ],
  },
  {
    label: 'Solicitudes',
    items: [
      { label: 'Préstamos',  route: '/admin/loans',        icon: BanknotesIcon,      countKey: 'loans' },
      { label: 'Retiros',    route: '/admin/withdrawals',  icon: ArrowDownTrayIcon,  countKey: 'withdrawals' },
      { label: 'Recargas',   route: '/admin/deposits',     icon: ArrowUpTrayIcon,    countKey: 'deposits' },
    ],
  },
  {
    label: 'Plataforma',
    items: [
      { label: 'Usuarios',    route: '/admin/users',        icon: UsersIcon,           countKey: null },
      { label: 'Cuentas App', route: '/admin/app-accounts', icon: BuildingLibraryIcon, countKey: null },
    ],
  },
]

const NavItem = ({ item, counts, onClick }) => {
  const location = useLocation().pathname
  const isActive = location === item.route
  const Icon = item.icon
  const count = item.countKey ? counts[item.countKey] : 0

  return (
    <Link to={item.route} onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
        ${isActive
          ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800/60 hover:text-slate-900 dark:hover:text-white'
        }`}>
      <Icon className={`size-5 shrink-0 transition-colors
        ${isActive ? 'text-red-600 dark:text-red-400' : 'group-hover:text-slate-700 dark:group-hover:text-white'}`} />
      <span className="flex-1 truncate">{item.label}</span>
      {count > 0 && (
        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
          {count}
        </span>
      )}
      {isActive && count === 0 && <div className="size-1.5 rounded-full bg-red-500 shrink-0" />}
    </Link>
  )
}

const SidebarContent = ({ counts, onClose }) => {
  const darkMode = useSelector((state) => state.darkMode)

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-2.5 h-16 px-5 border-b border-slate-200 dark:border-neutral-800 shrink-0">
        <img src={`img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} className="max-h-8" />
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800">
          <ShieldCheckIcon className="size-3" />
          Admin
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-3 mb-1">
              {section.label}
            </p>
            {section.items.map(item => (
              <NavItem key={item.route} item={item} counts={counts} onClick={onClose} />
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 dark:border-neutral-800 px-4 py-3 shrink-0">
        <Link to="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          ← Volver a la app
        </Link>
      </div>
    </div>
  )
}

export const AdminSidebar = ({ open, setOpen, counts }) => (
  <>
    {/* Mobile drawer */}
    <Dialog open={open} onClose={setOpen} className="relative z-50">
      <DialogBackdrop transition
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out data-[closed]:opacity-0" />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 left-0 flex">
            <DialogPanel transition
              className="pointer-events-auto w-72 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full">
              <div className="flex h-full w-full bg-white dark:bg-neutral-900 shadow-2xl relative">
                <button onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
                  <XMarkIcon className="size-5" />
                </button>
                <SidebarContent counts={counts} onClose={() => setOpen(false)} />
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>

    {/* Desktop fixed sidebar */}
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex lg:flex-col bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 z-10">
      <SidebarContent counts={counts} onClose={() => {}} />
    </aside>
  </>
)

export const useAdminCounts = () => {
  const [counts, setCounts] = useState({ loans: 0, withdrawals: 0, deposits: 0 })

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/loans/admin'),
      api.get('/api/v1/withdrawals/admin'),
      api.get('/api/v1/deposit-requests/admin'),
    ]).then(([l, w, d]) => setCounts({ loans: l.data.length, withdrawals: w.data.length, deposits: d.data.length }))
      .catch(() => {})
  }, [])

  return counts
}
