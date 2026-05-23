import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import {
  HomeIcon, ArrowsRightLeftIcon, UsersIcon, BuildingLibraryIcon,
} from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const NAV_ITEMS = [
  { label: 'Inicio',            route: '/',               icon: HomeIcon },
  { label: 'Cuentas bancarias', route: '/bank-accounts',  icon: BuildingLibraryIcon },
  { label: 'Destinatarios',     route: '/recipients',     icon: UsersIcon },
  { label: 'Transacciones',     route: '/transactions',   icon: ArrowsRightLeftIcon },
]

const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon
  return (
    <Link
      to={item.route}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
        ${isActive
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800/60 hover:text-slate-900 dark:hover:text-white'
        }`}
    >
      <Icon className={`size-5 shrink-0 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'group-hover:text-slate-700 dark:group-hover:text-white'}`} />
      <span className="truncate">{item.label}</span>
      {isActive && <div className="ml-auto size-1.5 rounded-full bg-emerald-500 shrink-0" />}
    </Link>
  )
}

const ContentSidebar = ({ onClose }) => {
  const location = useLocation().pathname
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map(item => (
        <NavItem
          key={item.route}
          item={item}
          isActive={item.route === location}
          onClick={onClose}
        />
      ))}
    </nav>
  )
}

const UserProfile = ({ account }) => (
  <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
    {account.picture
      ? <div className="size-9 rounded-full bg-center bg-cover shrink-0 ring-2 ring-slate-200 dark:ring-neutral-700"
          style={{ backgroundImage: `url(${account.picture})` }} />
      : <div className="size-9 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 shrink-0 ring-2 ring-emerald-200 dark:ring-emerald-900/50">
          <span className="text-xs text-white uppercase font-bold">
            {account.data?.first_name?.[0]}{account.data?.surname_1?.[0]}
          </span>
        </div>
    }
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
        {account.data?.first_name} {account.data?.surname_1}
      </p>
      <p className="text-xs text-slate-400 truncate">{account.email}</p>
    </div>
  </div>
)

const SidebarShell = ({ account, onClose, showClose = false, setOpen }) => {
  const darkMode = useSelector((state) => state.darkMode)

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-neutral-800 shrink-0">
        <img src={`img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} className="max-h-8" />
        {showClose && (
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <XMarkIcon className="size-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <ContentSidebar onClose={onClose} />
      </div>

      <div className="border-t border-slate-200 dark:border-neutral-800 px-3 py-3 shrink-0">
        <UserProfile account={account} />
      </div>
    </div>
  )
}

export const Sidebar = ({ open, setOpen }) => {
  const account = useSelector((state) => state.account)

  return (
    <>
      {/* Mobile drawer */}
      <Dialog open={open} onClose={setOpen} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex">
              <DialogPanel
                transition
                className="pointer-events-auto w-72 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
              >
                <div className="flex h-full w-full bg-white dark:bg-neutral-900 shadow-2xl">
                  <SidebarShell account={account} onClose={() => setOpen(false)} showClose setOpen={setOpen} />
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex lg:flex-col bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 z-10">
        <SidebarShell account={account} onClose={() => {}} />
      </aside>
    </>
  )
}
