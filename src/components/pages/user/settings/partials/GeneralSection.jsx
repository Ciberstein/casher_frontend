import React, { useState } from 'react'
import { CodeEmailValidation } from './CodeEmailValidation'
import { UpdateEmailForm } from './UpdateEmailForm';
import { UpdatePersonalDataForm } from './UpdatePersonalDataForm';
import { UpdateProfileForm } from './UpdateProfileForm';
import { Card } from '../../../../elements/user/Card';

export const GeneralSection = () => {

  const [email, setEmail] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <UpdateProfileForm />
      </Card>
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
