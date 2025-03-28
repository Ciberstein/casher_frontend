import React, { useState } from 'react'
import { CodeEmailValidation } from './CodeEmailValidation'
import { UpdateEmailForm } from './UpdateEmailForm';
import { UpdatePersonalDataForm } from './UpdatePersonalDataForm';
import { Card } from '../../../../elements/user/Card';

export const GeneralSection = () => {

  const [email, setEmail] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <UpdatePersonalDataForm />
      </Card>
      <Card>
        { email ? 
          <CodeEmailValidation setEmail={setEmail} email={email}/> :
          <UpdateEmailForm setEmail={setEmail} />
        }
      </Card>   
    </div>
  )
}
