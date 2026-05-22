import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { ShieldCheckIcon, ArrowLeftIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { NavLink } from '../../elements/user/NavLink';
import { SwitchDakMode } from '../../SwitchDakMode';
import { useSelector } from 'react-redux';
import { Button } from '../../elements/user/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../../context/AuthContext';
import auth from '../../../services/auth.services';


export const PreAuthNavbar = ({ className = '' }) => {
  
  const darkMode = useSelector((state) => state.darkMode);

  return (
    <nav className={`p-3 lg:rounded-b-2xl flex gap-4 dark:text-white items-center
      justify-between bg-white dark:bg-zinc-900 shadow-lg ${className}`}
    >
      <Link to="/" className="p-4 flex">
        <img src={`img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} className="max-h-10 -my-6 hidden sm:block"/>
      </Link>
      <div className="flex gap-4 items-center">
        <SwitchDakMode />
        <Button as={Link} to="/login" className="font-medium !rounded-full">
          Ingresar
        </Button>
        <Button color="green" as={Link} to="/register" className="font-medium !rounded-full">
          Registrarse
        </Button>        
      </div>
    </nav>
  )
}

export const PosAuthNavbar = ({ className = '', openSidebar, setOpenSidebar }) => {
  
  const darkMode = useSelector((state) => state.darkMode);
  const account = useSelector((state) => state.account);
  const navigate = useNavigate();

  return (
    <nav className={`p-3 lg:rounded-b-2xl flex gap-4 dark:text-white items-center
      justify-between bg-white dark:bg-zinc-900 shadow-lg ${className}`}
    >
      <div className="flex gap-2 items-center">
        <button className="rounded-full p-3 hover:bg-gray-100 hover:dark:bg-zinc-800 block lg:hidden"
          onClick={() => setOpenSidebar(!openSidebar)}
        >
          <Bars3Icon className="size-6 text-gray-900 dark:text-white"/>
        </button>
        <Link to="/" className="flex items-center">
          <img src={`img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} className="max-h-10 -my-6 hidden sm:block"/>
        </Link>
      </div>
      <div className="flex gap-4 items-center">
        <SwitchDakMode />
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            {account.picture
              ? <div className="size-9 rounded-full bg-center bg-cover shrink-0" style={{ backgroundImage: `url(${account.picture})` }} />
              : <div className="size-9 rounded-full border flex items-center justify-center bg-slate-200 shrink-0">
                  <span className="text-sm text-zinc-500 uppercase font-medium">
                    {account.data?.first_name?.[0]}{account.data?.surname_1?.[0]}
                  </span>
                </div>
            }
            <span className="hidden sm:block text-sm font-medium text-gray-800 dark:text-gray-200">
              {account.data?.first_name} {account.data?.surname_1}
            </span>
            <ChevronDownIcon className="size-4 text-gray-400 hidden sm:block" />
          </MenuButton>

          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-60 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden focus:outline-none
              data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 transition"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {account.data?.first_name} {account.data?.surname_1}
              </p>
              <p className="text-xs text-gray-400 truncate">{account.email}</p>
            </div>

            <div className="p-1.5 flex flex-col gap-0.5">
              <MenuItem>
                <button onClick={() => navigate("/settings")}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 data-[focus]:bg-gray-100 dark:data-[focus]:bg-zinc-800 transition-colors">
                  <Cog6ToothIcon className="size-4" />
                  Configuración
                </button>
              </MenuItem>
              {account.role === 'admin' && (
                <MenuItem>
                  <button onClick={() => navigate("/admin")}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 data-[focus]:bg-gray-100 dark:data-[focus]:bg-zinc-800 transition-colors">
                    <ShieldCheckIcon className="size-4" />
                    Administración
                  </button>
                </MenuItem>
              )}
            </div>

            <div className="p-1.5 border-t border-gray-100 dark:border-zinc-800">
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
      </div>
    </nav>
  )
}

export const AdminNavbar = () => {
  const darkMode = useSelector((state) => state.darkMode);
  const account = useSelector((state) => state.account);

  return (
    <nav className="p-3 flex gap-4 dark:text-white items-center justify-between bg-white dark:bg-zinc-900 shadow-lg">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="flex items-center">
          <img src={`img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} className="max-h-10 -my-6 hidden sm:block" />
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold">
          <ShieldCheckIcon className="size-3.5" />
          Admin
        </div>
      </div>
      <div className="flex items-center gap-4">
        <SwitchDakMode />
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            {account.picture
              ? <div className="size-9 rounded-full bg-center bg-cover" style={{ backgroundImage: `url(${account.picture})` }} />
              : <div className="size-9 rounded-full border flex items-center justify-center bg-slate-200">
                  <span className="text-sm text-zinc-500 uppercase font-medium">
                    {account.data?.first_name?.[0]}{account.data?.surname_1?.[0]}
                  </span>
                </div>
            }
            <span className="hidden sm:block text-sm font-medium dark:text-white">
              {account.data?.first_name} {account.data?.surname_1}
            </span>
            <ChevronDownIcon className="size-4 text-gray-500 hidden sm:block" />
          </MenuButton>
          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-60 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden focus:outline-none
              data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 transition"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {account.data?.first_name} {account.data?.surname_1}
              </p>
              <p className="text-xs text-gray-400 truncate">{account.email}</p>
            </div>
            <div className="p-1.5 flex flex-col gap-0.5">
              <MenuItem>
                <Link to="/"
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 data-[focus]:bg-gray-100 dark:data-[focus]:bg-zinc-800 transition-colors">
                  <ArrowLeftIcon className="size-4 text-gray-400" />
                  Volver a la app
                </Link>
              </MenuItem>
            </div>
            <div className="p-1.5 border-t border-gray-100 dark:border-zinc-800">
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
      </div>
    </nav>
  );
};

export const Navbar = ({ className = '', openSidebar, setOpenSidebar }) => {
  const { auth } = useContext(AuthContext);

  if(auth) {
    return (
      <PosAuthNavbar 
        className={className}
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
      />
    )
  } else {
    return (
      <PreAuthNavbar />
    )
  }
}
