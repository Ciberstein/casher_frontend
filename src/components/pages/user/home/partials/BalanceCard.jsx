import { ArrowTurnDownLeftIcon, ArrowTurnUpRightIcon, CheckIcon, ChevronUpDownIcon, MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { ArrowRightIcon, CurrencyDollarIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, TagIcon } from '@heroicons/react/24/outline'
import { FileUpload } from '../../../../elements/user/FileUpload'
import { useState, useEffect, useMemo } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ComboSelect } from '../../../../elements/user/ComboSelect'
import useCurrency from '../../../../../hooks/useCurrency'
import Modal from '../../../../elements/user/Modal'
import ManageTxModal from '../../transactions/partials/ManageTxModal'
import { Button } from '../../../../elements/user/Button'
import { Input } from '../../../../elements/user/Input'
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
            ${current > i + 1 ? 'bg-ink text-reverse' : current === i + 1 ? 'bg-ink text-reverse ring-4 ring-sello/25' : 'bg-sunken text-faint'}`}>
            {current > i + 1 ? <CheckIcon className="size-4" /> : i + 1}
          </div>
          <span className={`text-xs font-medium whitespace-nowrap ${current >= i + 1 ? 'text-ink' : 'text-faint'}`}>
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${current > i + 1 ? 'bg-sello' : 'bg-sunken'}`} />
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
      <label className="text-sm text-muted">Destinatario</label>
      <Combobox
        value={value}
        onChange={(val) => { onChange(val); setQuery(''); }}
        onClose={() => setQuery('')}
      >
        <div className="flex gap-2 items-center border-transparent border rounded-xl bg-sunken p-2">
          <span className="text-muted shrink-0">{icon}</span>
          <ComboboxInput
            className="bg-transparent w-full placeholder:text-muted focus-visible:outline-none text-ink text-md"
            placeholder="usuario@dominio.com o @apodo"
            displayValue={(v) => v ?? ''}
            onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); }}
          />
          {recipients.length > 0 && (
            <ComboboxButton className="shrink-0">
              <ChevronUpDownIcon className="size-5 text-faint" />
            </ComboboxButton>
          )}
        </div>
        {filtered.length > 0 && (
          <ComboboxOptions className="absolute z-50 w-full mt-1 max-h-52 overflow-y-auto rounded-xl bg-surface shadow-xl border border-line p-1">
            {filtered.map(r => {
              const rec = r.recipient;
              const name = `${rec.data?.first_name ?? ''} ${rec.data?.surname_1 ?? ''}`.trim() || rec.username;
              const initials = [rec.data?.first_name, rec.data?.surname_1].filter(Boolean).map(s => s[0]).join('').toUpperCase() || rec.username?.[0]?.toUpperCase();
              return (
                <ComboboxOption
                  key={r.id}
                  value={rec.email}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer select-none data-[focus]:bg-sunken transition-colors"
                >
                  <div className="size-8 rounded-full shrink-0 overflow-hidden bg-sello-soft flex items-center justify-center">
                    {rec.picture
                      ? <img src={rec.picture} className="size-full object-cover" />
                      : <span className="text-xs font-bold text-sello-ink">{initials}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted truncate">{name}</p>
                    <p className="text-xs text-faint truncate">@{rec.username} · {rec.email}</p>
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

  return (
    <Modal open={open} setOpen={handleClose} title="Cargar fondos" className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        Realiza una transferencia a una de las cuentas de la app y adjunta el comprobante. El saldo será acreditado tras la verificación.
      </p>

      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <Controller name="appBankAccountId" control={control} rules={{ required: 'Requerido' }}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">¿A cuál cuenta depositaste?</label>
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
                          ? 'border-sello bg-sello-soft'
                          : 'border-line bg-sunken hover:border-rule'
                        }`}
                    >
                      <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                        ${selected ? 'border-sello bg-sello' : 'border-rule'}`}>
                        {selected && <CheckIcon className="size-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink">{acc.bank_name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-sello-soft text-sello-ink font-medium shrink-0">
                            {ACCOUNT_TYPE_LABEL[acc.account_type]}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-muted mt-0.5">{acc.account_number}</p>
                        <p className="text-xs text-faint mt-0.5">{acc.owner_name}</p>
                        {acc.documentType && (
                          <p className="text-xs text-faint">{acc.documentType.abbreviation}: {acc.document_number}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              {errors.appBankAccountId && (
                <p className="text-xs text-salida">{errors.appBankAccountId.message}</p>
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
  const { format } = useCurrency();
  const selectedCurrency = useWatch({ control, name: 'currency', defaultValue: 'COP' });

  const available = account.balances?.[selectedCurrency] ?? 0;

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
                {errors.user && <p className="text-xs text-salida mt-1">{errors.user.message}</p>}
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
                <p className="text-xs text-faint text-right">
                  Disponible: <span className="font-semibold text-muted">{format(available, selectedCurrency)}</span>
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
              <div className="bg-surface rounded-2xl border border-line overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div className="size-11 rounded-full bg-sello-soft flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-sello-ink uppercase">
                      {params.data?.first_name?.[0]}{params.data?.surname_1?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm truncate">
                      {params.data?.first_name} {params.data?.surname_1}
                    </p>
                    <p className="text-xs text-faint truncate">{params?.email}</p>
                  </div>
                  <ArrowRightIcon className={`size-5 shrink-0 ${txType ? 'text-salida' : 'text-entrada rotate-180'}`} />
                </div>

                <div className="border-t border-line px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-muted">{txType ? 'El beneficiario recibe' : 'Usted recibirá'}</span>
                  <span className={`text-lg font-bold ${txType ? 'text-salida' : 'text-sello'}`}>
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
  const { format } = useCurrency();

  const selectedCurrency = useWatch({ control, name: 'currency', defaultValue: 'COP' });
  const available = account.balances?.[selectedCurrency] ?? 0;

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
        ? <p className="text-sm text-faint">Primero agrega una cuenta bancaria en la sección Cuentas bancarias.</p>
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
              <span className="text-xs text-faint text-right">
                Disponible: <span className="font-medium text-muted">{format(available, selectedCurrency)}</span>
              </span>
            </div>
            <Button type="submit" disabled={!isValid || isSubmitting}>Solicitar retiro</Button>
          </form>
        )
      }
    </Modal>
  );
};

/** Selector de moneda sobre la hoja: discreto, del color del reverso. */
const CardCurrencySelect = ({ currencies, value, onChange }) => (
  <Listbox value={value} onChange={onChange}>
    <ListboxButton className="figure flex items-center gap-1 rounded border border-reverse/25 px-2 py-1
      text-[0.6875rem] font-medium tracking-stamp text-reverse/85 transition-colors hover:border-reverse/50">
      {value}
      <ChevronUpDownIcon className="size-3.5 opacity-70" />
    </ListboxButton>
    <ListboxOptions
      anchor="bottom end"
      className="z-50 mt-1 min-w-[84px] rounded-lg border border-line bg-surface p-1 shadow-xl focus:outline-none"
    >
      {currencies.map(c => (
        <ListboxOption
          key={c}
          value={c}
          className="flex cursor-pointer select-none items-center justify-between gap-2 rounded px-3 py-2
            transition-colors data-[focus]:bg-sunken"
        >
          <span className="figure text-sm font-medium text-ink">{c}</span>
          {value === c && <CheckIcon className="size-3.5 text-sello" />}
        </ListboxOption>
      ))}
    </ListboxOptions>
  </Listbox>
)

/**
 * La cuenta principal se imprime en negativo: siempre al revés de la página,
 * como un tiquete recién salido de la caja sobre el escritorio.
 */
export const BalanceCard = ({ balances = {} }) => {
  const [show, setShow] = useState(() => localStorage.getItem('balanceVisible') !== 'false');
  const [chargeModal, setChargeModal] = useState(false);
  const [txType, setTxType] = useState(false);
  const [sendOrRequestModal, setSendOrRequestModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const dispatch = useDispatch();

  const { format } = useCurrency();
  const currencies = Object.keys(balances);
  const [selectedCurrency, setSelectedCurrency] = useState(() => currencies[0] || 'COP');

  useEffect(() => {
    const keys = Object.keys(balances);
    if (keys.length > 0 && !balances[selectedCurrency]) setSelectedCurrency(keys[0]);
  }, [balances]);

  const handleShow = () => {
    const next = !show;
    setShow(next);
    localStorage.setItem('balanceVisible', next);
  };

  const actions = [
    { icon: <PlusIcon className="size-[1.15rem]" />,              label: 'Cargar',    onClick: () => setChargeModal(true) },
    { icon: <ArrowTurnUpRightIcon className="size-[1.15rem]" />,  label: 'Enviar',    onClick: () => { setSendOrRequestModal(true); setTxType(true); } },
    { icon: <ArrowTurnDownLeftIcon className="size-[1.15rem]" />, label: 'Solicitar', onClick: () => { setSendOrRequestModal(true); setTxType(false); } },
    { icon: <MinusIcon className="size-[1.15rem]" />,             label: 'Retirar',   onClick: () => setWithdrawModal(true) },
  ];

  return (
    <div className="relative flex min-h-64 flex-col justify-between rounded-t-2xl bg-ink pb-5 text-reverse tear-b">
      <ChargeModal open={chargeModal} setOpen={setChargeModal} />
      <SendOrRequestModal open={sendOrRequestModal} setOpen={setSendOrRequestModal} txType={txType} />
      <WithdrawModal
        open={withdrawModal}
        setOpen={setWithdrawModal}
        onSuccess={() => { dispatch(accountThunk()); dispatch(activityThunk()); }}
      />

      <div className="flex flex-col gap-4 px-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <span className="eyebrow !text-reverse/55">Saldo disponible</span>
          <div className="flex items-center gap-1.5">
            {currencies.length > 1 && (
              <CardCurrencySelect currencies={currencies} value={selectedCurrency} onChange={setSelectedCurrency} />
            )}
            <button
              onClick={handleShow}
              aria-label={show ? 'Ocultar saldo' : 'Mostrar saldo'}
              className="rounded p-1.5 text-reverse/70 transition-colors hover:bg-reverse/10 hover:text-reverse"
            >
              {show ? <EyeSlashIcon className="size-[1.15rem]" /> : <EyeIcon className="size-[1.15rem]" />}
            </button>
          </div>
        </div>

        <p className="figure animate-print-in text-[2.25rem] font-semibold leading-none tracking-tight lg:text-[2.75rem]">
          {show ? format(balances[selectedCurrency] ?? 0, selectedCurrency) : '••••••'}
        </p>
      </div>

      <div className="px-6 pt-6">
        <div className="perf opacity-40" />
        <div className="mt-4 grid grid-cols-4 divide-x divide-reverse/15 overflow-hidden rounded-lg border border-reverse/15">
          {actions.map(({ icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center gap-1.5 py-3 text-reverse/85 transition-colors
                hover:bg-reverse/10 hover:text-reverse active:bg-reverse/15"
            >
              {icon}
              <span className="text-[0.6875rem] font-medium font-semiwide">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
