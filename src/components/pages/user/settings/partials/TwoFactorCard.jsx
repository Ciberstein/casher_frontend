import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { ShieldCheckIcon, KeyIcon, LockClosedIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import Swal from 'sweetalert2'
import api from '../../../../../api/axios'
import appError from '../../../../../utils/appError'
import { setLoad } from '../../../../../store/slices/loader.slice'
import { accountThunk } from '../../../../../store/slices/account.slice'
import { Input } from '../../../../elements/user/Input'
import { Button } from '../../../../elements/user/Button'
import { LoadingImage } from '../../../../elements/user/LoadingImage'
import Modal from '../../../../elements/user/Modal'

const toast = (icon, text) =>
  Swal.fire({ toast: true, position: 'bottom-right', icon, text, showConfirmButton: false, timer: 5000, timerProgressBar: true })

const useApi = () => {
  const dispatch = useDispatch()
  return async (request, onOk) => {
    dispatch(setLoad(false))
    await request()
      .then(onOk)
      .catch((err) => {
        appError(err)
        toast('error', err.response?.data?.message)
      })
      .finally(() => dispatch(setLoad(true)))
  }
}

const Header = ({ enabled }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-base font-semibold text-ink">Verificación en dos pasos</h2>
      <p className="text-sm text-muted mt-0.5">
        Pide un código de tu app autenticadora además de la contraseña al ingresar
      </p>
    </div>
    <span
      className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border
        ${enabled ? 'bg-entrada-soft text-entrada border-entrada/30' : 'bg-sunken text-muted border-line'}`}
    >
      <ShieldCheckIcon className="size-3.5" />
      {enabled ? 'Activa' : 'Inactiva'}
    </span>
  </div>
)

// Muestra los códigos de respaldo una sola vez
const BackupCodes = ({ codes, onDone }) => {
  const text = codes.join('\n')

  const copy = () => navigator.clipboard?.writeText(text).then(() => toast('success', 'Códigos copiados'))

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-sello/35 bg-sello-soft px-4 py-3 text-sm text-sello-ink">
        Guarda estos códigos de respaldo en un lugar seguro. Cada uno sirve una sola vez si pierdes acceso a tu app
        y <strong>no se volverán a mostrar</strong>.
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {codes.map((c) => (
          <li key={c} className="figure text-sm text-ink bg-sunken border border-line rounded-lg px-3 py-2 text-center">
            {c}
          </li>
        ))}
      </ul>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button type="button" variant="outline" color="gray" onClick={copy}>
          <ClipboardDocumentIcon className="size-4" />
          Copiar
        </Button>
        <Button type="button" onClick={onDone}>Ya los guardé</Button>
      </div>
    </div>
  )
}

const SetupFlow = ({ setup, onCancel, onEnabled }) => {
  const run = useApi()
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' })

  const [copied, setCopied] = useState(false)

  const submit = ({ code }) =>
    run(() => api.post('/api/v1/auth/2fa/enable', { code }), (res) => onEnabled(res.data.backupCodes))

  const copySecret = () =>
    navigator.clipboard?.writeText(setup.secret).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* El QR necesita fondo blanco fijo para poder escanearse también en modo oscuro */}
        <LoadingImage
          src={setup.qr}
          alt="Código QR para la app autenticadora"
          className="size-44 rounded-lg border border-line bg-white shrink-0"
        />

        <ol className="text-sm text-muted list-decimal pl-5 flex flex-col gap-2 sm:pt-1">
          <li>Abre Google Authenticator, Authy o similar.</li>
          <li>Escanea el código QR o ingresa la clave manualmente.</li>
          <li>Escribe aquí el código de 6 dígitos que muestra la app.</li>
        </ol>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="eyebrow">Clave manual</p>
        <div className="flex items-center gap-2 bg-sunken border border-line rounded-lg pl-3 pr-1.5 py-1.5">
          <p className="figure text-sm text-ink break-all select-all flex-1 min-w-0">{setup.secret}</p>
          <button
            type="button"
            onClick={copySecret}
            aria-label="Copiar clave"
            className="shrink-0 p-1.5 rounded text-faint hover:text-ink hover:bg-surface transition-colors"
          >
            {copied ? <CheckIcon className="size-4 text-entrada" /> : <ClipboardDocumentIcon className="size-4" />}
          </button>
        </div>
      </div>

      <Input
        icon={<KeyIcon className="size-5" />}
        id="code" name="code"
        maxLength="6"
        inputMode="numeric"
        autoComplete="one-time-code"
        label="Código de verificación"
        placeholder="000000"
        register={{
          function: register,
          errors: {
            function: errors,
            rules: { required: 'Requerido', pattern: { value: /^\d{6}$/, message: '6 dígitos' } },
          },
        }}
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button type="button" variant="outline" color="gray" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={!isValid || isSubmitting}>Activar</Button>
      </div>
    </form>
  )
}

const DisableFlow = ({ onCancel, onDisabled }) => {
  const run = useApi()
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' })

  const submit = (data) =>
    run(() => api.post('/api/v1/auth/2fa/disable', data), () => onDisabled())

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        Para desactivarla confirma tu contraseña y un código de tu app (o un código de respaldo).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          icon={<LockClosedIcon className="size-5" />}
          id="password" name="password" type="password"
          label="Contraseña" placeholder="••••••••"
          register={{ function: register, errors: { function: errors, rules: { required: 'Requerido' } } }}
        />
        <Input
          icon={<KeyIcon className="size-5" />}
          id="code" name="code" maxLength="11" autoComplete="one-time-code"
          label="Código" placeholder="000000"
          register={{ function: register, errors: { function: errors, rules: { required: 'Requerido' } } }}
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button type="button" variant="outline" color="gray" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" color="red" disabled={!isValid || isSubmitting}>Desactivar</Button>
      </div>
    </form>
  )
}

const TITLES = {
  setup: 'Activar verificación en dos pasos',
  codes: 'Códigos de respaldo',
  disable: 'Desactivar verificación',
}

export const TwoFactorCard = () => {
  const dispatch = useDispatch()
  const enabled = !!useSelector((state) => state.account.two_factor_enabled)
  const [mode, setMode] = useState('idle') // idle | setup | disable | codes
  const [setup, setSetup] = useState(null)
  const [codes, setCodes] = useState([])
  const [starting, setStarting] = useState(false)

  // El QR se pide sin el overlay global: así el modal abre directo, sin un parpadeo de pantalla
  const start = async () => {
    setStarting(true)
    await api.post('/api/v1/auth/2fa/setup')
      .then((res) => {
        setSetup(res.data)
        setMode('setup')
      })
      .catch((err) => {
        appError(err)
        toast('error', err.response?.data?.message)
      })
      .finally(() => setStarting(false))
  }

  const finish = () => {
    setMode('idle')
    setCodes([])
    dispatch(accountThunk())
  }

  // Los códigos de respaldo no se vuelven a mostrar: no se cierra el modal sin confirmar
  const close = () => {
    if (mode !== 'codes') setMode('idle')
  }

  return (
    <div className="bg-surface rounded-2xl border border-line overflow-hidden">
      <div className="p-6 flex flex-col gap-6">
        <Header enabled={enabled} />
        <div className="flex justify-end">
          {enabled
            ? <Button variant="outline" color="red" onClick={() => setMode('disable')}>Desactivar</Button>
            : <Button onClick={start} disabled={starting}>Activar verificación</Button>}
        </div>
      </div>

      <Modal open={mode !== 'idle'} setOpen={close} title={TITLES[mode]} header={mode !== 'codes'}>
        {mode === 'setup' && (
          <SetupFlow
            setup={setup}
            onCancel={close}
            onEnabled={(backupCodes) => {
              setCodes(backupCodes)
              setSetup(null)
              setMode('codes')
            }}
          />
        )}

        {mode === 'codes' && <BackupCodes codes={codes} onDone={finish} />}

        {mode === 'disable' && (
          <DisableFlow
            onCancel={close}
            onDisabled={() => {
              toast('success', 'Verificación en dos pasos desactivada')
              finish()
            }}
          />
        )}
      </Modal>
    </div>
  )
}
