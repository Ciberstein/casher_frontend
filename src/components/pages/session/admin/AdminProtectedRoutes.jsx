import { Outlet, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { useSelector } from 'react-redux';
import AuthContext from '../../../../context/AuthContext';
import { AdminLayout } from '../../../layouts/AdminLayout';

export const AdminProtectedRoutes = () => {
  const { auth } = useContext(AuthContext);
  const account = useSelector((state) => state.account);

  if (!auth) return <Navigate to="/login" />;
  if (account.role && account.role !== 'admin') return <Navigate to="/" />;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};
