import { Fragment, useRef } from 'react'
import { Dialog, DialogPanel, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

/**
 * Una hoja que sale de la máquina: entra desde arriba, con la línea de
 * perforación separando el encabezado del cuerpo.
 */
export default function Modal({
  children,
  open = false,
  setOpen,
  title = null,
  className = '',
  confirmButton = null,
  header = true,
  screen = false,
}) {
  const cancelButtonRef = useRef(null)

  const Backdrop = ({ strong }) => (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-200"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className={`fixed inset-0 bg-ink/45 ${strong ? 'backdrop-blur-md' : 'backdrop-blur-[2px]'} transition-opacity`} />
    </Transition.Child>
  )

  const panelTransition = {
    enter: 'ease-out duration-200',
    enterFrom: 'opacity-0 -translate-y-3 sm:scale-[0.98]',
    enterTo: 'opacity-100 translate-y-0 sm:scale-100',
    leave: 'ease-in duration-150',
    leaveFrom: 'opacity-100 translate-y-0 sm:scale-100',
    leaveTo: 'opacity-0 -translate-y-2 sm:scale-[0.98]',
  }

  if (screen)
    return (
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40" initialFocus={cancelButtonRef} onClose={setOpen}>
          <Backdrop strong />
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child as={Fragment} {...panelTransition}>
                <DialogPanel className="relative transform transition-all">
                  <div className={`p-4 ${className}`}>{children}</div>
                </DialogPanel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    )

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" initialFocus={cancelButtonRef} onClose={setOpen}>
        <Backdrop />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child as={Fragment} {...panelTransition}>
              <Dialog.Panel className="relative transform rounded-2xl bg-surface text-ink
                border border-line shadow-2xl text-left transition-all sm:m-8 sm:w-full sm:max-w-lg">
                {header && (
                  <>
                    <header className="flex justify-between items-center gap-4 px-5 py-4">
                      <h2 className="text-base font-semibold font-semiwide text-ink">
                        {title}
                      </h2>
                      <button
                        aria-label="Cerrar"
                        className="p-1.5 -mr-1.5 rounded text-faint hover:text-ink hover:bg-sunken transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <XMarkIcon className="size-5" />
                      </button>
                    </header>
                    <div className="perf mx-5" />
                  </>
                )}
                <div className={`p-5 ${className}`}>{children}</div>
                {confirmButton && <div className="px-5 pb-5">{confirmButton}</div>}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
