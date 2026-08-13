import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
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
    <div className="min-h-screen bg-canvas text-ink">
      <AdminSidebar open={openSidebar} setOpen={setOpenSidebar} counts={counts} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminNavbar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
