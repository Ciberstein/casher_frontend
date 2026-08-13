import React, { useState, useRef } from 'react'
import { Input } from '../../../../elements/user/Input'
import { useForm } from 'react-hook-form'
import { EnvelopeIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import isEmailValid from '../../../../../utils/isEmailValid'
import { Button } from '../../../../elements/user/Button'
import { Link, useNavigate } from 'react-router-dom'
import { setLoad } from '../../../../../store/slices/loader.slice'
import { useDispatch } from 'react-redux'
import api from '../../../../../api/axios'
import appError from '../../../../../utils/appError'
import Swal from 'sweetalert2'
import { GoogleIcon } from '../../../../../assets/GoogleIcon'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../../../../../firebase/config'
import { Turnstile } from '@marsidev/react-turnstile'

export const LoginForm = ({ setAccount }) => {
  const [hide, setHide] = useState(true)
  const [captchaToken, setCaptchaToken] = useState(null)
  const turnstileRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' })

  const trigger = (res) => {
    if (res.status === 200) location.reload()
    else if (res.status === 201) navigate('/register', { state: { data: res.data } })
    else if (res.status === 202) setAccount(res.data.account)
  }

  const firebase = async (token) => {
    dispatch(setLoad(false))
    await api.post('/api/v1/auth/login/firebase', { token })
      .then((res) => trigger(res))
      .catch((err) => {
        appError(err)
        Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response.data.message, showConfirmButton: false, timer: 5000, timerProgressBar: true })
      })
      .finally(() => dispatch(setLoad(true)))
  }

  const google = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider)
      await firebase(await res.user.getIdToken())
    } catch (err) { appError(err) }
  }

  const submit = async (data) => {
    dispatch(setLoad(false))
    await api.post('/api/v1/auth/login', { ...data, captchaToken })
      .then((res) => trigger(res))
      .catch((err) => {
        appError(err)
        Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response.data.message, showConfirmButton: false, timer: 5000, timerProgressBar: true })
        turnstileRef.current?.reset()
        setCaptchaToken(null)
      })
      .finally(() => dispatch(setLoad(true)))
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5 text-ink">
      <Input
        icon={<EnvelopeIcon className="size-5" />}
        id="email" name="email" type="email"
        label="Correo electrónico" placeholder="usuario@dominio.com"
        register={{
          function: register,
          errors: {
            function: errors,
            rules: {
              required: 'Requerido',
              validate: { isEmailValid: (v) => isEmailValid(v) || 'Correo inválido' },
            },
          },
        }}
      />

      <Input
        icon={<LockClosedIcon className="size-5" />}
        id="password" name="password"
        type={hide ? 'password' : 'text'}
        label="Contraseña" placeholder="••••••••"
        register={{
          function: register,
          errors: {
            function: errors,
            rules: { required: 'Requerido', minLength: { value: 8 } },
          },
        }}
        helperLink={{ url: '/recovery', text: '¿Olvidaste tu contraseña?' }}
        element={
          <button type="button" onClick={() => setHide(!hide)}>
            {hide ? <EyeIcon className="size-5" /> : <EyeSlashIcon className="size-5" />}
          </button>
        }
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
        Ingresar
      </Button>

      <div className="flex items-center gap-3">
        <hr className="flex-1 border-line" />
        <span className="eyebrow">o continúa con</span>
        <hr className="flex-1 border-line" />
      </div>

      <button
        type="button"
        onClick={google}
        className="w-full flex items-center justify-center gap-3 border border-line rounded-lg py-3 px-4 text-sm font-medium text-muted hover:bg-sunken transition-colors"
      >
        <GoogleIcon />
        Google
      </button>
    </form>
  )
}
