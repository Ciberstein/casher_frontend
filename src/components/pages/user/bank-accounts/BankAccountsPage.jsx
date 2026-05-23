import { useEffect, useState } from 'react'
import { PlusIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/20/solid'
import { BuildingLibraryIcon, IdentificationIcon } from '@heroicons/react/24/outline'
import { Button } from '../../../elements/user/Button'
import Modal from '../../../elements/user/Modal'
import { Input } from '../../../elements/user/Input'
import { ComboSelect } from '../../../elements/user/ComboSelect'
import { useForm, Controller } from 'react-hook-form'
import api from '../../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../../utils/appError'
import { useDispatch, useSelector } from 'react-redux'
import { setLoad } from '../../../../store/slices/loader.slice'
import { banksThunk } from '../../../../store/slices/banks.slice'
import { documentTypesThunk } from '../../../../store/slices/documentTypes.slice'

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'savings', label: 'Ahorros' },
  { value: 'checking', label: 'Corriente' },
];

const AddBankAccountModal = ({ open, setOpen, onSuccess }) => {
  const { register, handleSubmit, reset, control, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const dispatch = useDispatch();
  const banks = useSelector((state) => state.banks);
  const documentTypes = useSelector((state) => state.documentTypes);

  useEffect(() => {
    if (banks.length === 0) dispatch(banksThunk());
    if (documentTypes.length === 0) dispatch(documentTypesThunk());
  }, []);

  const bankOptions = banks.map(b => ({ value: b.name, label: b.name, icon: b.logo }));
  const docTypeOptions = documentTypes.map(dt => ({
    value: String(dt.id),
    label: dt.abbreviation,
    subtitle: dt.name,
  }));

  const submit = async (data) => {
    dispatch(setLoad(false));
    try {
      await api.post('/api/v1/bank-accounts', { ...data, documentTypeId: Number(data.documentTypeId) });
      reset();
      setOpen(false);
      onSuccess();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Cuenta agregada', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally {
      dispatch(setLoad(true));
    }
  };

  return (
    <Modal open={open} setOpen={setOpen} title="Agregar cuenta bancaria" className="grid gap-6">
      <form onSubmit={handleSubmit(submit)} className="grid gap-4">
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
        <Button type="submit" disabled={!isValid}>Agregar</Button>
      </form>
    </Modal>
  );
};

const EditBankAccountModal = ({ open, setOpen, account, onSuccess }) => {
  const { register, handleSubmit, reset, control, trigger, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const dispatch = useDispatch();
  const banks = useSelector((state) => state.banks);
  const documentTypes = useSelector((state) => state.documentTypes);

  useEffect(() => {
    if (banks.length === 0) dispatch(banksThunk());
    if (documentTypes.length === 0) dispatch(documentTypesThunk());
  }, []);

  useEffect(() => {
    if (open && account) {
      reset({
        bank_name: account.bank_name,
        account_number: account.account_number,
        owner_name: account.owner_name,
        account_type: account.account_type,
        documentTypeId: account.documentTypeId ? String(account.documentTypeId) : '',
        document_number: account.document_number,
      });
      trigger();
    }
  }, [open, account]);

  const bankOptions = banks.map(b => ({ value: b.name, label: b.name, icon: b.logo }));
  const docTypeOptions = documentTypes.map(dt => ({
    value: String(dt.id),
    label: dt.abbreviation,
    subtitle: dt.name,
  }));

  const submit = async (data) => {
    dispatch(setLoad(false));
    try {
      await api.put(`/api/v1/bank-accounts/${account.id}`, { ...data, documentTypeId: Number(data.documentTypeId) });
      setOpen(false);
      onSuccess();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Cuenta actualizada', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally {
      dispatch(setLoad(true));
    }
  };

  return (
    <Modal open={open} setOpen={setOpen} title="Editar cuenta bancaria" className="grid gap-6">
      <form onSubmit={handleSubmit(submit)} className="grid gap-4">
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
        <Button type="submit" disabled={!isValid}>Guardar cambios</Button>
      </form>
    </Modal>
  );
};

export const BankAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const dispatch = useDispatch();

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/api/v1/bank-accounts');
      setAccounts(res.data);
    } catch (err) { appError(err); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const remove = async (id) => {
    dispatch(setLoad(false));
    try {
      await api.delete(`/api/v1/bank-accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  const accountTypeLabel = { savings: 'Ahorros', checking: 'Corriente' };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold dark:text-white">Cuentas bancarias</h1>
      <AddBankAccountModal open={modal} setOpen={setModal} onSuccess={fetchAccounts} />
      <EditBankAccountModal open={editModal} setOpen={setEditModal} account={editingAccount} onSuccess={fetchAccounts} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button
          onClick={() => setModal(true)}
          className="flex flex-col gap-2 justify-center items-center min-h-36 rounded-2xl border-2 border-dashed
            border-slate-200 dark:border-neutral-700 text-slate-400 dark:text-slate-500
            hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-300
            transition-colors"
        >
          <PlusIcon className="size-8" />
          <span className="text-sm font-medium">Agregar nueva cuenta</span>
        </button>

        {accounts.map(acc => (
          <div key={acc.id} className="bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col gap-3 min-h-36">
            <div className="flex justify-between items-start">
              <span className="font-bold text-slate-900 dark:text-white text-base">{acc.bank_name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingAccount(acc); setEditModal(true); }}
                  className="size-8 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center
                    text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-neutral-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <PencilSquareIcon className="size-4" />
                </button>
                <button
                  onClick={() => remove(acc.id)}
                  className="size-8 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center
                    text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {acc.account_number} · {accountTypeLabel[acc.account_type]}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{acc.owner_name}</span>
              {acc.documentType && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {acc.documentType.abbreviation} {acc.document_number}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
