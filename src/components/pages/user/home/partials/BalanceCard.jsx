import { ArrowTurnDownLeftIcon, ArrowTurnUpRightIcon, CheckIcon, ChevronUpDownIcon, MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { ArrowRightIcon, CurrencyDollarIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, TagIcon } from '@heroicons/react/24/outline'
import { FileUpload } from '../../../../elements/user/FileUpload'
import { useState, useEffect, useMemo } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/react'
import { ComboSelect } from '../../../../elements/user/ComboSelect'
import useCurrency from '../../../../../hooks/useCurrency'
import Modal from '../../../../elements/user/Modal'
import ManageTxModal from '../../transactions/partials/ManageTxModal'
import { Button } from '../../../../elements/user/Button'
import { Input } from '../../../../elements/user/Input'
import isEmailValid from '../../../../../utils/isEmailValid'
import { useDispatch, useSelector } from 'react-redux'
import { setLoad } from '../../../../../store/slices/loader.slice'
import api from '../../../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../../../utils/appError'
import { accountThunk } from '../../../../../store/slices/account.slice'
import { transfersThunk } from '../../../../../store/slices/transfers.slice'
import { activityThunk } from '../../../../../store/slices/activity.slice'

const CURRENCY_OPTIONS = [
  { value: 'COP', label: 'COP' },
  { value: 'USD', label: 'USD' },
];

const STEPS = ['Usuario', 'Monto', 'Confirmar'];

const StepIndicator = ({ current }) => (
  <div className="flex items-center">
    {STEPS.map((label, i) => (
      <div key={label} className="flex items-center flex-1 last:flex-none">
        <div className="flex flex-col items-center gap-1.5">
          <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${current > i + 1 ? 'bg-emerald-500 text-white' : current === i + 1 ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/40' : 'bg-slate-100 dark:bg-neutral-700 text-slate-400'}`}>
            {current > i + 1 ? <CheckIcon className="size-4" /> : i + 1}
          </div>
          <span className={`text-xs font-medium whitespace-nowrap ${current >= i + 1 ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${current > i + 1 ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-neutral-700'}`} />
        )}
      </div>
    ))}
  </div>
);

const fmt = (amount, currency) =>
  new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency: currency || 'COP', maximumFractionDigits: 2,
  }).format(amount);

const RecipientCombo = ({ value, onChange, recipients }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return recipients;
    const q = query.toLowerCase();
    return recipients.filter(r =>
      r.recipient.username?.toLowerCase().includes(q) ||
      r.recipient.email?.toLowerCase().includes(q) ||
      r.recipient.data?.first_name?.toLowerCase().includes(q) ||
      r.recipient.data?.surname_1?.toLowerCase().includes(q)
    );
  }, [query, recipients]);

  const icon = value?.includes('@') ? <EnvelopeIcon className="size-5" /> : <TagIcon className="size-5" />;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-slate-500">Destinatario</label>
      <Combobox
        value={value}
        onChange={(val) => { onChange(val); setQuery(''); }}
        onClose={() => setQuery('')}
      >
        <div className="flex gap-2 items-center border-transparent border rounded-xl bg-slate-200 dark:bg-neutral-800 p-2">
          <span className="text-slate-500 dark:text-slate-400 shrink-0">{icon}</span>
          <ComboboxInput
            className="bg-transparent w-full placeholder:text-slate-500 focus-visible:outline-none text-slate-900 dark:text-white text-md"
            placeholder="usuario@dominio.com o @apodo"
            displayValue={(v) => v ?? ''}
            onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); }}
          />
          {recipients.length > 0 && (
            <ComboboxButton className="shrink-0">
              <ChevronUpDownIcon className="size-5 text-slate-400" />
            </ComboboxButton>
          )}
        </div>
        {filtered.length > 0 && (
          <ComboboxOptions className="absolute z-50 w-full mt-1 max-h-52 overflow-y-auto rounded-xl bg-white dark:bg-neutral-800 shadow-xl border border-slate-100 dark:border-neutral-700 p-1">
            {filtered.map(r => {
              const rec = r.recipient;
              const name = `${rec.data?.first_name ?? ''} ${rec.data?.surname_1 ?? ''}`.trim() || rec.username;
              const initials = [rec.data?.first_name, rec.data?.surname_1].filter(Boolean).map(s => s[0]).join('').toUpperCase() || rec.username?.[0]?.toUpperCase();
              return (
                <ComboboxOption
                  key={r.id}
                  value={rec.email}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer select-none data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-700 transition-colors"
                >
                  <div className="size-8 rounded-full shrink-0 overflow-hidden bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    {rec.picture
                      ? <img src={rec.picture} className="size-full object-cover" />
                      : <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{initials}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{name}</p>
                    <p className="text-xs text-slate-400 truncate">@{rec.username} · {rec.email}</p>
                  </div>
                </ComboboxOption>
              );
            })}
          </ComboboxOptions>
        )}
      </Combobox>
    </div>
  );
};

