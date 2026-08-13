import { useState } from 'react'
import { CodeEmailValidation } from './CodeEmailValidation'
import { UpdateEmailForm } from './UpdateEmailForm'
import { UpdatePersonalDataForm } from './UpdatePersonalDataForm'
import { UpdateProfileForm } from './UpdateProfileForm'

export const GeneralSection = () => {
  const [email, setEmail] = useState(false)

  return (
    <div className="flex flex-col bg-surface rounded-2xl border border-line divide-y divide-line overflow-hidden">
      <div className="p-6">
        <UpdateProfileForm />
      </div>
      <div className="p-6">
        <UpdatePersonalDataForm />
      </div>
      <div className="p-6">
        {email
          ? <CodeEmailValidation setEmail={setEmail} email={email} />
          : <UpdateEmailForm setEmail={setEmail} />
        }
      </div>
    </div>
  )
}
