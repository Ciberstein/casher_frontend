import { useState } from 'react'
import { UpdatePasswordForm } from './UpdatePasswordForm'
import { CodePasswordValidation } from './CodePasswordValidation'

export const SecuritySection = () => {
  const [password, setPassword] = useState(false)

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-6">
        {password
          ? <CodePasswordValidation setPassword={setPassword} password={password} />
          : <UpdatePasswordForm setPassword={setPassword} />
        }
      </div>
    </div>
  )
}
