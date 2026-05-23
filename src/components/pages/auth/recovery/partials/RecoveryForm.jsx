import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '../../../../elements/user/Input'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import isEmailValid from '../../../../../utils/isEmailValid'
import { Button } from '../../../../elements/user/Button'
import { setLoad } from '../../../../../store/slices/loader.slice'
import { useDispatch } from 'react-redux'
import api from '../../../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../../../utils/appError'
import { Turnstile } from '@marsidev/react-turnstile'

export const RecoveryForm = ({ setAccount }) => {
  const [captchaToken, setCaptchaToken] = useState(null)
  const turnstileRef = useRef(null)
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' })
  const dispatch = useDispatch()

  const submit = async (data) => {
    dispatch(setLoad(false))
    await api.post('/api/v1/auth/recovery', { ...data, captchaToken })
      .then(res => {
        setAccount(res.data.account)
        Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: res.data.message, showConfirmButton: false, timer: 5000, timerProgressBar: true })
      })
      .catch((err) => {
        appError(err)
        Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response.data.message, showConfirmButton: false, timer: 5000, timerProgressBar: true })
        turnstileRef.current?.reset()
        setCaptchaToken(null)
      })
      .finally(() => dispatch(setLoad(true)))
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
      <Input
        icon={<EnvelopeIcon className="size-5" />}
        id="email" name="email" type="email"
        label="Correo electrónico" placeholder="usuario@dominio.com"
        register={{
          function: register,
          errors: {
            function: errors,
            rules: { required: 'Requerido', validate: { isEmailValid: (v) => isEmailValid(v) || 'Correo inválido' } },
          },
        }}
      />

      <div className="flex justify-center">
        <Turnstile
          ref={turnstileRef}
          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
          onSuccess={setCaptchaToken}
          onExpire={() => setCaptchaToken(null)}
          onError={() => setCaptchaToken(null)}
          options={{ theme: 'auto', language: 'es' }}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={!isValid || !captchaToken || isSubmitting}>
        Enviar código
      </Button>
    </form>
  )
}
