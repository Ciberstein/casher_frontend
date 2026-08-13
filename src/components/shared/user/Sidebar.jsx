import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import {
  HomeIcon, ArrowsRightLeftIcon, UsersIcon, BuildingLibraryIcon,
} from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Inicio',            route: '/',               icon: HomeIcon },
  { label: 'Cuentas bancarias', route: '/bank-accounts',  icon: BuildingLibraryIcon },
  { label: 'Destinatarios',     route: '/recipients',     icon: UsersIcon },
  { label: 'Transacciones',     route: '/transactions',   icon: ArrowsRightLeftIcon },
]

/** El renglón activo se marca al margen, como se marca una línea en un libro. */
const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon
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
      <span className="truncate font-semiwide">{item.label}</span>
    </Link>
  )
}

const ContentSidebar = ({ onClose }) => {
  const location = useLocation().pathname
  return (
    <nav className="flex flex-col">
      <p className="eyebrow px-4 pb-2.5 pt-1">Cuenta</p>
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

/** Titular de la cuenta: el pie de todo comprobante. */
const AccountHolder = ({ account }) => {
  const [imgFailed, setImgFailed] = useState(false)
  const initials = `${account.data?.first_name?.[0] ?? ''}${account.data?.surname_1?.[0] ?? ''}`

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {account.picture && !imgFailed
        ? <img
            src={account.picture}
            onError={() => setImgFailed(true)}
            alt=""
            className="size-9 rounded-lg object-cover shrink-0 border border-line"
          />
        : <div className="size-9 rounded-lg bg-ink flex items-center justify-center shrink-0">
            <span className="figure text-[0.7rem] font-semibold uppercase text-reverse">{initials}</span>
          </div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">
          {account.data?.first_name} {account.data?.surname_1}
        </p>
        <p className="figure text-[0.7rem] text-faint truncate">{account.email}</p>
      </div>
    </div>
  )
}

const SidebarShell = ({ account, onClose, showClose = false, setOpen }) => {
  const darkMode = useSelector((state) => state.darkMode)

  return (
    <div className="flex h-full w-full flex-col bg-surface">
      <div className="flex items-center justify-between h-16 px-4 shrink-0">
        <Link to="/" onClick={onClose}>
          <img src={`/img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} alt="Casher" className="max-h-7" />
        </Link>
        {showClose && (
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="p-1.5 rounded text-faint hover:text-ink hover:bg-sunken transition-colors"
          >
            <XMarkIcon className="size-5" />
          </button>
        )}
      </div>

      <div className="perf mx-4" />

      <div className="flex-1 overflow-y-auto py-4">
        <ContentSidebar onClose={onClose} />
      </div>

      <div className="perf mx-4" />
      <AccountHolder account={account} />
    </div>
  )
}

export const Sidebar = ({ open, setOpen }) => {
  const account = useSelector((state) => state.account)

  return (
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
              <div className="flex h-full w-full border-r border-line shadow-2xl">
                <SidebarShell account={account} onClose={() => setOpen(false)} showClose setOpen={setOpen} />
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Barra fija en escritorio */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex lg:flex-col border-r border-line z-10">
        <SidebarShell account={account} onClose={() => {}} />
      </aside>
    </>
  )
}
