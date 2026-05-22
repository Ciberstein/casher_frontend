import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { accountThunk } from '../../store/slices/account.slice'
import { AdminNavbar } from '../shared/user/Navbar'

export const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(accountThunk());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-800 flex flex-col">
      <AdminNavbar />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
