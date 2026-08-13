import React, { useState } from 'react'
import { AuthSplitLayout } from '../../../layouts/AuthSplitLayout'
import { RegisterForm } from './partials/RegisterForm'
import { CodeValidation } from './partials/CodeValidation'
import { useLocation } from 'react-router-dom'

export const RegisterPage = () => {
  const [account, setAccount] = useState(false);

  const location = useLocation();
  const data = location.state && location.state.data;

  return (
    <AuthSplitLayout
      title={account ? 'Verifica tu correo' : 'Abre tu cuenta'}
      subtitle={account ? `Enviamos un código a ${account.email}` : 'Unos datos y ya puedes mover dinero'}
      footerText="¿Ya tienes cuenta?"
      footerLink="/login"
      footerLinkText="Ingresar"
    >
      {account
        ? <CodeValidation account={account} />
        : <RegisterForm setAccount={setAccount} firebase={data} />
      }
    </AuthSplitLayout>
  );
};
