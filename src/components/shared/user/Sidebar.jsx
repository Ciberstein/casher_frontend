
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { HomeIcon, QueueListIcon, UsersIcon } from '@heroicons/react/24/outline';

import { Link, useLocation } from 'react-router-dom'
import { NavLink } from '../../elements/user/NavLink';

export const ContentSidebar = () => {

  const location = useLocation().pathname;

  const active = (path) => {
    if(path === location) return '!bg-gradient-to-r'
    return 'hover:!bg-gradient-to-r'
  }

  const nav = [
    {
      label: 'Inicio',
      route: '/',
      icon: <HomeIcon className="size-6" />
    },
    {
      label: 'Destinatarios',
      route: '/recipients',
      icon: <UsersIcon className="size-6" />
    },
    {
      label: 'Solicitudes',
      route: '/requests',
      icon: <QueueListIcon className="size-6" />
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {
        nav.map(item => (
          <NavLink as={Link} to={item.route} 
            className={`${active(item.route)} dark:!from-zinc-950 dark:!via-zinc-900 
              !from-gray-200 !via-gray-100 !to-transparent flex gap-3 items-center dark:text-white`} 
            key={item.label}>
            {item.icon}
            {item.label}
          </NavLink>
        ))
      }
    </div>
  )
}

export const DialogSidebar = ({ open, setOpen, children }) => {
  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
            <DialogPanel
              transition
              className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:-translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-auto bg-white dark:bg-zinc-800 shadow-xl p-4 gap-12">
                <header className="flex gap-4 justify-between items-center">
                  <img src="img/logo.svg" className="max-h-10"/>
                  <button className="hover:text-gray-400 text-gray-900 transition-colors ease-out"
                    onClick={() => setOpen(false)}
                  >
                    <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                  </button>
                </header>
                {children}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export const Sidebar = ({
  open,
  setOpen
}) => {
  return (
    <>
      <DialogSidebar open={open} setOpen={setOpen}>
        <ContentSidebar />
      </DialogSidebar>
      <aside className="hidden lg:block">
        <ContentSidebar />
      </aside>
    </>
  )
}
