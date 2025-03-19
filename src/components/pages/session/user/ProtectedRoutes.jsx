import { Outlet } from 'react-router-dom';
import { PosAuthLayout } from '../../../layouts/PosAuthLayout';
import { Landing } from '../../Landing';

export const ProtectedRoutes = () => {
    const sessionAuth = sessionStorage.getItem('authToken');
  
    if (sessionAuth)
      return (
        <PosAuthLayout>
          <Outlet />
        </PosAuthLayout>
      );
  
    return <Landing />;
  };