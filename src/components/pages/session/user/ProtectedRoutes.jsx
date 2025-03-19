import { Outlet } from 'react-router-dom';
import { PosAuthLayout } from '../../../layouts/PosAuthLayout';
import { Landing } from '../../Landing';
import { useContext } from 'react';
import AuthContext from '../../../../context/AuthContext';

export const ProtectedRoutes = () => {

    const { auth } = useContext(AuthContext);
  
    if (auth)
      return (
        <PosAuthLayout>
          <Outlet />
        </PosAuthLayout>
      );
  
    return <Landing />;
  };