const ACCOUNT_TYPE_LABEL = { savings: 'Ahorros', checking: 'Corriente' };

export const ChargeModal = ({ open, setOpen }) => {
  const { register, handleSubmit, reset, control, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' });
  const [accounts, setAccounts] = useState([]);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (open) api.get('/api/v1/app-bank-accounts').then(r => setAccounts(r.data)).catch(() => {});
  }, [open]);

  const handleClose = (v) => {
    setOpen(v);
    if (!v) { reset(); setFile(null); setFileError(false); }
  };

  const submit = async (data) => {
    if (!file) { setFileError(true); return; }
    setFileError(false);
    dispatch(setLoad(false));
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('amount', data.amount);
      formData.append('currency', data.currency);
      formData.append('appBankAccountId', data.appBankAccountId);
      await api.post('/api/v1/deposit-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleClose(false);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Solicitud enviada', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  const accountOptions = accounts.map(acc => ({
    value: String(acc.id),
    label: acc.bank_name,
    subtitle: acc.account_number,
  }));

  return (
    <Modal open={open} setOpen={handleClose} title="Cargar fondos" className="flex flex-col gap-5">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Realiza una transferencia a una de las cuentas de la app y adjunta el comprobante. El saldo será acreditado tras la verificación.
      </p>

      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <Controller name="appBankAccountId" control={control} rules={{ required: 'Requerido' }}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">¿A cuál cuenta depositaste?</label>
              <div className="flex flex-col gap-2">
                {accounts.map(acc => {
                  const selected = field.value === String(acc.id)
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => field.onChange(String(acc.id))}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all
                        ${selected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                          : 'border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/60 hover:border-slate-300 dark:hover:border-neutral-600'
                        }`}
                    >
                      <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                        ${selected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-neutral-600'}`}>
                        {selected && <CheckIcon className="size-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{acc.bank_name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium shrink-0">
                            {ACCOUNT_TYPE_LABEL[acc.account_type]}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{acc.account_number}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{acc.owner_name}</p>
                        {acc.documentType && (
                          <p className="text-xs text-slate-400">{acc.documentType.abbreviation}: {acc.document_number}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              {errors.appBankAccountId && (
                <p className="text-xs text-red-500">{errors.appBankAccountId.message}</p>
              )}
            </div>
          )} />

        <Controller name="currency" control={control} rules={{ required: 'Requerido' }}
          render={({ field }) => (
            <ComboSelect label="Moneda" searchable={false}
              options={CURRENCY_OPTIONS} value={field.value} onChange={field.onChange}
              placeholder="Selecciona moneda" error={errors.currency} />
          )} />
        <Input icon={<CurrencyDollarIcon className="size-5" />} id="c_amount" name="amount"
          type="number" min="1" step="0.01" label="Monto depositado" placeholder="0.00"
          register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', min: { value: 1, message: 'Mínimo 1' } } } }} />
        <FileUpload
          label="Comprobante de pago"
          accept="image/*,application/pdf"
          onUpload={setFile}
          deferred
          error={fileError && !file ? { message: 'Requerido' } : null}
        />
        <Button type="submit" color="green" disabled={!isValid || isSubmitting}>Enviar solicitud</Button>
      </form>
    </Modal>
  );
};

export const SendOrRequestModal = ({ open, setOpen, txType }) => {
  const { register, handleSubmit, reset, control, formState: { errors, isValid, isSubmitting } } = useForm({
    mode: 'onChange', defaultValues: { currency: 'COP' },
  });
  const [section, setSection] = useState(1);
  const [params, setParams] = useState({});
  const [completedTx, setCompletedTx] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [recipients, setRecipients] = useState([]);

  const dispatch = useDispatch();
  const account = useSelector((state) => state.account);
  const { rate } = useSelector((state) => state.currency);
  const selectedCurrency = useWatch({ control, name: 'currency', defaultValue: 'COP' });

  const available = selectedCurrency === 'USD' && rate
    ? account.balance_available / rate
    : account.balance_available ?? 0;

  const availableFormatted = new Intl.NumberFormat(selectedCurrency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency: selectedCurrency, maximumFractionDigits: 2,
  }).format(available);

  useEffect(() => {
    if (open) api.get('/api/v1/recipients').then(r => setRecipients(r.data)).catch(() => {});
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setSection(1);
    reset();
  };

  const submit = async (data) => {
    dispatch(setLoad(false));
    const url = `/api/v1/transfers/${txType ? 'send' : 'request'}`;
    const type = data.user?.includes('@') ? 1 : 2;
    const formData = { ...data, type, confirmation: section === 3 };

    await api.post(url, formData)
      .then(async (res) => {
        if (res.status === 200) {
          setSection(2);
        } else if (res.status === 201) {
          setParams(res.data);
          setSection(3);
        } else if (res.status === 202) {
          const { hash } = res.data;
          handleClose();
          dispatch(accountThunk());
          dispatch(transfersThunk());
          dispatch(activityThunk());

          try {
            const detail = await api.get(`/api/v1/transfers/${hash}`);
            setCompletedTx(detail.data);
            setDetailOpen(true);
          } catch (err) { appError(err); }
        }
      })
      .catch((err) => {
        appError(err);
        Swal.fire({
          toast: true, position: 'bottom-right', icon: 'error',
          text: err.response?.data?.message, showConfirmButton: false, timer: 5000, timerProgressBar: true,
        });
      })
      .finally(() => dispatch(setLoad(true)));
  };

  return (
    <>
      <ManageTxModal open={detailOpen} setOpen={setDetailOpen} tx={completedTx} />

      <Modal open={open} setOpen={handleClose} title={txType ? 'Enviar fondos' : 'Solicitar fondos'} className="flex flex-col gap-6">
        <StepIndicator current={section} />

        <form className="flex flex-col gap-5" onSubmit={handleSubmit(submit)}>
          {section === 1 && (
            <>
              <div className="relative">
                <Controller
                  name="user"
                  control={control}
                  rules={{ required: 'Requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } }}
                  render={({ field }) => (
                    <RecipientCombo
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      recipients={recipients}
                    />
                  )}
                />
                {errors.user && <p className="text-xs text-red-400 mt-1">{errors.user.message}</p>}
              </div>

              <Button type="submit" disabled={!isValid || isSubmitting} className="w-full">
                Continuar
              </Button>
            </>
          )}

          {section === 2 && (
            <>
              <Controller name="currency" control={control} rules={{ required: 'Requerido' }}
                render={({ field }) => (
                  <ComboSelect label="Moneda" searchable={false}
                    options={CURRENCY_OPTIONS} value={field.value} onChange={field.onChange}
                    placeholder="Selecciona moneda" error={errors.currency} />
                )}
              />

              <div className="flex flex-col gap-1">
                <Input
                  icon={<CurrencyDollarIcon className="size-5" />}
                  id="amount" name="amount" type="number" min="0.01" step="0.01"
                  label="Monto" placeholder="0.00"
                  register={{
                    function: register,
                    errors: {
                      function: errors,
                      rules: { required: 'Requerido', min: { value: 0.01, message: 'Mínimo 0.01' }, max: { value: available, message: 'Saldo insuficiente' } },
                    },
                  }}
                />
                <p className="text-xs text-slate-400 text-right">
                  Disponible: <span className="font-semibold text-slate-600 dark:text-slate-300">{availableFormatted}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button color="gray" type="button" variant="outline" onClick={() => setSection(1)}>Volver</Button>
                <Button type="submit" disabled={!isValid || isSubmitting}>Continuar</Button>
              </div>
            </>
          )}

          {section === 3 && (
            <>
              {/* Receipt preview */}
              <div className="bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-700 overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div className="size-11 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      {params.data?.first_name?.[0]}{params.data?.surname_1?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {params.data?.first_name} {params.data?.surname_1}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{params?.email}</p>
                  </div>
                  <ArrowRightIcon className={`size-5 shrink-0 ${txType ? 'text-red-400' : 'text-emerald-400 rotate-180'}`} />
                </div>

                <div className="border-t border-slate-100 dark:border-neutral-700 px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{txType ? 'El beneficiario recibe' : 'Usted recibirá'}</span>
                  <span className={`text-lg font-bold ${txType ? 'text-red-500' : 'text-emerald-500'}`}>
                    {fmt(params?.amount, params?.currency)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button color="gray" type="button" variant="outline" onClick={() => setSection(2)}>Volver</Button>
                <Button color="green" type="submit" disabled={!isValid || isSubmitting}>
                  {txType ? 'Enviar' : 'Solicitar'}
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </>
  );
};

const WithdrawModal = ({ open, setOpen, onSuccess }) => {
  const { register, handleSubmit, reset, control, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' });
  const [bankAccounts, setBankAccounts] = useState([]);
  const dispatch = useDispatch();
  const account = useSelector((state) => state.account);
  const { rate } = useSelector((state) => state.currency);

  const selectedCurrency = useWatch({ control, name: 'currency', defaultValue: 'COP' });

  const available = selectedCurrency === 'USD' && rate
    ? account.balance_available / rate
    : account.balance_available ?? 0;

  const availableFormatted = new Intl.NumberFormat(selectedCurrency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency: selectedCurrency, maximumFractionDigits: 2,
  }).format(available);

  useEffect(() => {
    if (open) api.get('/api/v1/bank-accounts').then(r => setBankAccounts(r.data)).catch(appError);
  }, [open]);

  const submit = async (data) => {
    dispatch(setLoad(false));
    try {
      await api.post('/api/v1/withdrawals', { ...data, bankAccountId: Number(data.bankAccountId) });
      reset();
      setOpen(false);
      onSuccess?.();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Solicitud enviada', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  return (
    <Modal open={open} setOpen={setOpen} title="Solicitar retiro" className="grid gap-6">
      {bankAccounts.length === 0
        ? <p className="text-sm text-slate-400">Primero agrega una cuenta bancaria en la sección Cuentas bancarias.</p>
        : (
          <form onSubmit={handleSubmit(submit)} className="grid gap-4">
            <Controller name="bankAccountId" control={control} rules={{ required: 'Requerido' }}
              render={({ field }) => (
                <ComboSelect label="Cuenta bancaria" searchable={false}
                  options={bankAccounts.map(acc => ({ value: String(acc.id), label: acc.bank_name, subtitle: acc.account_number }))}
                  value={field.value} onChange={field.onChange}
                  placeholder="Selecciona cuenta" error={errors.bankAccountId} />
              )} />
            <Controller name="currency" control={control} rules={{ required: 'Requerido' }}
              render={({ field }) => (
                <ComboSelect label="Moneda" searchable={false}
                  options={CURRENCY_OPTIONS} value={field.value} onChange={field.onChange}
                  placeholder="Selecciona moneda" error={errors.currency} />
              )} />
            <div className="flex flex-col gap-1">
              <Input icon={<CurrencyDollarIcon className="size-6" />} id="w_amount" name="amount"
                type="number" min="1" step="0.01" label="Monto" placeholder="0.00"
                register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', min: { value: 1, message: 'Mínimo 1' }, max: { value: available, message: 'Saldo insuficiente' } } } }} />
              <span className="text-xs text-slate-400 text-right">
                Disponible: <span className="font-medium text-slate-600 dark:text-slate-300">{availableFormatted}</span>
              </span>
            </div>
            <Button type="submit" disabled={!isValid || isSubmitting}>Solicitar retiro</Button>
          </form>
        )
      }
    </Modal>
  );
};

export const BalanceCard = ({ balance = 0 }) => {
  const [show, setShow] = useState(() => localStorage.getItem('balanceVisible') !== 'false');
  const [chargeModal, setChargeModal] = useState(false);
  const [txType, setTxType] = useState(false);
  const [sendOrRequestModal, setSendOrRequestModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const dispatch = useDispatch();

  const { format, formatRef, toggle, preference } = useCurrency();

  const handleShow = () => {
    const next = !show;
    setShow(next);
    localStorage.setItem('balanceVisible', next);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 flex flex-col gap-8 justify-between text-white min-h-64"
      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)' }}
    >
      <div className="absolute -right-8 -top-8 size-48 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute right-12 bottom-0 size-32 rounded-full bg-black/10 pointer-events-none" />
      <div className="absolute -left-6 bottom-8 size-28 rounded-full bg-white/10 pointer-events-none" />

      <ChargeModal open={chargeModal} setOpen={setChargeModal} />
      <SendOrRequestModal open={sendOrRequestModal} setOpen={setSendOrRequestModal} txType={txType} />
      <WithdrawModal open={withdrawModal} setOpen={setWithdrawModal} onSuccess={() => { dispatch(accountThunk()); dispatch(activityThunk()); }} />

      <div className="relative flex flex-col gap-3">
        <div className="flex justify-between items-center gap-4">
          <span className="text-sm font-medium text-white/70 tracking-wide uppercase">Saldo disponible</span>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="text-xs font-semibold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full">
              {preference === 'COP' ? 'USD' : 'COP'}
            </button>
            <button onClick={handleShow} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
              {show ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-4xl lg:text-5xl font-bold tracking-tight">
            {show ? format(balance) : '••••••'}
          </span>
          {show && preference === 'COP' && formatRef(balance) && (
            <span className="text-sm text-white/60">≈ {formatRef(balance)}</span>
          )}
        </div>
      </div>

      <div className="relative grid grid-cols-4 gap-2">
        {[
          { icon: <PlusIcon className="size-5" />, label: 'Cargar', onClick: () => setChargeModal(true) },
          { icon: <ArrowTurnUpRightIcon className="size-5" />, label: 'Enviar', onClick: () => { setSendOrRequestModal(true); setTxType(true); } },
          { icon: <ArrowTurnDownLeftIcon className="size-5" />, label: 'Solicitar', onClick: () => { setSendOrRequestModal(true); setTxType(false); } },
          { icon: <MinusIcon className="size-5" />, label: 'Retirar', onClick: () => setWithdrawModal(true) },
        ].map(({ icon, label, onClick }) => (
          <button key={label} onClick={onClick}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/30 transition-colors">
            {icon}
            <span className="text-xs font-medium text-white/90">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
