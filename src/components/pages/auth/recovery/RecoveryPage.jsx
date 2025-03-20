import React, { useState } from 'react'
import { PreAuthLayout } from '../../../layouts/PreAuthLayout'
import { RecoveryForm } from './partials/RecoveryForm'
import { RecoveryCodeValidation } from './partials/RecoveryCodeValidation';

export const RecoveryPage = () => {

  const [account, setAccount] = useState(false);

  return (
    <PreAuthLayout>
      { account ?
        <RecoveryCodeValidation account={account} /> :
        <RecoveryForm setAccount={setAccount} />
      }
    </PreAuthLayout>
  )
}
