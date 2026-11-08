import React from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline'
import Swal from 'sweetalert2'
import api from '../../../../../api/axios'
import appError from '../../../../../utils/appError'
import { setLoad } from '../../../../../store/slices/loader.slice'
import { Input } from '../../../../elements/user/Input'
import { Button } from '../../../../elements/user/Button'

export const TwoFactorForm = ({ challenge, onBack }) => {
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' })

  const submit = async ({ code }) => {
    dispatch(setLoad(false))
    await api.post('/api/v1/auth/login/2fa', { challenge, code })
      .then(() => location.reload())
      .catch((err) => {
        appError(err)
        Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000, timerProgressBar: true })
      })
      .finally(() => dispatch(setLoad(true)))
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5 text-ink">
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="size-14 rounded-2xl bg-sello-soft flex items-center justify-center">
          <ShieldCheckIcon className="size-7 text-sello-ink" />
        </div>
        <p className="text-sm text-muted text-center">
          Abre tu app autenticadora e ingresa el código de 6 dígitos. También puedes usar un código de respaldo.
        </p>
      </div>

      <Input
        icon={<KeyIcon className="size-5" />}
        id="code" name="code"
        maxLength="11"
        autoComplete="one-time-code"
        label="Código de verificación"
        placeholder="000000"
        register={{
          function: register,
          errors: { function: errors, rules: { required: 'Requerido' } },
        }}
      />

      <Button type="submit" size="lg" className="w-full" disabled={!isValid || isSubmitting}>
        Verificar
      </Button>

      <button type="button" onClick={onBack} className="text-sm text-muted hover:text-ink transition-colors">
        Volver a ingresar
      </button>
    </form>
  )
}
