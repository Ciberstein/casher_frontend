import React, { useState } from 'react'
import { AuthSplitLayout } from '../../../layouts/AuthSplitLayout'
import { RecoveryForm } from './partials/RecoveryForm'
import { RecoveryCodeValidation } from './partials/RecoveryCodeValidation'

export const RecoveryPage = () => {
  const [account, setAccount] = useState(false);

  return (
    <AuthSplitLayout
      title={account ? 'Nueva contraseña' : 'Recuperar acceso'}
      subtitle={account
        ? `Ingresa el código enviado a ${account.email} y elige una nueva contraseña`
        : 'Te enviaremos un código a tu correo para restablecer tu contraseña'
      }
      footerText="¿Recordaste tu contraseña?"
      footerLink="/login"
      footerLinkText="Ingresar"
    >
      {account
        ? <RecoveryCodeValidation account={account} />
        : <RecoveryForm setAccount={setAccount} />
      }
    </AuthSplitLayout>
  );
};
