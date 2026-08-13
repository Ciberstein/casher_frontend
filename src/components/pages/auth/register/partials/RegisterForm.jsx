import React, { useState, useRef } from 'react'
import { Input } from '../../../../elements/user/Input'
import { CalendarIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import isEmailValid from '../../../../../utils/isEmailValid'
import { Button } from '../../../../elements/user/Button'
import api from '../../../../../api/axios'
import appError from '../../../../../utils/appError'
import { useDispatch } from 'react-redux'
import { setLoad } from '../../../../../store/slices/loader.slice'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import { Turnstile } from '@marsidev/react-turnstile'

export const RegisterForm = ({ setAccount, firebase }) => {
  const [hide1, setHide1] = useState(true)
  const [hide2, setHide2] = useState(true)
  const [captchaToken, setCaptchaToken] = useState(null)
  const turnstileRef = useRef(null)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' })

  const submit = async (data) => {
    dispatch(setLoad(false))

    let formData = { ...data, captchaToken }
    if (firebase) {
      formData.email = firebase.email
      formData.email_verified = firebase.email_verified
      formData.picture = firebase.picture
    }

    await api.post('/api/v1/auth/register', formData)
      .then((res) => {
        if (res.status === 200) setAccount(res.data.account)
        if (res.status === 201)
          Swal.fire({ icon: 'success', title: '¡Listo!', text: res.data.message, showConfirmButton: false, timer: 3000, timerProgressBar: true })
            .then(() => navigate('/'))
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
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4 text-ink">
      <div className="grid grid-cols-2 gap-4">
        <Input
          icon={<UserIcon className="size-5" />}
          id="first_name" name="first_name"
          label="Primer nombre" placeholder="Ej. Juan"
          defaultValue={firebase ? firebase.name.split(' ')[0] : ''}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: { required: 'Requerido', minLength: { value: 2, message: 'Mín. 2 caracteres' }, maxLength: { value: 20, message: 'Máx. 20 caracteres' } },
            },
          }}
        />
        <Input
          icon={<UserIcon className="size-5" />}
          id="middle_name" name="middle_name"
          label="Segundo nombre" placeholder="Ej. David"
          register={{
            function: register,
            errors: {
              function: errors,
              rules: { required: false, minLength: { value: 2, message: 'Mín. 2 caracteres' }, maxLength: { value: 20, message: 'Máx. 20 caracteres' } },
            },
          }}
        />
        <Input
          icon={<UserIcon className="size-5" />}
          id="surname_1" name="surname_1"
          label="Primer apellido" placeholder="Ej. Pérez"
          defaultValue={firebase ? firebase.name.split(' ')[1] : ''}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: { required: 'Requerido', minLength: { value: 2, message: 'Mín. 2 caracteres' }, maxLength: { value: 20, message: 'Máx. 20 caracteres' } },
            },
          }}
        />
        <Input
          icon={<UserIcon className="size-5" />}
          id="surname_2" name="surname_2"
          label="Segundo apellido" placeholder="Ej. Torres"
          register={{
            function: register,
            errors: {
              function: errors,
              rules: { required: false, minLength: { value: 2, message: 'Mín. 2 caracteres' }, maxLength: { value: 20, message: 'Máx. 20 caracteres' } },
            },
          }}
        />
      </div>

      <Input
        icon={<CalendarIcon className="size-5" />}
        id="birthday" name="birthday"
        label="Fecha de nacimiento" type="date"
        register={{
          function: register,
          errors: { function: errors, rules: { required: 'Requerido' } },
        }}
      />

      {firebase ? (
        <Input
          icon={<EnvelopeIcon className="size-5" />}
          id="email" name="email" type="email"
          label="Correo electrónico" placeholder="usuario@dominio.com"
          defaultValue={firebase.email} disabled
        />
      ) : (
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
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          icon={<LockClosedIcon className="size-5" />}
          id="password" name="password"
          type={hide1 ? 'password' : 'text'}
          label="Contraseña" placeholder="••••••••"
          register={{
            function: register,
            errors: { function: errors, rules: { required: 'Requerido', minLength: { value: 8, message: 'Mín. 8 caracteres' } } },
          }}
          element={
            <button type="button" onClick={() => setHide1(!hide1)}>
              {hide1 ? <EyeIcon className="size-5" /> : <EyeSlashIcon className="size-5" />}
            </button>
          }
        />
        <Input
          icon={<LockClosedIcon className="size-5" />}
          id="password_repeat" name="password_repeat"
          type={hide2 ? 'password' : 'text'}
          label="Repetir contraseña" placeholder="••••••••"
          register={{
            function: register,
            errors: { function: errors, rules: { required: 'Requerido', minLength: { value: 8, message: 'Mín. 8 caracteres' } } },
          }}
          element={
            <button type="button" onClick={() => setHide2(!hide2)}>
              {hide2 ? <EyeIcon className="size-5" /> : <EyeSlashIcon className="size-5" />}
            </button>
          }
        />
      </div>

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

      <Button type="submit" size="lg" color="green" className="w-full mt-1" disabled={!isValid || !captchaToken || isSubmitting}>
        Crear cuenta
      </Button>
    </form>
  );
};
