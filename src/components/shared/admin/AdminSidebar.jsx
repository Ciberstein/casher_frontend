import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
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
    <Link
      to={item.route}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 border-l-2 pl-4 pr-3 py-2.5 text-sm transition-colors duration-150
        ${isActive
          ? 'border-sello bg-sunken/70 text-ink font-semibold'
          : 'border-transparent text-muted hover:text-ink hover:bg-sunken/45'
        }`}
    >
      <Icon className={`size-[1.15rem] shrink-0 ${isActive ? 'text-sello' : ''}`} />
      <span className="flex-1 truncate font-semiwide">{item.label}</span>
      {count > 0 && (
        <span className="figure inline-flex h-5 min-w-5 items-center justify-center rounded px-1
          bg-sello-soft text-[0.6875rem] font-semibold text-sello-ink">
          {count}
        </span>
      )}
    </Link>
  )
}

const SidebarContent = ({ counts, onClose }) => {
  const darkMode = useSelector((state) => state.darkMode)

  return (
    <div className="flex h-full w-full flex-col bg-surface">
      <div className="flex h-16 shrink-0 items-center gap-3 px-4">
        <Link to="/admin" onClick={onClose}>
          <img src={`/img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} alt="Casher" className="max-h-7" />
        </Link>
        <span className="eyebrow border-l border-line pl-3">Admin</span>
      </div>

      <div className="perf mx-4" />

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto py-4">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="flex flex-col">
            <p className="eyebrow px-4 pb-2.5">{section.label}</p>
            {section.items.map(item => (
              <NavItem key={item.route} item={item} counts={counts} onClick={onClose} />
            ))}
          </div>
        ))}
      </div>

      <div className="perf mx-4" />
      <Link
        to="/"
        className="px-4 py-3.5 text-xs font-medium text-muted transition-colors hover:text-ink"
      >
        ← Volver a la app
      </Link>
    </div>
  )
}

export const AdminSidebar = ({ open, setOpen, counts }) => (
  <>
    {/* Cajón en móvil */}
    <Dialog open={open} onClose={setOpen} className="relative z-50 lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-ink/45 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 overflow-hidden">
        <div className="pointer-events-none fixed inset-y-0 left-0 flex">
          <DialogPanel
            transition
            className="pointer-events-auto w-72 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
          >
            <div className="relative flex h-full w-full border-r border-line shadow-2xl">
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="absolute right-3 top-4 rounded p-1.5 text-faint transition-colors hover:bg-sunken hover:text-ink"
              >
                <XMarkIcon className="size-5" />
              </button>
              <SidebarContent counts={counts} onClose={() => setOpen(false)} />
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>

    {/* Barra fija en escritorio */}
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-10 lg:flex lg:w-64 lg:flex-col border-r border-line">
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
