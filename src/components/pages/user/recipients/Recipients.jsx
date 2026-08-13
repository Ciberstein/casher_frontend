import { useEffect, useMemo, useState } from 'react'
import { EnvelopeIcon, MagnifyingGlassIcon, PlusIcon, TagIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { Button } from '../../../elements/user/Button'
import { Input } from '../../../elements/user/Input'
import Modal from '../../../elements/user/Modal'
import api from '../../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../../utils/appError'
import { useDispatch } from 'react-redux'
import { setLoad } from '../../../../store/slices/loader.slice'

const initials = (r) => {
  const first = r.data?.first_name?.[0] ?? ''
  const last = r.data?.surname_1?.[0] ?? ''
  return (first + last).toUpperCase() || r.username?.[0]?.toUpperCase() || '?'
}

const AddRecipientModal = ({ open, setOpen, onSuccess }) => {
  const [value, setValue] = useState('')
  const dispatch = useDispatch()

  const handleClose = (v) => { setOpen(v); if (!v) setValue('') }

  const submit = async (e) => {
    e.preventDefault()
    if (!value.trim()) return
    dispatch(setLoad(false))
    try {
      await api.post('/api/v1/recipients', { user: value.trim() })
      handleClose(false)
      onSuccess()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Destinatario agregado', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }

  return (
    <Modal open={open} setOpen={handleClose} title="Agregar destinatario" className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Ingresa el correo electrónico o nombre de usuario de la persona que quieres agregar.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input
          icon={value.includes('@') ? <EnvelopeIcon className="size-5" /> : <TagIcon className="size-5" />}
          id="user" name="user"
          label="Correo o usuario"
          placeholder="usuario@dominio.com o @apodo"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <Button type="submit" disabled={!value.trim()}>Agregar</Button>
      </form>
    </Modal>
  )
}

export const Recipients = () => {
  const [recipients, setRecipients] = useState([])
  const [modal, setModal] = useState(false)
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()

  const fetch = async () => {
    try {
      const r = await api.get('/api/v1/recipients')
      setRecipients(r.data)
    } catch (err) { appError(err) }
  }

  useEffect(() => { fetch() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return recipients.filter(r => {
      const rec = r.recipient
      return !q
        || rec.username?.toLowerCase().includes(q)
        || rec.email?.toLowerCase().includes(q)
        || rec.data?.first_name?.toLowerCase().includes(q)
        || rec.data?.surname_1?.toLowerCase().includes(q)
    })
  }, [recipients, search])

  const remove = async (id, name) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar destinatario?',
      text: `${name} será eliminado de tu lista.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    })
    if (!isConfirmed) return
    dispatch(setLoad(false))
    try {
      await api.delete(`/api/v1/recipients/${id}`)
      setRecipients(prev => prev.filter(r => r.id !== id))
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Destinatario eliminado', showConfirmButton: false, timer: 3000 })
    } catch (err) { appError(err) }
    finally { dispatch(setLoad(true)) }
  }

  return (
    <div className="flex flex-col gap-6">
      <AddRecipientModal open={modal} setOpen={setModal} onSuccess={fetch} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-wide text-2xl font-bold tracking-tight text-ink">Destinatarios</h1>
          <p className="text-sm text-muted mt-1">
            Usuarios frecuentes para agilizar transferencias y solicitudes
          </p>
        </div>
        <Button onClick={() => setModal(true)} className="flex items-center gap-2">
          <PlusIcon className="size-4" /> Agregar
        </Button>
      </div>

      {recipients.length > 0 && (
        <Input
          icon={<MagnifyingGlassIcon className="size-5" />}
          placeholder="Buscar por nombre, usuario o correo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="!bg-sunken !border-line !rounded-lg"
        />
      )}

      {recipients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-faint">
          <UserPlusIcon className="size-12 opacity-40" />
          <div className="text-center">
            <p className="text-sm font-medium">Sin destinatarios</p>
            <p className="text-xs mt-1">Agrega usuarios frecuentes para transferir más rápido</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-faint">
          <MagnifyingGlassIcon className="size-8 opacity-40" />
          <p className="text-sm">Sin resultados para "{search}"</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-sm">
          {filtered.map((r, i) => {
            const rec = r.recipient
            const name = `${rec.data?.first_name ?? ''} ${rec.data?.surname_1 ?? ''}`.trim() || rec.username
            return (
              <div
                key={r.id}
                className={`flex items-center gap-4 px-4 py-3.5 ${i < filtered.length - 1 ? 'border-b border-line' : ''}`}
              >
                <div className="size-10 rounded-full shrink-0 overflow-hidden bg-sello-soft flex items-center justify-center">
                  {rec.picture
                    ? <img src={rec.picture} alt={rec.username} className="size-full object-cover" />
                    : <span className="text-sm font-bold text-sello-ink">{initials(rec)}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{name}</p>
                  <p className="text-xs text-faint truncate">@{rec.username} · {rec.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(r.id, name)}
                  className="shrink-0 p-2 rounded-lg text-faint hover:text-salida hover:bg-salida-soft transition-colors"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
