import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { ShieldCheckIcon, ArrowLeftIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { SwitchDakMode } from '../../SwitchDakMode'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useContext, useState } from 'react'
import AuthContext from '../../../context/AuthContext'
import auth from '../../../services/auth.services'

const UserAvatar = ({ account, size = 'md' }) => {
  const [imgFailed, setImgFailed] = useState(false)
  const cls = size === 'sm' ? 'size-8' : 'size-9'
  const initials = `${account.data?.first_name?.[0] ?? ''}${account.data?.surname_1?.[0] ?? ''}`

  if (account.picture && !imgFailed) {
    return (
      <img
        src={account.picture}
        onError={() => setImgFailed(true)}
        alt=""
        className={`${cls} rounded-lg object-cover shrink-0 border border-line`}
      />
    )
  }
  return (
    <div className={`${cls} rounded-lg bg-ink flex items-center justify-center shrink-0`}>
      <span className="figure text-[0.7rem] font-semibold uppercase text-reverse">{initials}</span>
    </div>
  )
}

const menuItemCls = `flex items-center gap-2.5 w-full text-left px-3 py-2 rounded text-sm
  text-muted data-[focus]:bg-sunken data-[focus]:text-ink transition-colors`

const UserMenu = ({ account, extraItems }) => (
  <Menu as="div" className="relative">
    <MenuButton className="flex items-center gap-2.5 rounded-lg p-1 pr-2 hover:bg-sunken transition-colors">
      <UserAvatar account={account} />
      <span className="hidden sm:block text-sm font-medium text-ink max-w-28 truncate">
        {account.data?.first_name} {account.data?.surname_1}
      </span>
      <ChevronDownIcon className="size-4 text-faint hidden sm:block" />
    </MenuButton>

    <MenuItems
      transition
      className="absolute right-0 z-30 mt-2 w-64 rounded-xl bg-surface border border-line shadow-xl
        overflow-hidden focus:outline-none
        data-[closed]:-translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-150 data-[leave]:duration-100 transition"
    >
      <div className="px-4 py-3">
        <p className="eyebrow mb-1.5">Titular</p>
        <p className="text-sm font-semibold text-ink truncate">
          {account.data?.first_name} {account.data?.surname_1}
        </p>
        <p className="figure text-[0.7rem] text-faint truncate">{account.email}</p>
      </div>

      <div className="perf mx-4" />

      {extraItems && (
        <>
          <div className="p-1.5 flex flex-col gap-0.5">{extraItems}</div>
          <div className="perf mx-4" />
        </>
      )}

      <div className="p-1.5">
        <MenuItem>
          <button
            onClick={() => auth.disconnect()}
            className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded text-sm
              text-salida data-[focus]:bg-salida-soft transition-colors"
          >
            <ArrowRightStartOnRectangleIcon className="size-4" />
            Cerrar sesión
          </button>
        </MenuItem>
      </div>
    </MenuItems>
  </Menu>
)

export const PreAuthNavbar = ({ className = '' }) => {
  const darkMode = useSelector((state) => state.darkMode)

  return (
    <nav className={`h-16 flex items-center justify-between px-5 sm:px-8 bg-canvas/90 backdrop-blur-sm ${className}`}>
      <Link to="/" className="flex items-center">
        <img src={`/img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} alt="Casher" className="max-h-7" />
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <SwitchDakMode />
        <Link
          to="/login"
          className="text-sm font-medium text-muted hover:text-ink transition-colors px-3 py-2 rounded-lg hover:bg-sunken"
        >
          Ingresar
        </Link>
        <Link
          to="/register"
          className="text-sm font-medium font-semiwide bg-ink text-reverse px-4 py-2 rounded-lg hover:bg-ink/88 transition-colors"
        >
          Abrir cuenta
        </Link>
      </div>
    </nav>
  )
}

/** La fecha del día encabeza la sesión, como encabeza un extracto. */
const today = () =>
  new Date().toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })

export const PosAuthNavbar = ({ className = '', openSidebar, setOpenSidebar }) => {
  const darkMode = useSelector((state) => state.darkMode)
  const account = useSelector((state) => state.account)

  return (
    <header
      className={`h-14 lg:h-16 flex items-center justify-between gap-4 px-4 lg:px-8
        bg-canvas/92 backdrop-blur-sm border-b border-line sticky top-0 z-20 ${className}`}
    >
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setOpenSidebar(!openSidebar)}
          aria-label="Abrir menú"
          className="p-2 -ml-2 rounded-lg text-muted hover:text-ink hover:bg-sunken transition-colors"
        >
          <Bars3Icon className="size-5" />
        </button>
        <img src={`/img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} alt="Casher" className="max-h-6" />
      </div>

      <p className="eyebrow hidden lg:block first-letter:uppercase">{today()}</p>

      <div className="flex items-center gap-1.5">
        <SwitchDakMode />
        <UserMenu
          account={account}
          extraItems={
            <>
              <MenuItem>
                <Link to="/settings" className={menuItemCls}>
                  <Cog6ToothIcon className="size-4 text-faint" />
                  Configuración
                </Link>
              </MenuItem>
              {account.role === 'admin' && (
                <MenuItem>
                  <Link to="/admin" className={menuItemCls}>
                    <ShieldCheckIcon className="size-4 text-faint" />
                    Administración
                  </Link>
                </MenuItem>
              )}
            </>
          }
        />
      </div>
    </header>
  )
}

export const AdminNavbar = ({ openSidebar, setOpenSidebar }) => {
  const darkMode = useSelector((state) => state.darkMode)
  const account = useSelector((state) => state.account)

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-canvas/92 backdrop-blur-sm border-b border-line sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpenSidebar(!openSidebar)}
          aria-label="Abrir menú"
          className="lg:hidden p-2 -ml-2 rounded-lg text-muted hover:text-ink hover:bg-sunken transition-colors"
        >
          <Bars3Icon className="size-5" />
        </button>
        <Link to="/admin" className="hidden lg:flex items-center gap-3">
          <img src={`/img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} alt="Casher" className="max-h-7" />
          <span className="eyebrow border-l border-line pl-3">Administración</span>
        </Link>
      </div>

      <div className="flex items-center gap-1.5">
        <SwitchDakMode />
        <UserMenu
          account={account}
          extraItems={
            <MenuItem>
              <Link to="/" className={menuItemCls}>
                <ArrowLeftIcon className="size-4 text-faint" />
                Volver a la app
              </Link>
            </MenuItem>
          }
        />
      </div>
    </header>
  )
}

export const Navbar = ({ className = '', openSidebar, setOpenSidebar }) => {
  const { auth } = useContext(AuthContext)
  return auth
    ? <PosAuthNavbar className={className} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
    : <PreAuthNavbar className={className} />
}
