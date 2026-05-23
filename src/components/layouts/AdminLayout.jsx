import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { accountThunk } from '../../store/slices/account.slice'
import { AdminNavbar } from '../shared/user/Navbar'

export const AdminLayout = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(accountThunk())
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col">
      <AdminNavbar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
