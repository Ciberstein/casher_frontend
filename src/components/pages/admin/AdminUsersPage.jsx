import useCurrencyOptions from '../../../hooks/useCurrencyOptions'
import useCountryOptions from '../../../hooks/useCountryOptions'
import { LoadingImage } from '../../elements/user/LoadingImage'
import { useEffect, useState, useRef } from 'react'
import { UsersIcon, MagnifyingGlassIcon, PencilSquareIcon, CameraIcon, XMarkIcon, KeyIcon } from '@heroicons/react/24/outline'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { ComboSelect } from '../../elements/user/ComboSelect'
import { useDispatch } from 'react-redux'
import Modal from '../../elements/user/Modal'
import { Button } from '../../elements/user/Button'
import { Input } from '../../elements/user/Input'
import { setLoad } from '../../../store/slices/loader.slice'
import api from '../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../utils/appError'
import { EmptyState, PageHeader, Pagination, fmtDate } from './adminShared'

const PAGE_SIZE = 10

const STATUS_OPTIONS = ['active', 'pending', 'disabled']
const STATUS_LABEL = { active: 'Activo', pending: 'Pendiente', disabled: 'Desactivado' }
const STATUS_COLOR = {
  active:   'border-entrada/35 bg-entrada-soft text-entrada',
  pending:  'border-rule border-dashed text-espera',
  disabled: 'border-salida/35 bg-salida-soft text-salida',
}
const STATUS_BORDER = {
  active:   'border-sello bg-sello-soft',
  pending:  'border-rule border-dashed bg-sunken',
  disabled: 'border-salida/40 bg-salida-soft',
}
const ROLE_COLOR = {
  admin: 'border-salida/35 bg-salida-soft text-salida',
  user:  'bg-sunken text-muted bg-sunken text-muted',
}

const UserAvatar = ({ user, size = 'md' }) => {
  const [imgFailed, setImgFailed] = useState(false)
  const cls = size === 'lg' ? 'size-14 text-base' : 'size-10 text-xs'
  const initials = `${user.data?.first_name?.[0] ?? ''}${user.data?.surname_1?.[0] ?? ''}`.toUpperCase() || user.username?.slice(0, 2).toUpperCase()

  if (user.picture && !imgFailed) {
    return (
      <LoadingImage src={user.picture} onError={() => setImgFailed(true)}
        className={`${cls} rounded-full shrink-0 ring-2 ring-line`} />
    )
  }
  return (
    <div className={`${cls} rounded-full bg-ink ring-2 ring-line flex items-center justify-center shrink-0`}>
      <span className="font-bold text-reverse">{initials}</span>
    </div>
  )
}

