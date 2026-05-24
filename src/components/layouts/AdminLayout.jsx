import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { accountThunk } from '../../store/slices/account.slice'
import { AdminSidebar, useAdminCounts } from '../shared/admin/AdminSidebar'
import { AdminNavbar } from '../shared/user/Navbar'

export const AdminLayout = ({ children }) => {
  const [openSidebar, setOpenSidebar] = useState(false)
  const dispatch = useDispatch()
  const counts = useAdminCounts()

  useEffect(() => {
    dispatch(accountThunk())
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">
      <AdminSidebar open={openSidebar} setOpen={setOpenSidebar} counts={counts} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminNavbar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
