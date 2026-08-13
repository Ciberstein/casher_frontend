import { useEffect, useState } from 'react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { BanknotesIcon, ArrowDownTrayIcon, CurrencyDollarIcon, LinkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { ChargeModal } from '../home/partials/BalanceCard'
import { Button } from '../../../elements/user/Button'
import Modal from '../../../elements/user/Modal'
import { Input } from '../../../elements/user/Input'
import { ComboSelect } from '../../../elements/user/ComboSelect'
import { useForm, Controller, useWatch } from 'react-hook-form'
import api from '../../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../../utils/appError'
import { useDispatch, useSelector } from 'react-redux'
import { setLoad } from '../../../../store/slices/loader.slice'
import { accountThunk } from '../../../../store/slices/account.slice'
import { activityThunk } from '../../../../store/slices/activity.slice'
import useCurrency from '../../../../hooks/useCurrency'

const statusLabel = { pending: 'Pendiente', accepted: 'Aceptado', rejected: 'Rechazado', paid: 'Pagado', cancelled: 'Cancelado' };
const statusColor = { pending: 'text-espera', accepted: 'text-sello', rejected: 'text-salida', paid: 'text-entrada', cancelled: 'text-faint' };

const CURRENCY_OPTIONS = [
  { value: 'COP', label: 'COP' },
  { value: 'USD', label: 'USD' },
];

