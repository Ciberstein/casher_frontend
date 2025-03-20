import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { NavLink } from '../../elements/user/NavLink';
import { SwitchDakMode } from '../../SwitchDakMode';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../elements/user/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../../context/AuthContext';
import api from '../../../api/axios';
import appError from '../../../utils/appError';
import { setLoad } from '../../../store/slices/loader.slice';

export const PreAuthNavbar = ({ className = '' }) => {
  
  const darkMode = useSelector((state) => state.darkMode);

  return (
    <nav className={`p-3 lg:rounded-b-2xl flex gap-4 dark:text-white items-center
      justify-between bg-white dark:bg-zinc-900 shadow-lg ${className}`}
    >
      <Link to="/" className="p-4">
        <img src={`img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} className="max-h-10 -my-6 hidden sm:block"/>
      </Link>
      <div className="flex gap-4 items-center">
        <SwitchDakMode />
        <Button as={Link} to="/login" className="font-medium !rounded-full">Ingresar</Button>
        <Button color="green" as={Link} to="/register" className="font-medium !rounded-full">Registrarse</Button>        
      </div>
    </nav>
  )
}

export const PosAuthNavbar = ({ className = '', openSidebar, setOpenSidebar }) => {
  
  const darkMode = useSelector((state) => state.darkMode);
  const account = useSelector((state) => state.account);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const logout = async () => {
    dispatch(setLoad(false));
    const url = `/api/v1/auth/logout`;

    await api.post(url)
      .then(() => location.reload())
      .catch((err) => appError(err))
      .finally(() => dispatch(setLoad(true)))
  }

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
        <img src={`img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} className="max-h-10 -my-6 hidden sm:block"/>
      </div>
      <div className="flex gap-4 items-center">
        <SwitchDakMode />
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <NavLink 
              as={MenuButton} 
              className="inline-flex w-full justify-center items-center gap-x-2 !rounded-full p-2 
                text-sm font-semibold text-gray-900 dark:text-gray-200 hover:bg-gray-100 
                hover:dark:bg-zinc-800"
              >
              <div className="size-10 rounded-full border flex flex-col justify-center items-center bg-slate-200">
                <span className="text-lg text-zinc-500 uppercase">
                  {account.first_name?.split("")[0]}
                  {account.last_name?.split("")[0]}
                </span>
              </div>
              <span className="hidden sm:block">
                {`${account.first_name} ${account.last_name}`}
              </span>
              <div className="pr-2 hidden sm:block">
                <ChevronDownIcon aria-hidden="true" className="size-5 text-gray-900 dark:text-gray-200" />
              </div>
            </NavLink>
          </div>

          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-zinc-700 rounded-md bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="py-1">
              <MenuItem>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-white dark:data-[focus]:bg-zinc-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                >
                  Edit
                </a>
              </MenuItem>
              <MenuItem>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-white dark:data-[focus]:bg-zinc-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                >
                  Duplicate
                </a>
              </MenuItem>
            </div>
            <div className="py-1">
              <MenuItem>
                <a href="#"
                  onClick={() => logout()}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-white dark:data-[focus]:bg-zinc-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                >
                  Cerrar sessión
                </a>
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
    </nav>
  )
}

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
