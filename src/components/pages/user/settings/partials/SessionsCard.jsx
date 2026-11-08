import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ComputerDesktopIcon, DevicePhoneMobileIcon, DeviceTabletIcon } from '@heroicons/react/24/outline'
import Swal from 'sweetalert2'
import api from '../../../../../api/axios'
import appError from '../../../../../utils/appError'
import { Button } from '../../../../elements/user/Button'

const ICONS = { desktop: ComputerDesktopIcon, mobile: DevicePhoneMobileIcon, tablet: DeviceTabletIcon }

const toast = (icon, text) =>
  Swal.fire({ toast: true, position: 'bottom-right', icon, text, showConfirmButton: false, timer: 4000, timerProgressBar: true })

const confirm = (title, text, confirmButtonText) =>
  Swal.fire({ icon: 'warning', title, text, showCancelButton: true, confirmButtonText, cancelButtonText: 'Cancelar', reverseButtons: true })
    .then((r) => r.isConfirmed)

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

// "hace 5 minutos", "ayer"...
const ago = (date) => {
  const diff = (new Date(date).getTime() - Date.now()) / 1000
  const steps = [['day', 86400], ['hour', 3600], ['minute', 60]]
  for (const [unit, secs] of steps) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit)
  }
  return 'ahora mismo'
}

const fmtDate = (date) => new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

// "Bogotá, Colombia (181.x.x.x)"; si no se pudo ubicar, solo la IP
const place = ({ location, ip }) =>
  location ? `${location}${ip ? ` (${ip})` : ''}` : (ip ?? 'Ubicación desconocida')

// Carga una lista con un loader local (sin el overlay global) y la deja recargable
const useList = (url) => {
  const [items, setItems] = useState(null)

  const load = useCallback(
    () => api.get(url).then((res) => setItems(res.data)).catch((err) => { appError(err); setItems([]) }),
    [url]
  )

  useEffect(() => { load() }, [load])

  return [items, load]
}

const DeviceRow = ({ item, detail, action }) => {
  const Icon = ICONS[item.deviceType] ?? ComputerDesktopIcon

  return (
    <li className="flex items-center gap-4 py-3">
      <span className="size-10 rounded-lg bg-sunken border border-line flex items-center justify-center shrink-0">
        <Icon className="size-5 text-muted" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-ink">{item.browser} en {item.os}</p>
          {item.current && (
            <span className="text-[0.625rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border bg-entrada-soft text-entrada border-entrada/30">
              Este dispositivo
            </span>
          )}
        </div>
        <p className="text-xs text-faint truncate">{detail}</p>
      </div>
      {action}
    </li>
  )
}

const CardShell = ({ title, subtitle, actions, children }) => (
  <div className="bg-surface rounded-2xl border border-line overflow-hidden">
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <p className="text-sm text-muted mt-0.5">{subtitle}</p>
        </div>
        {actions}
      </div>
      {children}
    </div>
  </div>
)

export const SessionsCard = () => {
  const [sessions, load] = useList('/api/v1/auth/sessions')

  const closeOne = async (s) => {
    const ok = await confirm(
      s.current ? '¿Cerrar esta sesión?' : '¿Cerrar la sesión en ese dispositivo?',
      s.current ? 'Tendrás que volver a ingresar.' : `${s.browser} en ${s.os} dejará de tener acceso.`,
      'Cerrar sesión'
    )
    if (!ok) return

    await api.delete(`/api/v1/auth/sessions/${s.id}`)
      .then((res) => (res.data.self ? location.reload() : (toast('success', 'Sesión cerrada'), load())))
      .catch((err) => { appError(err); toast('error', err.response?.data?.message) })
  }

  const closeOthers = async () => {
    const ok = await confirm('¿Cerrar las demás sesiones?', 'Se cerrarán todas menos la de este dispositivo.', 'Cerrar todas')
    if (!ok) return

    await api.delete('/api/v1/auth/sessions')
      .then((res) => { toast('success', `${res.data.closed} sesión(es) cerrada(s)`); load() })
      .catch((err) => { appError(err); toast('error', err.response?.data?.message) })
  }

  return (
    <CardShell
      title="Sesiones activas"
      subtitle="Dispositivos donde tu cuenta tiene la sesión iniciada"
      actions={sessions?.length > 1 && (
        <Button size="sm" variant="outline" color="red" onClick={closeOthers}>Cerrar las demás</Button>
      )}
    >
      {sessions === null && <div className="h-16 rounded-lg bg-sunken animate-pulse" />}
      {sessions?.length === 0 && <p className="text-sm text-muted">No hay sesiones para mostrar.</p>}
      {sessions?.length > 0 && (
        <ul className="divide-y divide-line">
          {sessions.map((s) => (
            <DeviceRow
              key={s.id}
              item={s}
              detail={`${place(s)} · ${s.current ? 'Activa ahora' : `Activa ${ago(s.lastSeenAt)}`}`}
              action={
                <Button size="sm" variant="outline" color="gray" onClick={() => closeOne(s)}>
                  Cerrar
                </Button>
              }
            />
          ))}
        </ul>
      )}
    </CardShell>
  )
}

export const TrustedDevicesCard = () => {
  const enabled = !!useSelector((state) => state.account.two_factor_enabled)
  const [devices, load] = useList('/api/v1/auth/trusted-devices')

  const remove = async (d) => {
    const ok = await confirm('¿Quitar este dispositivo?', `En ${d.browser} (${d.os}) se volverá a pedir el código de verificación.`, 'Quitar')
    if (!ok) return

    await api.delete(`/api/v1/auth/trusted-devices/${d.id}`)
      .then(() => { toast('success', 'Dispositivo retirado'); load() })
      .catch((err) => { appError(err); toast('error', err.response?.data?.message) })
  }

  const trustThis = () =>
    api.post('/api/v1/auth/trusted-devices')
      .then(() => { toast('success', 'Este dispositivo ahora es de confianza'); load() })
      .catch((err) => { appError(err); toast('error', err.response?.data?.message) })

  const hasCurrent = devices?.some((d) => d.current)

  return (
    <CardShell
      title="Dispositivos de confianza"
      subtitle="En estos dispositivos no se pide el código de verificación en dos pasos"
      actions={enabled && devices && !hasCurrent && (
        <Button size="sm" variant="outline" color="gray" onClick={trustThis}>Confiar en este dispositivo</Button>
      )}
    >
      {devices === null && <div className="h-16 rounded-lg bg-sunken animate-pulse" />}
      {devices?.length === 0 && (
        <p className="text-sm text-muted">
          {enabled
            ? 'Todavía no hay dispositivos de confianza.'
            : 'Activa la verificación en dos pasos para poder marcar dispositivos como de confianza.'}
        </p>
      )}
      {devices?.length > 0 && (
        <ul className="divide-y divide-line">
          {devices.map((d) => (
            <DeviceRow
              key={d.id}
              item={d}
              detail={`${place(d)} · Usado ${ago(d.lastUsedAt)} · Vence ${fmtDate(d.expiresAt)}`}
              action={
                <Button size="sm" variant="outline" color="red" onClick={() => remove(d)}>
                  Quitar
                </Button>
              }
            />
          ))}
        </ul>
      )}
    </CardShell>
  )
}
