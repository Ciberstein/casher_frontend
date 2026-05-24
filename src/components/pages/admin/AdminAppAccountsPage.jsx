import { useEffect, useState } from 'react'
import { BuildingLibraryIcon, IdentificationIcon } from '@heroicons/react/24/outline'
import { PlusIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/20/solid'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Modal from '../../elements/user/Modal'
import { Button } from '../../elements/user/Button'
import { Input } from '../../elements/user/Input'
import { ComboSelect } from '../../elements/user/ComboSelect'
import { setLoad } from '../../../store/slices/loader.slice'
import { banksThunk } from '../../../store/slices/banks.slice'
import { documentTypesThunk } from '../../../store/slices/documentTypes.slice'
import api from '../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../utils/appError'
import { EmptyState, PageHeader } from './adminShared'

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'savings', label: 'Ahorros' },
  { value: 'checking', label: 'Corriente' },
]
const ACCOUNT_TYPE_LABEL = { savings: 'Ahorros', checking: 'Corriente' }
const ACCOUNT_TYPE_COLOR = {
  savings:  'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  checking: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const AppBankAccountForm = ({ onSubmit, defaultValues, submitLabel }) => {
  const { register, handleSubmit, reset, control, trigger, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' })
  const dispatch = useDispatch()
  const banks = useSelector((state) => state.banks)
  const documentTypes = useSelector((state) => state.documentTypes)

  useEffect(() => {
    if (banks.length === 0) dispatch(banksThunk())
    if (documentTypes.length === 0) dispatch(documentTypesThunk())
  }, [])

  useEffect(() => {
    if (defaultValues) { reset(defaultValues); trigger() }
  }, [defaultValues])

  const bankOptions = banks.map(b => ({ value: b.name, label: b.name, icon: b.logo }))
  const docTypeOptions = documentTypes.map(dt => ({ value: String(dt.id), label: dt.abbreviation, subtitle: dt.name }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <Controller name="bank_name" control={control} rules={{ required: 'Requerido' }}
        render={({ field }) => (
          <ComboSelect label="Banco" options={bankOptions} value={field.value}
            onChange={field.onChange} placeholder="Selecciona un banco"
            error={errors.bank_name} icon={<BuildingLibraryIcon className="size-6" />} />
        )} />
      <Input icon={<BuildingLibraryIcon className="size-6" />} id="account_number" name="account_number"
        label="Cuenta" placeholder="Email, número de cuenta..."
        register={{ function: register, errors: { function: errors, rules: { required: 'Requerido' } } }} />
      <Input icon={<BuildingLibraryIcon className="size-6" />} id="owner_name" name="owner_name"
        label="Titular" placeholder="Nombre completo"
        register={{ function: register, errors: { function: errors, rules: { required: 'Requerido' } } }} />
      <Controller name="account_type" control={control} rules={{ required: 'Requerido' }}
        render={({ field }) => (
          <ComboSelect label="Tipo de cuenta" options={ACCOUNT_TYPE_OPTIONS} value={field.value}
            onChange={field.onChange} placeholder="Selecciona el tipo"
            error={errors.account_type} searchable={false} />
        )} />
      <div className="grid grid-cols-2 gap-3">
        <Controller name="documentTypeId" control={control} rules={{ required: 'Requerido' }}
          render={({ field }) => (
            <ComboSelect label="Tipo de documento" options={docTypeOptions} value={field.value}
              onChange={field.onChange} placeholder="Tipo"
              error={errors.documentTypeId} searchable={false}
              icon={<IdentificationIcon className="size-6" />} />
          )} />
        <Input icon={<IdentificationIcon className="size-6" />} id="document_number" name="document_number"
          label="Número de documento" placeholder="00000000"
          register={{ function: register, errors: { function: errors, rules: { required: 'Requerido' } } }} />
      </div>
      <Button type="submit" disabled={!isValid || isSubmitting}>{submitLabel}</Button>
    </form>
  )
}

const AddModal = ({ open, setOpen, onSuccess }) => {
  const dispatch = useDispatch()
  const submit = async (data) => {
    dispatch(setLoad(false))
    try {
      await api.post('/api/v1/app-bank-accounts', { ...data, documentTypeId: Number(data.documentTypeId) })
      setOpen(false); onSuccess()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Cuenta agregada', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }
  return (
    <Modal open={open} setOpen={setOpen} title="Agregar cuenta de la app" className="grid gap-6">
      {open && <AppBankAccountForm onSubmit={submit} submitLabel="Agregar" />}
    </Modal>
  )
}

const EditModal = ({ open, setOpen, account, onSuccess }) => {
  const dispatch = useDispatch()
  const defaultValues = account ? {
    bank_name: account.bank_name, account_number: account.account_number,
    owner_name: account.owner_name, account_type: account.account_type,
    documentTypeId: account.documentTypeId ? String(account.documentTypeId) : '',
    document_number: account.document_number,
  } : null

  const submit = async (data) => {
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/app-bank-accounts/${account.id}`, { ...data, documentTypeId: Number(data.documentTypeId) })
      setOpen(false); onSuccess()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Cuenta actualizada', showConfirmButton: false, timer: 3000 })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }
  return (
    <Modal open={open} setOpen={setOpen} title="Editar cuenta de la app" className="grid gap-6">
      {open && account && <AppBankAccountForm onSubmit={submit} defaultValues={defaultValues} submitLabel="Guardar cambios" />}
    </Modal>
  )
}

export const AdminAppAccountsPage = () => {
  const [accounts, setAccounts] = useState([])
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const dispatch = useDispatch()

  const fetchAccounts = async () => {
    try {
      const r = await api.get('/api/v1/app-bank-accounts')
      setAccounts(r.data)
    } catch (err) { appError(err) }
  }

  useEffect(() => { fetchAccounts() }, [])

  const remove = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar cuenta?', text: 'Esta acción no se puede deshacer', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#ef4444',
    })
    if (!isConfirmed) return
    dispatch(setLoad(false))
    try {
      await api.delete(`/api/v1/app-bank-accounts/${id}`)
      fetchAccounts()
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 })
    } finally { dispatch(setLoad(true)) }
  }

  return (
    <div className="flex flex-col gap-6">
      <AddModal open={addModal} setOpen={setAddModal} onSuccess={fetchAccounts} />
      <EditModal open={editModal} setOpen={setEditModal} account={editing} onSuccess={fetchAccounts} />

      <PageHeader
        title="Cuentas de la app"
        subtitle="Cuentas bancarias donde los usuarios realizan sus depósitos"
        action={
          <button onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
            <PlusIcon className="size-4" /> Nueva cuenta
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <BuildingLibraryIcon className="size-5 text-slate-500 dark:text-slate-400" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white truncate">{acc.bank_name}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditing(acc); setEditModal(true) }}
                  className="size-8 rounded-xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-neutral-700 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <PencilSquareIcon className="size-4" />
                </button>
                <button onClick={() => remove(acc.id)}
                  className="size-8 rounded-xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-mono text-slate-600 dark:text-slate-300 truncate">{acc.account_number}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${ACCOUNT_TYPE_COLOR[acc.account_type]}`}>
                  {ACCOUNT_TYPE_LABEL[acc.account_type]}
                </span>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">{acc.owner_name}</span>
              {acc.documentType && (
                <span className="text-xs text-slate-400">{acc.documentType.abbreviation} {acc.document_number}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <EmptyState icon={<BuildingLibraryIcon className="size-16" />} text="No hay cuentas registradas" />
      )}
    </div>
  )
}
