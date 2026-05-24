import { useEffect, useState } from 'react'
import { BanknotesIcon, ArrowDownTrayIcon, LinkIcon, UserIcon, CalendarIcon, BuildingLibraryIcon, IdentificationIcon } from '@heroicons/react/24/outline'
import { CheckIcon, XMarkIcon, PlusIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/20/solid'
import { useForm, Controller } from 'react-hook-form'
import Modal from '../../elements/user/Modal'
import { Button } from '../../elements/user/Button'
import { Input } from '../../elements/user/Input'
import { ComboSelect } from '../../elements/user/ComboSelect'
import { FileUpload } from '../../elements/user/FileUpload'
import api from '../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../utils/appError'
import { useDispatch, useSelector } from 'react-redux'
import { setLoad } from '../../../store/slices/loader.slice'
import { banksThunk } from '../../../store/slices/banks.slice'
import { documentTypesThunk } from '../../../store/slices/documentTypes.slice'

const statusLabel = { pending: 'Pendiente', accepted: 'Aceptado', rejected: 'Rechazado', paid: 'Pagado' };
const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const AcceptWithdrawalModal = ({ open, setOpen, withdrawal, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [submitError, setSubmitError] = useState(false);
  const dispatch = useDispatch();

  const handleClose = (v) => {
    setOpen(v);
    if (!v) { setFile(null); setSubmitError(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) { setSubmitError(true); return; }
    setSubmitError(false);
    dispatch(setLoad(false));
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.patch(`/api/v1/withdrawals/${withdrawal?.id}/accept`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      handleClose(false);
      onSuccess();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Retiro aceptado', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  const initials = withdrawal?.account?.username?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <Modal open={open} setOpen={handleClose} title="Confirmar retiro" className="grid gap-6">
      {withdrawal && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700">
          <div className="size-11 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{initials}</span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{withdrawal.account?.username}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{withdrawal.account?.email}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {withdrawal.bankAccount?.bank_name} · {withdrawal.bankAccount?.account_number}
            </p>
          </div>
          <div className="ml-auto shrink-0 text-right">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{withdrawal.amount?.toLocaleString()}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{withdrawal.currency}</p>
          </div>
        </div>
      )}
      <form onSubmit={submit} className="grid gap-4">
        <FileUpload
          label="Comprobante de pago"
          accept="image/*,application/pdf"
          onUpload={setFile}
          deferred
          error={submitError && !file ? { message: 'Requerido' } : null}
        />
        <Button type="submit" color="green">Confirmar retiro</Button>
      </form>
    </Modal>
  );
};

const InfoRow = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
    {icon}
    <span>{text}</span>
  </div>
);

const ViewToggle = ({ value, onChange }) => (
  <div className="flex gap-1 bg-slate-100 dark:bg-neutral-800 rounded-lg p-0.5 w-fit text-xs">
    {['pending', 'history'].map(v => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`px-3 py-1.5 rounded-md font-medium transition-colors
          ${value === v
            ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
      >
        {v === 'pending' ? 'Pendientes' : 'Historial'}
      </button>
    ))}
  </div>
);

const LoansPanel = () => {
  const [loans, setLoans] = useState([]);
  const [view, setView] = useState('pending');
  const dispatch = useDispatch();

  const fetchLoans = async (v = view) => {
    try {
      const r = await api.get(`/api/v1/loans/admin${v === 'history' ? '?history=true' : ''}`);
      setLoans(r.data);
    } catch (err) { appError(err); }
  };

  useEffect(() => { fetchLoans(view); }, [view]);

  const action = async (id, type) => {
    dispatch(setLoad(false));
    try {
      await api.patch(`/api/v1/loans/${id}/${type}`);
      fetchLoans();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: `Préstamo ${type === 'accept' ? 'aceptado' : 'rechazado'}`, showConfirmButton: false, timer: 3000 });
    } catch (err) { appError(err); }
    finally { dispatch(setLoad(true)); }
  };

  return (
    <div className="flex flex-col gap-4">
      <ViewToggle value={view} onChange={setView} />
      {loans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <BanknotesIcon className="size-10 opacity-40" />
          <p className="text-sm">{view === 'pending' ? 'No hay préstamos pendientes' : 'Sin historial'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {loans.map(loan => (
            <div key={loan.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-neutral-800">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-2 min-w-0">
                  <InfoRow icon={<UserIcon className="size-4 shrink-0" />} text={`${loan.account?.username} · ${loan.account?.email}`} />
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl font-bold dark:text-white">{loan.amount.toLocaleString()} {loan.currency}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[loan.status]}`}>
                      {statusLabel[loan.status]}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Tasa {loan.interest_rate}% diario</span>
                  {loan.outstanding != null && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Saldo actual: {new Intl.NumberFormat(loan.currency === 'USD' ? 'en-US' : 'es-CO', { style: 'currency', currency: loan.currency, currencyDisplay: 'code', maximumFractionDigits: 2 }).format(loan.outstanding)}
                    </span>
                  )}
                  <InfoRow icon={<CalendarIcon className="size-4 shrink-0" />} text={new Date(loan.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} />
                </div>
                {view === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => action(loan.id, 'accept')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
                      <CheckIcon className="size-4" /> Aceptar
                    </button>
                    <button onClick={() => action(loan.id, 'reject')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700 text-sm font-medium transition-colors">
                      <XMarkIcon className="size-4" /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const VoucherModal = ({ open, setOpen, url }) => {
  const isPdf = url?.toLowerCase().includes('.pdf') || url?.toLowerCase().includes('/raw/');
  return (
    <Modal open={open} setOpen={setOpen} title="Comprobante" className="p-0">
      <div className="w-full overflow-hidden rounded-b-2xl">
        {isPdf ? (
          <iframe src={url} className="w-full h-[70vh]" title="Comprobante PDF" />
        ) : (
          <img src={url} alt="Comprobante" className="w-full max-h-[70vh] object-contain bg-slate-950" />
        )}
      </div>
    </Modal>
  );
};

const WithdrawalsPanel = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [view, setView] = useState('pending');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null); // full withdrawal object
  const [voucherUrl, setVoucherUrl] = useState(null);
  const dispatch = useDispatch();

  const fetchWithdrawals = async (v = view) => {
    try {
      const r = await api.get(`/api/v1/withdrawals/admin${v === 'history' ? '?history=true' : ''}`);
      setWithdrawals(r.data);
    } catch (err) { appError(err); }
  };

  useEffect(() => { fetchWithdrawals(view); }, [view]);

  const reject = async (id) => {
    dispatch(setLoad(false));
    try {
      await api.patch(`/api/v1/withdrawals/${id}/reject`);
      fetchWithdrawals();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Retiro rechazado', showConfirmButton: false, timer: 3000 });
    } catch (err) { appError(err); }
    finally { dispatch(setLoad(true)); }
  };

  return (
    <div className="flex flex-col gap-4">
      <VoucherModal open={!!voucherUrl} setOpen={() => setVoucherUrl(null)} url={voucherUrl} />
      <AcceptWithdrawalModal open={modal} setOpen={setModal} withdrawal={selected} onSuccess={() => fetchWithdrawals()} />
      <ViewToggle value={view} onChange={setView} />
      {withdrawals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <ArrowDownTrayIcon className="size-10 opacity-40" />
          <p className="text-sm">{view === 'pending' ? 'No hay retiros pendientes' : 'Sin historial'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {withdrawals.map(w => (
            <div key={w.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-neutral-800">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-2 min-w-0">
                  <InfoRow icon={<UserIcon className="size-4 shrink-0" />} text={`${w.account?.username} · ${w.account?.email}`} />
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl font-bold dark:text-white">{w.amount.toLocaleString()} {w.currency}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[w.status]}`}>
                      {statusLabel[w.status]}
                    </span>
                  </div>
                  <InfoRow icon={<BuildingLibraryIcon className="size-4 shrink-0" />} text={`${w.bankAccount?.bank_name} · ${w.bankAccount?.account_number}`} />
                  {w.screenshot && (
                    <button type="button" onClick={() => setVoucherUrl(w.screenshot)}
                      className="flex items-center gap-1 text-xs text-blue-500 hover:underline w-fit">
                      <LinkIcon className="size-3" /> Ver comprobante
                    </button>
                  )}
                  <InfoRow icon={<CalendarIcon className="size-4 shrink-0" />} text={new Date(w.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} />
                </div>
                {view === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setSelected(w); setModal(true); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
                      <CheckIcon className="size-4" /> Aceptar
                    </button>
                    <button onClick={() => reject(w.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700 text-sm font-medium transition-colors">
                      <XMarkIcon className="size-4" /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DepositRequestsPanel = () => {
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState('pending');
  const [voucherUrl, setVoucherUrl] = useState(null);
  const dispatch = useDispatch();

  const fetchRequests = async (v = view) => {
    try {
      const r = await api.get(`/api/v1/deposit-requests/admin${v === 'history' ? '?history=true' : ''}`);
      setRequests(r.data);
    } catch (err) { appError(err); }
  };

  useEffect(() => { fetchRequests(view); }, [view]);

  const action = async (id, type) => {
    dispatch(setLoad(false));
    try {
      await api.patch(`/api/v1/deposit-requests/${id}/${type}`);
      fetchRequests();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: type === 'accept' ? 'Recarga aprobada' : 'Recarga rechazada', showConfirmButton: false, timer: 3000 });
    } catch (err) { appError(err); }
    finally { dispatch(setLoad(true)); }
  };

  return (
    <div className="flex flex-col gap-4">
      <VoucherModal open={!!voucherUrl} setOpen={() => setVoucherUrl(null)} url={voucherUrl} />
      <ViewToggle value={view} onChange={setView} />
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <ArrowDownTrayIcon className="size-10 opacity-40 rotate-180" />
          <p className="text-sm">{view === 'pending' ? 'No hay solicitudes pendientes' : 'Sin historial'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map(req => (
            <div key={req.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-neutral-800">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-2 min-w-0">
                  <InfoRow icon={<UserIcon className="size-4 shrink-0" />} text={`${req.account?.username} · ${req.account?.email}`} />
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl font-bold dark:text-white">{req.amount.toLocaleString()} {req.currency}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[req.status]}`}>
                      {statusLabel[req.status]}
                    </span>
                  </div>
                  {req.appBankAccount && (
                    <InfoRow icon={<BuildingLibraryIcon className="size-4 shrink-0" />}
                      text={`${req.appBankAccount.bank_name} · ${req.appBankAccount.account_number}`} />
                  )}
                  <button type="button" onClick={() => setVoucherUrl(req.screenshot)}
                    className="flex items-center gap-1 text-xs text-blue-500 hover:underline w-fit">
                    <LinkIcon className="size-3" /> Ver comprobante
                  </button>
                  <InfoRow icon={<CalendarIcon className="size-4 shrink-0" />} text={new Date(req.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} />
                </div>
                {view === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => action(req.id, 'accept')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
                      <CheckIcon className="size-4" /> Aprobar
                    </button>
                    <button onClick={() => action(req.id, 'reject')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700 text-sm font-medium transition-colors">
                      <XMarkIcon className="size-4" /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'savings', label: 'Ahorros' },
  { value: 'checking', label: 'Corriente' },
];
const accountTypeLabel = { savings: 'Ahorros', checking: 'Corriente' };

const AppBankAccountForm = ({ onSubmit, defaultValues, submitLabel }) => {
  const { register, handleSubmit, reset, control, trigger, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' });
  const dispatch = useDispatch();
  const banks = useSelector((state) => state.banks);
  const documentTypes = useSelector((state) => state.documentTypes);

  useEffect(() => {
    if (banks.length === 0) dispatch(banksThunk());
    if (documentTypes.length === 0) dispatch(documentTypesThunk());
  }, []);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
      trigger();
    }
  }, [defaultValues]);

  const bankOptions = banks.map(b => ({ value: b.name, label: b.name, icon: b.logo }));
  const docTypeOptions = documentTypes.map(dt => ({
    value: String(dt.id),
    label: dt.abbreviation,
    subtitle: dt.name,
  }));

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
  );
};

const AddAppBankAccountModal = ({ open, setOpen, onSuccess }) => {
  const dispatch = useDispatch();

  const submit = async (data) => {
    dispatch(setLoad(false));
    try {
      await api.post('/api/v1/app-bank-accounts', { ...data, documentTypeId: Number(data.documentTypeId) });
      setOpen(false);
      onSuccess();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Cuenta agregada', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  return (
    <Modal open={open} setOpen={setOpen} title="Agregar cuenta de la app" className="grid gap-6">
      {open && <AppBankAccountForm onSubmit={submit} submitLabel="Agregar" />}
    </Modal>
  );
};

const EditAppBankAccountModal = ({ open, setOpen, account, onSuccess }) => {
  const dispatch = useDispatch();

  const defaultValues = account ? {
    bank_name: account.bank_name,
    account_number: account.account_number,
    owner_name: account.owner_name,
    account_type: account.account_type,
    documentTypeId: account.documentTypeId ? String(account.documentTypeId) : '',
    document_number: account.document_number,
  } : null;

  const submit = async (data) => {
    dispatch(setLoad(false));
    try {
      await api.patch(`/api/v1/app-bank-accounts/${account.id}`, { ...data, documentTypeId: Number(data.documentTypeId) });
      setOpen(false);
      onSuccess();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Cuenta actualizada', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  return (
    <Modal open={open} setOpen={setOpen} title="Editar cuenta de la app" className="grid gap-6">
      {open && account && <AppBankAccountForm onSubmit={submit} defaultValues={defaultValues} submitLabel="Guardar cambios" />}
    </Modal>
  );
};

const AppBankAccountsPanel = () => {
  const [accounts, setAccounts] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const dispatch = useDispatch();

  const fetchAccounts = async () => {
    try {
      const r = await api.get('/api/v1/app-bank-accounts');
      setAccounts(r.data);
    } catch (err) { appError(err); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const remove = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar cuenta?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    dispatch(setLoad(false));
    try {
      await api.delete(`/api/v1/app-bank-accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  return (
    <div className="flex flex-col gap-4">
      <AddAppBankAccountModal open={addModal} setOpen={setAddModal} onSuccess={fetchAccounts} />
      <EditAppBankAccountModal open={editModal} setOpen={setEditModal} account={editing} onSuccess={fetchAccounts} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setAddModal(true)}
          className="flex flex-col gap-2 justify-center items-center min-h-36 rounded-2xl border-2 border-dashed
            border-slate-200 dark:border-neutral-700 text-slate-400 dark:text-slate-500
            hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-300
            transition-colors"
        >
          <PlusIcon className="size-8" />
          <span className="text-sm font-medium">Agregar nueva cuenta</span>
        </button>
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-2xl p-5 flex flex-col gap-3 min-h-36 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="font-bold text-slate-900 dark:text-white text-base">{acc.bank_name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(acc); setEditModal(true); }}
                  className="size-8 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center
                    text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <PencilSquareIcon className="size-4" />
                </button>
                <button
                  onClick={() => remove(acc.id)}
                  className="size-8 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center
                    text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {acc.account_number}
                <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${acc.account_type === 'savings' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                  {accountTypeLabel[acc.account_type]}
                </span>
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
      {accounts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
          <BuildingLibraryIcon className="size-10 opacity-40" />
          <p className="text-sm">No hay cuentas registradas</p>
        </div>
      )}
    </div>
  );
};

const Badge = ({ count }) => {
  if (!count) return null;
  return (
    <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
      {count}
    </span>
  );
};

const TABS = [
  { key: 'loans', label: 'Préstamos', icon: <BanknotesIcon className="size-4" />, Panel: LoansPanel },
  { key: 'withdrawals', label: 'Retiros', icon: <ArrowDownTrayIcon className="size-4" />, Panel: WithdrawalsPanel },
  { key: 'deposits', label: 'Recargas', icon: <ArrowDownTrayIcon className="size-4 rotate-180" />, Panel: DepositRequestsPanel },
  { key: 'app-accounts', label: 'Cuentas App', icon: <BuildingLibraryIcon className="size-4" />, Panel: AppBankAccountsPanel },
];

export const AdminPage = () => {
  const [tab, setTab] = useState('loans');
  const [counts, setCounts] = useState({ loans: 0, withdrawals: 0, deposits: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/loans/admin'),
      api.get('/api/v1/withdrawals/admin'),
      api.get('/api/v1/deposit-requests/admin'),
    ]).then(([l, w, d]) => setCounts({ loans: l.data.length, withdrawals: w.data.length, deposits: d.data.length }))
      .catch(() => {});
  }, []);

  const ActivePanel = TABS.find(t => t.key === tab).Panel;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold dark:text-white">Panel de administración</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestiona las solicitudes pendientes</p>
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-neutral-800 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.key
                ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            {t.icon}
            {t.label}
            <Badge count={counts[t.key]} />
          </button>
        ))}
      </div>

      <ActivePanel />
    </div>
  );
};
