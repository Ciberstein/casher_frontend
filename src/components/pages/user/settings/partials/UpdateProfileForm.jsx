import { useRef, useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CameraIcon, UserIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'
import Cropper from 'react-easy-crop'
import { Button } from '../../../../elements/user/Button'
import { Input } from '../../../../elements/user/Input'
import Modal from '../../../../elements/user/Modal'
import api from '../../../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../../../utils/appError'
import { accountThunk } from '../../../../../store/slices/account.slice'
import { setLoad } from '../../../../../store/slices/loader.slice'

const getCroppedBlob = (imageSrc, croppedAreaPixels) =>
  new Promise((resolve) => {
    const image = new Image()
    image.src = imageSrc
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(
        image,
        croppedAreaPixels.x, croppedAreaPixels.y,
        croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0,
        croppedAreaPixels.width, croppedAreaPixels.height,
      )
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    }
  })

const CropModal = ({ open, imageSrc, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const confirm = async () => {
    const blob = await getCroppedBlob(imageSrc, croppedAreaPixels)
    onConfirm(blob)
  }

  return (
    <Modal open={open} setOpen={onCancel} title="Recortar foto">
      <div className="flex flex-col gap-4">
        <div className="relative w-full h-72 rounded-xl overflow-hidden bg-slate-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="w-full accent-sello"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-line text-sm font-medium text-muted hover:bg-sunken transition-colors"
          >
            <XMarkIcon className="size-4" /> Cancelar
          </button>
          <button
            type="button"
            onClick={confirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-ink hover:bg-ink/88 text-reverse text-sm font-medium transition-colors"
          >
            <CheckIcon className="size-4" /> Confirmar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export const UpdateProfileForm = () => {
  const account = useSelector(state => state.account)
  const dispatch = useDispatch()

  const [username, setUsername] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [cropSrc, setCropSrc] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(false)
  const inputRef = useRef(null)

  const currentPicture = account.picture
  const currentUsername = account.username
  const initials = [account.data?.first_name, account.data?.surname_1]
    .filter(Boolean).map(s => s[0]).join('').toUpperCase() || '??'

  useEffect(() => {
    if (currentUsername) setUsername(currentUsername)
  }, [currentUsername])

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCropSrc(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleCropConfirm = (blob) => {
    setAvatarFile(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
    setAvatarPreview(URL.createObjectURL(blob))
    setCropSrc(null)
  }

  const hasChanges = avatarFile || pendingDelete || username.trim() !== (currentUsername ?? '')

  const markDeleteAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setPendingDelete(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!hasChanges) return
    dispatch(setLoad(false))
    try {
      const formData = new FormData()
      if (avatarFile) formData.append('avatar', avatarFile)
      if (pendingDelete) formData.append('deleteAvatar', 'true')
      if (username.trim() !== currentUsername)
        formData.append('username', username.trim())
      await api.patch('/api/v1/auth/update/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      dispatch(accountThunk())
      setAvatarFile(null)
      setAvatarPreview(null)
      setPendingDelete(false)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Perfil actualizado', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally {
      dispatch(setLoad(true))
    }
  }

  return (
    <>
      <CropModal
        open={!!cropSrc}
        imageSrc={cropSrc}
        onConfirm={handleCropConfirm}
        onCancel={() => setCropSrc(null)}
      />

      <form onSubmit={submit} className="flex flex-col gap-6">
        <div>
          <h2 className="text-base font-semibold text-ink">Perfil</h2>
          <p className="text-sm text-muted mt-0.5">Actualiza tu foto de perfil y nombre de usuario</p>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div
              onClick={() => inputRef.current?.click()}
              className="group size-20 rounded-full overflow-hidden cursor-pointer ring-2 ring-line hover:ring-sello transition-all relative"
            >
              {!pendingDelete && (avatarPreview || currentPicture) ? (
                <img src={avatarPreview ?? currentPicture} alt="Avatar" className="size-full object-cover" />
              ) : (
                <div className="size-full bg-sello-soft flex items-center justify-center">
                  <span className="text-xl font-bold text-sello-ink">{initials}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <CameraIcon className="size-5 text-white" />
              </div>
            </div>
            {!pendingDelete && (currentPicture || avatarPreview) && (
              <button
                type="button"
                onClick={markDeleteAvatar}
                className="absolute -top-1 -right-1 size-6 rounded-full bg-salida hover:opacity-90 flex items-center justify-center shadow-md transition-colors"
              >
                <TrashIcon className="size-3 text-white" />
              </button>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-ink">
              {!pendingDelete && (avatarPreview || currentPicture) ? 'Foto personalizada' : 'Sin foto de perfil'}
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-sello-ink hover:underline text-left"
            >
              Cambiar foto
            </button>
          </div>
        </div>

        <Input
          icon={<UserIcon className="size-5" />}
          id="username"
          name="username"
          label="Nombre de usuario"
          placeholder={currentUsername}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <div className="flex justify-end">
          <Button type="submit" color="green" disabled={!hasChanges}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </>
  )
}