const EditUserModal = ({ open, setOpen, user, onSuccess }) => {
  const CURRENCY_OPTIONS = useCurrencyOptions()
  const COUNTRY_OPTIONS = useCountryOptions()
  const { register, handleSubmit, reset, control, formState: { errors, isValid, isSubmitting, isDirty } } = useForm({ mode: 'onChange' })
  const dispatch = useDispatch()
  const fileInputRef = useRef(null)

  const [pictureFile, setPictureFile] = useState(null)
  const [picturePreview, setPicturePreview] = useState(null)
  const [deleteAvatar, setDeleteAvatar] = useState(false)

  const selectedStatus = useWatch({ control, name: 'status' })

  useEffect(() => {
    if (user) {
      reset({
        first_name:    user.data?.first_name ?? '',
        middle_name:   user.data?.middle_name ?? '',
        surname_1:     user.data?.surname_1 ?? '',
        surname_2:     user.data?.surname_2 ?? '',
        username:      user.username ?? '',
        email:         user.email ?? '',
        interest_rate: user.interest_rate ?? 1.5,
        currency:      user.currency ?? 'COP',
        country:       user.country ?? 'CO',
        status:        user.status ?? 'active',
      })
      setPictureFile(null)
      setPicturePreview(null)
      setDeleteAvatar(false)
    }
  }, [user])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPictureFile(file)
    setPicturePreview(URL.createObjectURL(file))
    setDeleteAvatar(false)
  }

  const handleDeletePicture = () => {
    setPictureFile(null)
    setPicturePreview(null)
    setDeleteAvatar(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const submit = async (data) => {
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/auth/admin/users/${user.id}`, {
        first_name:    data.first_name,
        middle_name:   data.middle_name || null,
        surname_1:     data.surname_1,
        surname_2:     data.surname_2 || null,
        username:      data.username,
        email:         data.email,
        interest_rate: Number(data.interest_rate),
        currency:      data.currency,
        country:       data.country,
        status:        data.status,
      })

      if (pictureFile || deleteAvatar) {
        const formData = new FormData()
        if (pictureFile) formData.append('avatar', pictureFile)
        else formData.append('deleteAvatar', 'true')
        await api.patch(`/api/v1/auth/admin/users/${user.id}/picture`, formData)
      }

      setOpen(false)
      onSuccess()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Usuario actualizado', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }

  const showPicture = picturePreview ?? (deleteAvatar ? null : user?.picture)
  const initials = user ? (`${user.data?.first_name?.[0] ?? ''}${user.data?.surname_1?.[0] ?? ''}`).toUpperCase() || user.username?.slice(0, 2).toUpperCase() : ''

  return (
    <Modal open={open} setOpen={setOpen} title="Editar usuario" className="grid gap-6">
      {user && (
        <>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-sunken border border-line">
            <div className="relative group shrink-0">
              {showPicture ? (
                <LoadingImage src={showPicture} className="size-14 rounded-full ring-2 ring-line" />
              ) : (
                <div className="size-14 rounded-full bg-ink ring-2 ring-line flex items-center justify-center">
                  <span className="font-bold text-reverse text-base">{initials}</span>
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <CameraIcon className="size-5 text-white" />
              </button>
              {showPicture && (
                <button type="button" onClick={handleDeletePicture}
                  className="absolute -top-1 -right-1 size-5 rounded-full bg-salida text-white flex items-center justify-center hover:opacity-90 transition-colors">
                  <XMarkIcon className="size-3" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-ink">{user.data?.first_name} {user.data?.surname_1}</p>
              <p className="text-sm text-faint truncate">{user.email}</p>
              <p className="text-xs text-faint mt-0.5">Miembro desde {fmtDate(user.createdAt)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(submit)} className="grid gap-4">
            <p className="text-xs font-semibold text-faint uppercase tracking-wider">Datos personales</p>
            <div className="grid grid-cols-2 gap-3">
              <Input id="first_name" name="first_name" label="Primer nombre"
                register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', minLength: { value: 2, message: 'Mín. 2' } } } }} />
              <Input id="middle_name" name="middle_name" label="Segundo nombre"
                register={{ function: register, errors: { function: errors, rules: {} } }} />
              <Input id="surname_1" name="surname_1" label="Primer apellido"
                register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', minLength: { value: 2, message: 'Mín. 2' } } } }} />
              <Input id="surname_2" name="surname_2" label="Segundo apellido"
                register={{ function: register, errors: { function: errors, rules: {} } }} />
            </div>

            <p className="text-xs font-semibold text-faint uppercase tracking-wider">Cuenta</p>
            <div className="grid grid-cols-2 gap-3">
              <Input id="username" name="username" label="Usuario"
                register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', minLength: { value: 3, message: 'Mín. 3' }, pattern: { value: /^[a-z0-9_]+$/, message: 'Solo letras, números y _' } } } }} />
              <Input id="interest_rate" name="interest_rate" label="Tasa diaria (%)" type="number" min="0" max="100" step="0.01"
                register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', min: { value: 0, message: 'Mín. 0' }, max: { value: 100, message: 'Máx. 100' } } } }} />
              <div className="col-span-2">
                <Input id="email" name="email" label="Correo electrónico" type="email"
                  register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' } } } }} />
              </div>
              <Controller name="country" control={control} rules={{ required: 'Requerido' }}
                render={({ field }) => (
                  <ComboSelect label="País" options={COUNTRY_OPTIONS} value={field.value}
                    onChange={field.onChange} searchable={false} error={errors.country} />
                )} />
              <Controller name="currency" control={control} rules={{ required: 'Requerido' }}
                render={({ field }) => (
                  <ComboSelect label="Moneda por defecto" options={CURRENCY_OPTIONS} value={field.value}
                    onChange={field.onChange} searchable={false} error={errors.currency} />
                )} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted">Estado</label>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map(s => {
                  const field = register('status', { required: true })
                  const isSelected = selectedStatus === s
                  return (
                    <label key={s}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all
                        ${isSelected ? STATUS_BORDER[s] : 'border-line hover:border-rule'}`}>
                      <input type="radio" value={s} {...field} className="sr-only" />
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[s]}`}>{STATUS_LABEL[s]}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <Button type="submit" disabled={!isValid || isSubmitting || (!isDirty && !pictureFile && !deleteAvatar)}>Guardar cambios</Button>
          </form>
        </>
      )}
    </Modal>
  )
}

const ChangePasswordModal = ({ open, setOpen, user }) => {
  const { register, handleSubmit, reset, getValues, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' })
  const dispatch = useDispatch()

  useEffect(() => { if (open) reset({ password: '', password_repeat: '' }) }, [open, user])

  const submit = async ({ password }) => {
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/auth/admin/users/${user.id}/password`, { password })
      setOpen(false)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Contraseña actualizada', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }

  return (
    <Modal open={open} setOpen={setOpen} title="Cambiar contraseña" className="grid gap-6">
      {user && (
        <>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-sunken border border-line">
            <UserAvatar user={user} />
            <div className="min-w-0">
              <p className="font-semibold text-ink truncate">{user.data?.first_name} {user.data?.surname_1}</p>
              <p className="text-sm text-faint truncate">@{user.username} · {user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(submit)} className="grid gap-4" autoComplete="off">
            <Input id="new_password" name="password" type="password" label="Nueva contraseña" autoComplete="new-password"
              register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } } } }} />
            <Input id="new_password_repeat" name="password_repeat" type="password" label="Repetir contraseña" autoComplete="new-password"
              register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', validate: v => v === getValues('password') || 'Las contraseñas no coinciden' } } }} />
            <p className="text-xs text-faint">
              La contraseña se reemplaza de inmediato. Si el usuario ya tiene una sesión abierta, esta no se cierra.
            </p>
            <Button type="submit" disabled={!isValid || isSubmitting}>Guardar contraseña</Button>
          </form>
        </>
      )}
    </Modal>
  )
}

