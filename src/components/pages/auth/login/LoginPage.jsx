import React, { useState } from 'react'
import { AuthSplitLayout } from '../../../layouts/AuthSplitLayout'
import { LoginForm } from './partials/LoginForm'
import { CodeValidation } from '../register/partials/CodeValidation'

export const LoginPage = () => {
  const [account, setAccount] = useState(false);

  return (
    <AuthSplitLayout
      title={account ? 'Verifica tu identidad' : 'Bienvenido de vuelta'}
      subtitle={account ? `Escribe el código que enviamos a ${account.email}` : 'Entra con tu correo y contraseña'}
      footerText="¿No tienes una cuenta?"
      footerLink="/register"
      footerLinkText="Abre tu cuenta"
    >
      {account
        ? <CodeValidation account={account} />
        : <LoginForm setAccount={setAccount} />
      }
    </AuthSplitLayout>
  );
};
