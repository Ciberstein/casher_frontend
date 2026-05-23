import { useEffect, useState } from 'react'
import { Navbar } from '../shared/user/Navbar'
import { Sidebar } from '../shared/user/Sidebar'
import { useDispatch } from 'react-redux'
import { accountThunk } from '../../store/slices/account.slice'
import { currencyThunk } from '../../store/slices/currency.slice'

export const PosAuthLayout = ({ children }) => {
  const [openSidebar, setOpenSidebar] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(accountThunk())
    dispatch(currencyThunk())
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">
      <Sidebar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
