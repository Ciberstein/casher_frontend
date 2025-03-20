import React, { useState } from 'react'
import { PreAuthLayout } from '../../../layouts/PreAuthLayout'
import { LoginForm } from './partials/LoginForm'
import { CodeValidation } from '../register/partials/CodeValidation';

export const LoginPage = () => {

  const [account, setAccount] = useState(false);

  return (
    <PreAuthLayout>
      { account ? 
        <CodeValidation account={account} /> : 
        <LoginForm setAccount={setAccount} />
      }
    </PreAuthLayout>
  )
}
