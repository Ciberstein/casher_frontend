import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { ShieldCheckIcon, ArrowLeftIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { SwitchDakMode } from '../../SwitchDakMode'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../../../context/AuthContext'
import auth from '../../../services/auth.services'

const UserAvatar = ({ account, size = 'md' }) => {
  const cls = size === 'sm' ? 'size-8 text-xs' : 'size-9 text-sm'
  return account.picture
    ? <div className={`${cls} rounded-full bg-center bg-cover shrink-0 ring-2 ring-slate-200 dark:ring-neutral-700`}
        style={{ backgroundImage: `url(${account.picture})` }} />
    : <div className={`${cls} rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 shrink-0`}>
        <span className="text-white uppercase font-bold">
          {account.data?.first_name?.[0]}{account.data?.surname_1?.[0]}
        </span>
      </div>
}

const UserMenu = ({ account, navigate, extraItems }) => (
  <Menu as="div" className="relative">
    <MenuButton className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
      <UserAvatar account={account} />
      <span className="hidden sm:block text-sm font-medium text-slate-800 dark:text-slate-200 max-w-28 truncate">
        {account.data?.first_name} {account.data?.surname_1}
      </span>
      <ChevronDownIcon className="size-4 text-slate-400 hidden sm:block" />
    </MenuButton>

    <MenuItems
      transition
      className="absolute right-0 z-30 mt-2 w-60 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl border border-slate-200 dark:border-neutral-800 overflow-hidden focus:outline-none
        data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 transition"
    >
      <div className="px-4 py-3 border-b border-slate-100 dark:border-neutral-800">
        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
          {account.data?.first_name} {account.data?.surname_1}
        </p>
        <p className="text-xs text-slate-400 truncate">{account.email}</p>
      </div>

      {extraItems && (
        <div className="p-1.5 flex flex-col gap-0.5 border-b border-slate-100 dark:border-neutral-800">
          {extraItems}
        </div>
      )}

      <div className="p-1.5">
        <MenuItem>
          <button onClick={() => auth.disconnect()}
            className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm text-red-500 data-[focus]:bg-red-50 dark:data-[focus]:bg-red-900/20 transition-colors">
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
    <nav className={`h-16 flex items-center justify-between px-6 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 ${className}`}>
      <Link to="/" className="flex items-center gap-2">
        <img src={`img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} className="max-h-8" />
      </Link>
      <div className="flex items-center gap-3">
        <SwitchDakMode />
        <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800">
          Ingresar
        </Link>
        <Link to="/register" className="text-sm font-medium bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm">
          Registrarse
        </Link>
      </div>
    </nav>
  )
}

export const PosAuthNavbar = ({ className = '', openSidebar, setOpenSidebar }) => {
  const darkMode = useSelector((state) => state.darkMode)
  const account = useSelector((state) => state.account)
  const navigate = useNavigate()

  return (
    <header className={`h-14 lg:h-16 flex items-center justify-between gap-4 px-4 lg:px-8
      bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-neutral-800 sticky top-0 z-20 ${className}`}>

      {/* Mobile: hamburger + logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setOpenSidebar(!openSidebar)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Bars3Icon className="size-5" />
        </button>
        <img src={`img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} className="max-h-7" />
      </div>

      {/* Desktop: spacer */}
      <div className="hidden lg:flex" />

      <div className="flex items-center gap-2">
        <SwitchDakMode />
        <UserMenu
          account={account}
          navigate={navigate}
          extraItems={
            <>
              <MenuItem>
                <button onClick={() => navigate('/settings')}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-800 transition-colors">
                  <Cog6ToothIcon className="size-4 text-slate-400" />
                  Configuración
                </button>
              </MenuItem>
              {account.role === 'admin' && (
                <MenuItem>
                  <button onClick={() => navigate('/admin')}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-800 transition-colors">
                    <ShieldCheckIcon className="size-4 text-slate-400" />
                    Administración
                  </button>
                </MenuItem>
              )}
            </>
          }
        />
      </div>
    </header>
  )
}

export const AdminNavbar = () => {
  const darkMode = useSelector((state) => state.darkMode)
  const account = useSelector((state) => state.account)
  const navigate = useNavigate()

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="flex items-center gap-2">
          <img src={`img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} className="max-h-8" />
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800">
          <ShieldCheckIcon className="size-3.5" />
          Admin
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SwitchDakMode />
        <UserMenu
          account={account}
          navigate={navigate}
          extraItems={
            <MenuItem>
              <Link to="/"
                className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-800 transition-colors">
                <ArrowLeftIcon className="size-4 text-slate-400" />
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
