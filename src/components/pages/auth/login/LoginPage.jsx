import React, { useState } from 'react'
import { AuthSplitLayout } from '../../../layouts/AuthSplitLayout'
import { LoginForm } from './partials/LoginForm'
import { TwoFactorForm } from './partials/TwoFactorForm'
import { CodeValidation } from '../register/partials/CodeValidation'

export const LoginPage = () => {
  const [account, setAccount] = useState(false);
  const [challenge, setChallenge] = useState(null);

  const verifying = account || challenge

  return (
    <AuthSplitLayout
      title={verifying ? 'Verifica tu identidad' : 'Bienvenido de vuelta'}
      subtitle={
        challenge ? 'Confirma que eres tú con tu app autenticadora'
          : account ? `Escribe el código que enviamos a ${account.email}`
          : 'Entra con tu correo y contraseña'
      }
      footerText="¿No tienes una cuenta?"
      footerLink="/register"
      footerLinkText="Abre tu cuenta"
    >
      {challenge
        ? <TwoFactorForm challenge={challenge} onBack={() => setChallenge(null)} />
        : account
          ? <CodeValidation account={account} />
          : <LoginForm setAccount={setAccount} setChallenge={setChallenge} />
      }
    </AuthSplitLayout>
  );
};
