import React, { useState } from 'react'
import { UpdatePasswordForm } from './UpdatePasswordForm';
import { CodePasswordValidation } from './CodePasswordValidation';
import { Card } from '../../../../elements/user/Card';

export const SecuritySection = () => {

  const [password, setPassword] = useState(false);

  return (
    <Card>
      { password ? 
        <CodePasswordValidation setPassword={setPassword} password={password}/> :
        <UpdatePasswordForm setPassword={setPassword} />
      }
    </Card>
  )
}
