import { useState } from 'react'
import { UpdatePasswordForm } from './UpdatePasswordForm'
import { CodePasswordValidation } from './CodePasswordValidation'

export const SecuritySection = () => {
  const [password, setPassword] = useState(false)

  return (
    <div className="bg-surface rounded-2xl border border-line overflow-hidden">
      <div className="p-6">
        {password
          ? <CodePasswordValidation setPassword={setPassword} password={password} />
          : <UpdatePasswordForm setPassword={setPassword} />
        }
      </div>
    </div>
  )
}