export const AdminUsersPage = () => {
  const [paged, setPaged] = useState([])
  const [total, setTotal] = useState(0)          // coincidencias de la búsqueda actual
  const [overall, setOverall] = useState(null)   // usuarios registrados en total (sin filtro)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [editing, setEditing] = useState(null)
  const [editModal, setEditModal] = useState(false)
  const [pwUser, setPwUser] = useState(null)
  const requestId = useRef(0)

  // La búsqueda espera a que se deje de escribir antes de ir al servidor
  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search.trim()); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchUsers = async () => {
    const id = ++requestId.current
    try {
      const r = await api.get('/api/v1/auth/admin/users', { params: { page, limit: PAGE_SIZE, search: debounced || undefined } })
      if (id !== requestId.current) return // llegó una respuesta más nueva
      setPaged(r.data.data)
      setTotal(r.data.total)
      if (r.data.page !== page) setPage(r.data.page)
      if (!debounced) setOverall(r.data.total)
    } catch (err) { appError(err) }
  }

  useEffect(() => { fetchUsers() }, [page, debounced])

  const currentPage = page

  const openEdit = (user) => { setEditing(user); setEditModal(true) }

  return (
    <div className="flex flex-col gap-6">
      <EditUserModal open={editModal} setOpen={setEditModal} user={editing} onSuccess={fetchUsers} />
      <ChangePasswordModal open={!!pwUser} setOpen={() => setPwUser(null)} user={pwUser} />

      <PageHeader
        title="Usuarios"
        subtitle={overall == null ? ' ' : `${overall} usuario${overall !== 1 ? 's' : ''} registrado${overall !== 1 ? 's' : ''}`}
      />

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-faint pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, usuario o correo..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-0 focus:border-sello transition-colors"
        />
      </div>

      {total === 0
        ? <EmptyState icon={<UsersIcon className="size-16" />} text={debounced ?'Sin resultados para esta búsqueda' : 'No hay usuarios registrados'} />
        : (
          <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-sm">
            {paged.map((user, i) => (
              <div key={user.id}
                className={`flex items-center gap-4 px-5 py-4 ${i < paged.length - 1 ? 'border-b border-line' : ''}`}>
                <UserAvatar user={user} />

                {/* Misma estructura que la columna derecha: fila de etiquetas arriba, dato abajo, alto h-11 */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-11">
                  <div className="flex items-center gap-2 h-5 overflow-hidden">
                    <span className="text-sm leading-5 font-semibold text-ink truncate">
                      {user.data?.first_name} {user.data?.surname_1}
                    </span>
                    <span className={`inline-flex items-center h-5 shrink-0 text-xs leading-none font-semibold px-2 rounded-full ${ROLE_COLOR[user.role]}`}>
                      {user.role}
                    </span>
                    <span className={`inline-flex items-center h-5 shrink-0 text-xs leading-none font-semibold px-2 rounded-full ${STATUS_COLOR[user.status]}`}>
                      {STATUS_LABEL[user.status]}
                    </span>
                  </div>
                  <p className="text-xs leading-4 text-faint truncate">@{user.username} · {user.email}</p>
                </div>

                {/* Misma altura que los botones (size-11 = 2.75rem): etiqueta arriba, fecha abajo */}
                <div className="hidden sm:flex flex-col items-end justify-between h-11 shrink-0">
                  <div className="flex items-center gap-1.5 h-5 px-2.5 rounded-md bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30">
                    <span className="text-xs leading-none font-bold text-orange-600 dark:text-orange-400">{user.interest_rate}%</span>
                    <span className="text-xs leading-none text-orange-400 dark:text-orange-500">diario</span>
                  </div>
                  <span className="text-xs leading-4 text-faint">{fmtDate(user.createdAt)}</span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <button onClick={() => setPwUser(user)} title="Cambiar contraseña" aria-label="Cambiar contraseña"
                    className="size-11 rounded-xl bg-sunken flex items-center justify-center text-muted hover:bg-ink hover:text-reverse transition-colors">
                    <KeyIcon className="size-5" />
                  </button>
                  <button onClick={() => openEdit(user)} title="Editar usuario" aria-label="Editar usuario"
                    className="size-11 rounded-xl bg-sunken flex items-center justify-center text-muted hover:bg-salida hover:text-white transition-colors">
                    <PencilSquareIcon className="size-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }
      <Pagination page={currentPage} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  )
}
