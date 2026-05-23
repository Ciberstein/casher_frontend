import { useState } from 'react'
import { CodeEmailValidation } from './CodeEmailValidation'
import { UpdateEmailForm } from './UpdateEmailForm'
import { UpdatePersonalDataForm } from './UpdatePersonalDataForm'
import { UpdateProfileForm } from './UpdateProfileForm'

export const GeneralSection = () => {
  const [email, setEmail] = useState(false)

  return (
    <div className="flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 divide-y divide-slate-100 dark:divide-neutral-800 overflow-hidden">
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
