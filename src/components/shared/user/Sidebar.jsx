
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import {
  HomeIcon, ArrowsRightLeftIcon, UsersIcon, BuildingLibraryIcon,
  Cog6ToothIcon, ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import auth from '../../../services/auth.services'

const NAV_ITEMS = [
  { label: 'Inicio',            route: '/',               icon: HomeIcon },
  { label: 'Cuentas bancarias', route: '/bank-accounts',  icon: BuildingLibraryIcon },
  { label: 'Destinatarios',     route: '/recipients',     icon: UsersIcon },
  { label: 'Transacciones',     route: '/transactions',   icon: ArrowsRightLeftIcon },
];

const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.route}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
        ${isActive
          ? 'bg-gray-100 text-stone-900 dark:bg-zinc-700 dark:text-zinc-100'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
        }`}
    >
      <Icon className={`size-5 shrink-0 transition-transform duration-150 ${isActive ? '' : 'group-hover:scale-110'}`} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
};

export const ContentSidebar = ({ onClose }) => {
  const location = useLocation().pathname;

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(item => (
        <NavItem
          key={item.route}
          item={item}
          isActive={item.route === location}
          onClick={onClose}
        />
      ))}
    </nav>
  );
};

const UserProfile = ({ account, onClose }) => {
  const navigate = useNavigate();

  const go = (path) => { navigate(path); onClose(); };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60">
        {account.picture
          ? <div className="size-11 rounded-full bg-center bg-cover shrink-0"
              style={{ backgroundImage: `url(${account.picture})` }} />
          : <div className="size-11 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0">
              <span className="text-sm text-white uppercase font-semibold">
                {account.data?.first_name?.[0]}{account.data?.surname_1?.[0]}
              </span>
            </div>
        }
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {account.data?.first_name} {account.data?.surname_1}
          </p>
          <p className="text-xs text-gray-400 truncate">{account.email}</p>
        </div>
      </div>

      <button
        onClick={() => go('/settings')}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400
          hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-all duration-150"
      >
        <Cog6ToothIcon className="size-5 shrink-0" />
        Configuración
      </button>

      <button
        onClick={() => auth.disconnect()}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500
          hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
      >
        <ArrowRightStartOnRectangleIcon className="size-5 shrink-0" />
        Cerrar sesión
      </button>
    </div>
  );
};

export const DialogSidebar = ({ open, setOpen, children }) => {
  const darkMode = useSelector((state) => state.darkMode);

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 left-0 flex">
            <DialogPanel
              transition
              className="pointer-events-auto w-72 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <div className="flex h-full flex-col bg-white dark:bg-zinc-900 shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                  <img src={`img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} className="max-h-8" />
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-5 p-4">
                  {children}
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export const Sidebar = ({ open, setOpen }) => {
  const account = useSelector((state) => state.account);

  return (
    <>
      <DialogSidebar open={open} setOpen={setOpen}>
        <UserProfile account={account} onClose={() => setOpen(false)} />
        <div className="h-px bg-gray-100 dark:bg-zinc-800" />
        <ContentSidebar onClose={() => setOpen(false)} />
      </DialogSidebar>

      <aside className="hidden lg:flex flex-col gap-2">
        <ContentSidebar />
      </aside>
    </>
  );
};
