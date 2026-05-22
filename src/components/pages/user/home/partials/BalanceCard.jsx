import { ArrowTurnDownLeftIcon, ArrowTurnUpRightIcon, CheckIcon, MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { ArrowRightIcon, CurrencyDollarIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, TagIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
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
            ${current > i + 1 ? 'bg-green-500 text-white' : current === i + 1 ? 'bg-green-500 text-white ring-4 ring-green-100 dark:ring-green-900/40' : 'bg-gray-100 dark:bg-zinc-700 text-gray-400'}`}>
            {current > i + 1 ? <CheckIcon className="size-4" /> : i + 1}
          </div>
          <span className={`text-xs font-medium whitespace-nowrap ${current >= i + 1 ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}`}>
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${current > i + 1 ? 'bg-green-500' : 'bg-gray-100 dark:bg-zinc-700'}`} />
        )}
      </div>
    ))}
  </div>
);

const fmt = (amount, currency) =>
  new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency: currency || 'COP', maximumFractionDigits: 2,
  }).format(amount);

const ChargeModal = ({ open, setOpen }) => (
  <Modal open={open} setOpen={setOpen} title="Cargar fondos" />
);

export const SendOrRequestModal = ({ open, setOpen, txType }) => {
  const { register, handleSubmit, reset, control, formState: { errors, isValid } } = useForm({
    mode: 'onChange', defaultValues: { currency: 'COP' },
  });
  const [section, setSection] = useState(1);
  const [params, setParams] = useState({});
  const [type, setType] = useState(1);
  const [completedTx, setCompletedTx] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

  const handleClose = () => {
    setOpen(false);
    setSection(1);
    setType(1);
    reset();
  };

  const submit = async (data) => {
    dispatch(setLoad(false));
    const url = `/api/v1/transfers/${txType ? 'send' : 'request'}`;
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
              <div className="flex rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
                {[{ label: 'Correo', val: 1 }, { label: 'Apodo', val: 2 }].map(({ label, val }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setType(val)}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors
                      ${type === val
                        ? 'bg-green-500 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <Input
                icon={type === 1 ? <EnvelopeIcon className="size-5" /> : <TagIcon className="size-5" />}
                id="user" name="user"
                type={type === 1 ? 'email' : 'text'}
                label={type === 1 ? 'Correo electrónico' : 'Nombre de usuario'}
                placeholder={type === 1 ? 'usuario@dominio.com' : 'apodo'}
                register={{
                  function: register,
                  errors: {
                    function: errors,
                    rules: {
                      required: 'Requerido',
                      validate: {
                        isEmailValid: (v) => type !== 1 || isEmailValid(v) || 'Correo inválido',
                      },
                    },
                  },
                }}
              />

              <Button type="submit" disabled={!isValid} className="w-full">
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
                <p className="text-xs text-gray-400 text-right">
                  Disponible: <span className="font-semibold text-gray-600 dark:text-gray-300">{availableFormatted}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button color="gray" type="button" variant="outline" onClick={() => setSection(1)}>Volver</Button>
                <Button type="submit" disabled={!isValid}>Continuar</Button>
              </div>
            </>
          )}

          {section === 3 && (
            <>
              {/* Receipt preview */}
              <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div className="size-11 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400 uppercase">
                      {params.data?.first_name?.[0]}{params.data?.surname_1?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {params.data?.first_name} {params.data?.surname_1}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{params?.email}</p>
                  </div>
                  <ArrowRightIcon className={`size-5 shrink-0 ${txType ? 'text-red-400' : 'text-green-400 rotate-180'}`} />
                </div>

                <div className="border-t border-gray-100 dark:border-zinc-700 px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{txType ? 'El beneficiario recibe' : 'Usted recibirá'}</span>
                  <span className={`text-lg font-bold ${txType ? 'text-red-500' : 'text-green-500'}`}>
                    {fmt(params?.amount, params?.currency)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button color="gray" type="button" variant="outline" onClick={() => setSection(2)}>Volver</Button>
                <Button color="green" type="submit" disabled={!isValid}>
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
  const { register, handleSubmit, reset, control, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
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
        ? <p className="text-sm text-gray-400">Primero agrega una cuenta bancaria en la sección Cuentas bancarias.</p>
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
              <span className="text-xs text-gray-400 text-right">
                Disponible: <span className="font-medium text-gray-600 dark:text-gray-300">{availableFormatted}</span>
              </span>
            </div>
            <Button type="submit" disabled={!isValid}>Solicitar retiro</Button>
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
    <div className="rounded-2xl p-4 flex flex-col gap-6 justify-between text-white bg-green-500/80 bg-cover bg-center min-h-64"
      style={{ backgroundImage: 'url(img/card-bg-1.svg)' }}
    >
      <ChargeModal open={chargeModal} setOpen={setChargeModal} />
      <SendOrRequestModal open={sendOrRequestModal} setOpen={setSendOrRequestModal} txType={txType} />
      <WithdrawModal open={withdrawModal} setOpen={setWithdrawModal} onSuccess={() => { dispatch(accountThunk()); dispatch(activityThunk()); }} />

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center gap-4">
          <span className="font-medium text-xl">Saldo disponible</span>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="text-xs font-semibold bg-white/20 hover:bg-white/30 transition-colors px-2 py-1 rounded-full">
              {preference === 'COP' ? 'Ver en USD' : 'Ver en COP'}
            </button>
            <button onClick={handleShow}>
              {show ? <EyeSlashIcon className="size-6" /> : <EyeIcon className="size-6" />}
            </button>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Balance</span>
          <div className="font-semibold flex flex-col">
            <span className="text-3xl lg:text-5xl">{show ? format(balance) : '******'}</span>
            {show && preference === 'COP' && formatRef(balance) && (
              <span className="text-sm font-medium opacity-75 mt-1">≈ {formatRef(balance)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-medium text-sm">
        <button className="flex flex-col items-center gap-1" onClick={() => setChargeModal(!chargeModal)}>
          <div className="bg-green-600 hover:bg-green-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
            <PlusIcon className="size-6" />
          </div>
          <span>Cargar</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => { setSendOrRequestModal(true); setTxType(true); }}>
          <div className="bg-green-600 hover:bg-green-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
            <ArrowTurnUpRightIcon className="size-6" />
          </div>
          <span>Enviar</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => { setSendOrRequestModal(true); setTxType(false); }}>
          <div className="bg-green-600 hover:bg-green-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
            <ArrowTurnDownLeftIcon className="size-6" />
          </div>
          <span>Solicitar</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => setWithdrawModal(!withdrawModal)}>
          <div className="bg-green-600 hover:bg-green-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
            <MinusIcon className="size-6" />
          </div>
          <span>Retirar</span>
        </button>
      </div>
    </div>
  );
};
