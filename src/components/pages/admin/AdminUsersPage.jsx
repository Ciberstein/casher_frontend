import { useEffect, useState, useRef } from 'react'
import { UsersIcon, MagnifyingGlassIcon, PencilSquareIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useForm, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import Modal from '../../elements/user/Modal'
import { Button } from '../../elements/user/Button'
import { Input } from '../../elements/user/Input'
import { setLoad } from '../../../store/slices/loader.slice'
import api from '../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../utils/appError'
import { EmptyState, PageHeader, fmtDate } from './adminShared'

const STATUS_OPTIONS = ['active', 'pending', 'disabled']
const STATUS_LABEL = { active: 'Activo', pending: 'Pendiente', disabled: 'Desactivado' }
const STATUS_COLOR = {
  active:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending:  'bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400',
  disabled: 'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400',
}
const STATUS_BORDER = {
  active:   'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20',
  pending:  'border-amber-400   bg-amber-50   dark:border-amber-600   dark:bg-amber-900/20',
  disabled: 'border-red-400     bg-red-50     dark:border-red-600     dark:bg-red-900/20',
}
const ROLE_COLOR = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  user:  'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-400',
}

const UserAvatar = ({ user, size = 'md' }) => {
  const [imgFailed, setImgFailed] = useState(false)
  const cls = size === 'lg' ? 'size-14 text-base' : 'size-10 text-xs'
  const initials = `${user.data?.first_name?.[0] ?? ''}${user.data?.surname_1?.[0] ?? ''}`.toUpperCase() || user.username?.slice(0, 2).toUpperCase()

  if (user.picture && !imgFailed) {
    return (
      <img src={user.picture} onError={() => setImgFailed(true)} alt=""
        className={`${cls} rounded-full object-cover shrink-0 ring-2 ring-slate-200 dark:ring-neutral-700`} />
    )
  }
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-slate-400 to-slate-600 dark:from-neutral-600 dark:to-neutral-400 flex items-center justify-center shrink-0`}>
      <span className="font-bold text-white">{initials}</span>
    </div>
  )
}

const EditUserModal = ({ open, setOpen, user, onSuccess }) => {
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
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700">
            <div className="relative group shrink-0">
              {showPicture ? (
                <img src={showPicture} alt="" className="size-14 rounded-full object-cover ring-2 ring-slate-200 dark:ring-neutral-700" />
              ) : (
                <div className="size-14 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 dark:from-neutral-600 dark:to-neutral-400 flex items-center justify-center">
                  <span className="font-bold text-white text-base">{initials}</span>
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <CameraIcon className="size-5 text-white" />
              </button>
              {showPicture && (
                <button type="button" onClick={handleDeletePicture}
                  className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                  <XMarkIcon className="size-3" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white">{user.data?.first_name} {user.data?.surname_1}</p>
              <p className="text-sm text-slate-400 truncate">{user.email}</p>
              <p className="text-xs text-slate-400 mt-0.5">Miembro desde {fmtDate(user.createdAt)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(submit)} className="grid gap-4">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">Datos personales</p>
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

            <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">Cuenta</p>
            <div className="grid grid-cols-2 gap-3">
              <Input id="username" name="username" label="Usuario"
                register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', minLength: { value: 3, message: 'Mín. 3' }, pattern: { value: /^[a-z0-9_]+$/, message: 'Solo letras, números y _' } } } }} />
              <Input id="interest_rate" name="interest_rate" label="Tasa diaria (%)" type="number" min="0" max="100" step="0.01"
                register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', min: { value: 0, message: 'Mín. 0' }, max: { value: 100, message: 'Máx. 100' } } } }} />
              <div className="col-span-2">
                <Input id="email" name="email" label="Correo electrónico" type="email"
                  register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' } } } }} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Estado</label>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map(s => {
                  const field = register('status', { required: true })
                  const isSelected = selectedStatus === s
                  return (
                    <label key={s}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all
                        ${isSelected ? STATUS_BORDER[s] : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'}`}>
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

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [editModal, setEditModal] = useState(false)

  const fetchUsers = async () => {
    try {
      const r = await api.get('/api/v1/auth/admin/users')
      setUsers(r.data)
    } catch (err) { appError(err) }
  }

  useEffect(() => { fetchUsers() }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return (
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.data?.first_name?.toLowerCase().includes(q) ||
      u.data?.surname_1?.toLowerCase().includes(q)
    )
  })

  const openEdit = (user) => { setEditing(user); setEditModal(true) }

  return (
    <div className="flex flex-col gap-6">
      <EditUserModal open={editModal} setOpen={setEditModal} user={editing} onSuccess={fetchUsers} />

      <PageHeader
        title="Usuarios"
        subtitle={`${users.length} usuario${users.length !== 1 ? 's' : ''} registrado${users.length !== 1 ? 's' : ''}`}
      />

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, usuario o correo..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-colors"
        />
      </div>

      {filtered.length === 0
        ? <EmptyState icon={<UsersIcon className="size-16" />} text={search ? 'Sin resultados para esta búsqueda' : 'No hay usuarios registrados'} />
        : (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800 overflow-hidden shadow-sm">
            {filtered.map((user, i) => (
              <div key={user.id}
                className={`flex items-center gap-4 px-5 py-4 ${i < filtered.length - 1 ? 'border-b border-slate-50 dark:border-neutral-800' : ''}`}>
                <UserAvatar user={user} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {user.data?.first_name} {user.data?.surname_1}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLOR[user.role]}`}>
                      {user.role}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[user.status]}`}>
                      {STATUS_LABEL[user.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">@{user.username} · {user.email}</p>
                </div>

                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30">
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{user.interest_rate}%</span>
                    <span className="text-xs text-orange-400 dark:text-orange-500">diario</span>
                  </div>
                  <span className="text-xs text-slate-400">{fmtDate(user.createdAt)}</span>
                </div>

                <button onClick={() => openEdit(user)}
                  className="size-9 rounded-xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-500 hover:bg-red-500 hover:text-white transition-colors shrink-0">
                  <PencilSquareIcon className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