export const LoanRequestModal = ({ open, setOpen, onSuccess }) => {
  const { register, handleSubmit, reset, control, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' });
  const dispatch = useDispatch();

  const submit = async (data) => {
    dispatch(setLoad(false));
    try {
      await api.post('/api/v1/loans', data);
      reset();
      setOpen(false);
      onSuccess();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Solicitud enviada', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  return (
    <Modal open={open} setOpen={setOpen} title="Solicitar préstamo" className="grid gap-6">
      <form onSubmit={handleSubmit(submit)} className="grid gap-4">
        <Input icon={<CurrencyDollarIcon className="size-6" />} id="amount" name="amount"
          type="number" min="1" step="0.01" label="Monto" placeholder="0.00"
          register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', min: { value: 1, message: 'Mínimo 1' } } } }} />
        <Controller name="currency" control={control} rules={{ required: 'Requerido' }}
          render={({ field }) => (
            <ComboSelect label="Moneda" options={CURRENCY_OPTIONS} value={field.value}
              onChange={field.onChange} placeholder="Selecciona moneda"
              error={errors.currency} searchable={false} />
          )} />
        <Button type="submit" disabled={!isValid || isSubmitting}>Solicitar</Button>
      </form>
    </Modal>
  );
};

export const WithdrawalRequestModal = ({ open, setOpen, onSuccess }) => {
  const { register, handleSubmit, reset, control, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' });
  const [bankAccounts, setBankAccounts] = useState([]);
  const dispatch = useDispatch();
  const account = useSelector((state) => state.account);
  const selectedCurrency = useWatch({ control, name: 'currency', defaultValue: 'COP' });

  const available = account.balances?.[selectedCurrency] ?? 0;

  const availableFormatted = new Intl.NumberFormat(selectedCurrency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency: selectedCurrency, maximumFractionDigits: 2,
  }).format(available);

  useEffect(() => {
    if (open) api.get('/api/v1/bank-accounts').then(r => setBankAccounts(r.data)).catch(appError);
  }, [open]);

  const bankOptions = bankAccounts.map(acc => ({
    value: String(acc.id),
    label: acc.bank_name,
    subtitle: acc.account_number,
  }));

  const submit = async (data) => {
    dispatch(setLoad(false));
    try {
      await api.post('/api/v1/withdrawals', { ...data, bankAccountId: Number(data.bankAccountId) });
      reset();
      setOpen(false);
      onSuccess();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Solicitud enviada', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  return (
    <Modal open={open} setOpen={setOpen} title="Solicitar retiro" className="grid gap-6">
      {bankAccounts.length === 0
        ? <p className="text-sm text-faint">Primero agrega una cuenta bancaria en la sección Cuentas bancarias.</p>
        : (
          <form onSubmit={handleSubmit(submit)} className="grid gap-4">
            <Controller name="bankAccountId" control={control} rules={{ required: 'Requerido' }}
              render={({ field }) => (
                <ComboSelect label="Cuenta bancaria" options={bankOptions} value={field.value}
                  onChange={field.onChange} placeholder="Selecciona cuenta"
                  error={errors.bankAccountId} searchable={false} />
              )} />
            <Controller name="currency" control={control} rules={{ required: 'Requerido' }}
              render={({ field }) => (
                <ComboSelect label="Moneda" options={CURRENCY_OPTIONS} value={field.value}
                  onChange={field.onChange} placeholder="Selecciona moneda"
                  error={errors.currency} searchable={false} />
              )} />
            <div className="flex flex-col gap-1">
              <Input icon={<CurrencyDollarIcon className="size-6" />} id="amount" name="amount"
                type="number" min="1" step="0.01" label="Monto" placeholder="0.00"
                register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', min: { value: 1, message: 'Mínimo 1' }, max: { value: available, message: 'Saldo insuficiente' } } } }} />
              <span className="text-xs text-faint text-right">
                Disponible: <span className="font-medium text-muted">{availableFormatted}</span>
              </span>
            </div>
            <Button type="submit" disabled={!isValid || isSubmitting}>Solicitar retiro</Button>
          </form>
        )
      }
    </Modal>
  );
};

const LoansSection = () => {
  const [loans, setLoans] = useState([]);
  const [modal, setModal] = useState(false);
  const dispatch = useDispatch();
  const { format } = useCurrency();

  const fetchLoans = async () => {
    try { const r = await api.get('/api/v1/loans'); setLoans(r.data); }
    catch (err) { appError(err); }
  };

  useEffect(() => { fetchLoans(); }, []);

  const onSuccess = () => { fetchLoans(); dispatch(accountThunk()); dispatch(activityThunk()); };

  const cancel = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cancelar solicitud?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    dispatch(setLoad(false));
    try {
      await api.patch(`/api/v1/loans/${id}/cancel`);
      onSuccess();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Solicitud cancelada', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setModal(true)} className="flex items-center gap-1">
          <PlusIcon className="size-4" /> Solicitar préstamo
        </Button>
      </div>
      <LoanRequestModal open={modal} setOpen={setModal} onSuccess={onSuccess} />
      {loans.length === 0 && <p className="text-faint text-sm">No tienes préstamos aún.</p>}
      {loans.map(loan => (
        <div key={loan.id} className="bg-surface rounded-2xl p-4 shadow flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-ink">{format(loan.amount, loan.currency)}</span>
            <div className="flex items-center gap-3">
              {loan.status === 'pending' && (
                <button onClick={() => cancel(loan.id)}
                  className="flex items-center gap-1 text-xs text-salida hover:opacity-80 transition-colors">
                  <XMarkIcon className="size-3.5" /> Cancelar
                </button>
              )}
              <span className={`text-sm font-medium ${statusColor[loan.status]}`}>{statusLabel[loan.status]}</span>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-muted">
            <span>Tasa: {loan.interest_rate}% diario</span>
            {loan.status === 'accepted' && loan.outstanding != null && (
              <span>Saldo actual: {format(loan.outstanding, loan.currency)}</span>
            )}
          </div>
          <span className="text-xs text-faint">{new Date(loan.createdAt).toLocaleDateString()}</span>
        </div>
      ))}
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

const WithdrawalsSection = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [modal, setModal] = useState(false);
  const [voucherUrl, setVoucherUrl] = useState(null);
  const dispatch = useDispatch();
  const { format } = useCurrency();

  const fetchWithdrawals = async () => {
    try { const r = await api.get('/api/v1/withdrawals'); setWithdrawals(r.data); }
    catch (err) { appError(err); }
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  const onSuccess = () => { fetchWithdrawals(); dispatch(accountThunk()); dispatch(activityThunk()); };

  const cancel = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cancelar solicitud?',
      text: 'El saldo congelado será devuelto a tu cuenta disponible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    dispatch(setLoad(false));
    try {
      await api.patch(`/api/v1/withdrawals/${id}/cancel`);
      onSuccess();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Solicitud cancelada', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setModal(true)} className="flex items-center gap-1">
          <PlusIcon className="size-4" /> Solicitar retiro
        </Button>
      </div>
      <VoucherModal open={!!voucherUrl} setOpen={() => setVoucherUrl(null)} url={voucherUrl} />
      <WithdrawalRequestModal open={modal} setOpen={setModal} onSuccess={onSuccess} />
      {withdrawals.length === 0 && <p className="text-faint text-sm">No tienes retiros aún.</p>}
      {withdrawals.map(w => (
        <div key={w.id} className="bg-surface rounded-2xl p-4 shadow flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-ink">{format(w.amount, w.currency)}</span>
            <div className="flex items-center gap-3">
              {w.status === 'pending' && (
                <button onClick={() => cancel(w.id)}
                  className="flex items-center gap-1 text-xs text-salida hover:opacity-80 transition-colors">
                  <XMarkIcon className="size-3.5" /> Cancelar
                </button>
              )}
              <span className={`text-sm font-medium ${statusColor[w.status]}`}>{statusLabel[w.status]}</span>
            </div>
          </div>
          <span className="text-sm text-muted">
            {w.bankAccount?.bank_name} · {w.bankAccount?.account_number}
          </span>
          {w.screenshot && (
            <button type="button" onClick={() => setVoucherUrl(w.screenshot)}
              className="text-xs text-sello-ink hover:text-sello flex items-center gap-1 w-fit">
              <LinkIcon className="size-3" /> Ver comprobante
            </button>
          )}
          <span className="text-xs text-faint">{new Date(w.createdAt).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
};

const DepositRequestsSection = () => {
  const [requests, setRequests] = useState([]);
  const [modal, setModal] = useState(false);
  const dispatch = useDispatch();
  const { format } = useCurrency();

  const fetchRequests = async () => {
    try { const r = await api.get('/api/v1/deposit-requests'); setRequests(r.data); }
    catch (err) { appError(err); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const cancel = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cancelar solicitud?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    dispatch(setLoad(false));
    try {
      await api.patch(`/api/v1/deposit-requests/${id}/cancel`);
      fetchRequests();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Solicitud cancelada', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  return (
    <div className="flex flex-col gap-4">
      <ChargeModal open={modal} setOpen={setModal} />
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setModal(true)} className="flex items-center gap-1">
          <PlusIcon className="size-4" /> Nueva recarga
        </Button>
      </div>
      {requests.length === 0 && <p className="text-faint text-sm">No tienes solicitudes de recarga aún.</p>}
      {requests.map(r => (
        <div key={r.id} className="bg-surface rounded-2xl p-4 shadow flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-ink">{format(r.amount, r.currency)}</span>
            <div className="flex items-center gap-3">
              {r.status === 'pending' && (
                <button onClick={() => cancel(r.id)}
                  className="flex items-center gap-1 text-xs text-salida hover:opacity-80 transition-colors">
                  <XMarkIcon className="size-3.5" /> Cancelar
                </button>
              )}
              <span className={`text-sm font-medium ${statusColor[r.status]}`}>{statusLabel[r.status]}</span>
            </div>
          </div>
          {r.appBankAccount && (
            <span className="text-sm text-muted">
              {r.appBankAccount.bank_name} · {r.appBankAccount.account_number}
            </span>
          )}
          <span className="text-xs text-faint">{new Date(r.createdAt).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
};

const TABS = [
  { key: 'loans', label: 'Préstamos', icon: <BanknotesIcon className="size-4" /> },
  { key: 'withdrawals', label: 'Retiros', icon: <ArrowDownTrayIcon className="size-4" /> },
  { key: 'deposits', label: 'Recargas', icon: <ArrowUpTrayIcon className="size-4" /> },
];

export const Requests = () => {
  const [tab, setTab] = useState('loans');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-wide text-2xl font-bold tracking-tight text-ink">Solicitudes</h1>
      <div className="flex gap-1 bg-sunken rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.key
                ? 'bg-surface text-ink shadow-sm'
                : 'text-muted hover:text-ink'
              }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'loans' && <LoansSection />}
      {tab === 'withdrawals' && <WithdrawalsSection />}
      {tab === 'deposits' && <DepositRequestsSection />}
    </div>
  );
};
