import React, { useState } from 'react'
import { AuthSplitLayout } from '../../../layouts/AuthSplitLayout'
import { LoginForm } from './partials/LoginForm'
import { CodeValidation } from '../register/partials/CodeValidation'

export const LoginPage = () => {
  const [account, setAccount] = useState(false);

  return (
    <AuthSplitLayout
      title={account ? 'Verifica tu identidad' : 'Bienvenido de vuelta'}
      subtitle={account ? `Ingresa el código enviado a ${account.email}` : 'Ingresa tu correo y contraseña para continuar'}
      footerText="¿No tienes una cuenta?"
      footerLink="/register"
      footerLinkText="Regístrate gratis"
    >
      {account
        ? <CodeValidation account={account} />
        : <LoginForm setAccount={setAccount} />
      }
    </AuthSplitLayout>
  );
};
