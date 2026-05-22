
import { ArrowTurnDownLeftIcon, ArrowTurnUpRightIcon, MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { CheckBadgeIcon, CurrencyDollarIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, TagIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { ComboSelect } from '../../../../elements/user/ComboSelect'
import useCurrency from '../../../../../hooks/useCurrency'
import Modal from '../../../../elements/user/Modal'
import { Button } from '../../../../elements/user/Button'
import { Input } from '../../../../elements/user/Input'
import isEmailValid from '../../../../../utils/isEmailValid'
import { useDispatch, useSelector } from 'react-redux'
import { setLoad } from '../../../../../store/slices/loader.slice'
import api from '../../../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../../../utils/appError'
import { accountThunk } from '../../../../../store/slices/account.slice'
import { transactionsThunk } from '../../../../../store/slices/transactions.slice'
import { activityThunk } from '../../../../../store/slices/activity.slice'

const CURRENCY_OPTIONS = [
  { value: 'COP', label: 'COP' },
  { value: 'USD', label: 'USD' },
];

const ChargeModal = ({ open, setOpen }) => {
  return (
    <Modal open={open} setOpen={setOpen} title="Cargar fondos">

    </Modal>
  )
}

const SendOrRequestModal = ({ open, setOpen, txType }) => {

  const { register, handleSubmit, reset, control, formState: { errors, isValid } } = useForm({ mode: 'onChange', defaultValues: { currency: 'COP' } });
  const [success, setSuccess] = useState(false);
  const [section, setSection] = useState(1);
  const [params, setParams] = useState({});
  const [type, setType] = useState(1);

  const { format } = useCurrency();
  const dispatch = useDispatch();
  const account = useSelector((state) => state.account);
  const { rate } = useSelector((state) => state.currency);
  const selectedCurrency = useWatch({ control, name: 'currency', defaultValue: 'COP' });

  const available = selectedCurrency === 'USD' && rate
    ? (account.balance_available / rate)
    : account.balance_available ?? 0;

  const availableFormatted = new Intl.NumberFormat(selectedCurrency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency: selectedCurrency, maximumFractionDigits: 2,
  }).format(available);

  const submit = async (data) => {
    dispatch(setLoad(false));
    const url = `/api/v1/transactions/${txType ? 'send' : 'request'}`;
    const formData = data;
    formData.type = type;
    formData.confirmation = section == 3 ? true : false;

    await api.post(url, formData)
      .then((res) => {
        if(res.status == 200) {
          setSection(2);
        }
        else if(res.status == 201) {
          setParams(res.data)
          setSection(3);
        }
        else if(res.status == 202) {
          reset();
          setType(1);
          setOpen(false);
          setSection(1);
          setSuccess(true);
          dispatch(accountThunk());
          dispatch(transactionsThunk());
          dispatch(activityThunk());
        }
      })
      .catch((err) => {
        appError(err);
        Swal.fire({
          toast: true,
          position: 'bottom-right',
          icon: 'error',
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
        });
      })
      .finally(() => dispatch(setLoad(true)))
  };

  return (
    <>
      <Modal open={success} setOpen={setSuccess} className="flex flex-col gap-10 items-center" header={false}>
        <CheckBadgeIcon className="size-32 text-green-500" />
        <div className="flex flex-col px-8 text-xl font-medium items-center">
          <h1>Has {txType ? 'enviado' : 'solicitado'}</h1>
          <h1>{new Intl.NumberFormat(params.currency === 'USD' ? 'en-US' : 'es-CO', { style: 'currency', currency: params.currency || 'COP', maximumFractionDigits: 2 }).format(params.amount)}</h1>
          <h1>a {params.email}</h1>
        </div>
        <Button className="w-full" onClick={() => setSuccess(false)}>
          Aceptar
        </Button>
      </Modal>
      <Modal open={open} setOpen={setOpen} title={`${txType ? 'Enviar' : 'Solicitar' } fondos`} className="grid grid-cols-1 gap-6">
        <header className="grid grid-cols-1 items-center relative gap-4">
          <div className="grid grid-cols-3 items-center relative">
            <div className="w-full flex justify-center z-10">
              <div 
                className={`p-2 size-10 sm:p-3 sm:size-12 rounded-full text-center text-white 
                  ${section >= 1 ? 'bg-blue-500' : 'bg-gray-400' }`}
                >
                <span className="font-medium">1</span>
              </div>            
            </div>
            <div className="w-full flex justify-center z-10">
              <div 
                className={`p-2 size-10 sm:p-3 sm:size-12 rounded-full text-center text-white 
                  ${section >= 2 ? 'bg-blue-500' : 'bg-gray-400' }`}
                >
                <span className="font-medium">2</span>
              </div>
            </div>
            <div className="w-full flex justify-center z-10">
              <div 
                className={`p-2 size-10 sm:p-3 sm:size-12 rounded-full text-center text-white 
                  ${section == 3 ? 'bg-blue-500' : 'bg-gray-400' }`}
                >
                <span className="font-medium">3</span>
              </div>
            </div>
            <div className="h-2 bg-gray-400 absolute w-full rounded-full overflow-hidden">
              <div className={`bg-blue-500 ${section == 2 ? 'w-1/2' : section == 3 ? 'w-full' : 'w-1/5' } h-full`}></div>
            </div>          
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium text-center text-xs sm:text-sm">Usuario</span>
            <span className="font-medium text-center text-xs sm:text-sm">Monto</span>
            <span className="font-medium text-center text-xs sm:text-sm">Confirmación</span>
          </div>
        </header>

        <form className="grid col-span-1 gap-6" onSubmit={handleSubmit(submit)}>
          { section == 1 &&
            <>
              <nav className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Button 
                  type="button"
                  variant={type == 1 ? "normal" : "outline"}
                  onClick={() => setType(1)}
                >
                  Email
                </Button>
                <Button 
                  type="button"
                  variant={type == 2 ? "normal" : "outline"}
                  onClick={() => setType(2)}
                >
                  Apodo
                </Button>
              </nav>
              <Input
                icon={
                  type == 1 ?
                  <EnvelopeIcon className="size-6"/> :
                  <TagIcon className="size-6" />
                }
                id="user"
                name="user"
                type={ type == 1 ? "email" : "text" }
                placeholder={ type == 1 ? "username@domain.com" : "Username" }
                register={{
                  function: register,
                  errors: {
                    function: errors,
                    rules: {
                      required: type == 1 ? 'Email is required' : 'ID is required',
                      validate: {
                        isEmailValid: (value) => {
                          if(type == 1) {
                            if (!isEmailValid(value)) {
                              return 'Invalid email format';
                            }
                          }
                          return true;
                        },
                      },
                    },
                  },
                }}
              />
              <Button type="submit" disabled={!isValid}>
                Continuar
              </Button>
            </>
          }
          { section == 2 &&
            <>
              <Controller name="currency" control={control} rules={{ required: 'Requerido' }}
                render={({ field }) => (
                  <ComboSelect label="Moneda" searchable={false}
                    options={CURRENCY_OPTIONS} value={field.value} onChange={field.onChange}
                    placeholder="Selecciona moneda" error={errors.currency} />
                )} />
              <div className="flex flex-col gap-1">
                <Input
                  icon={<CurrencyDollarIcon className="size-6"/>}
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  label="Monto"
                  placeholder="0.00"
                  register={{
                    function: register,
                    errors: {
                      function: errors,
                      rules: {
                        required: 'Requerido',
                        min: { value: 0.01, message: 'Mínimo 0.01' },
                        max: { value: available, message: 'Saldo insuficiente' },
                      },
                    },
                  }}
                />
                <span className="text-xs text-gray-400 text-right">
                  Disponible: <span className="font-medium text-gray-600 dark:text-gray-300">{availableFormatted}</span>
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <Button color="gray" type="button" variant="outline" onClick={() => setSection(1)}>
                  Volver
                </Button>
                <Button type="submit" disabled={!isValid}>
                  Continuar
                </Button>
              </div>
            </>
          }
          { section == 3 &&
            <>
              <div className="border dark:border-gray-500 rounded-lg flex flex-col">
                <div className="flex gap-4 items-center p-3">
                  <div className="size-10 rounded-full border flex flex-col justify-center items-center bg-slate-200">
                    <span className="text-lg text-zinc-500 uppercase font-medium">
                      {params.data?.first_name.split("")[0]}
                      {params.data?.surname_1.split("")[0]}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{params?.email}</span>
                    <span className="text-gray-400 text-sm">{`Apodo: ${params?.username}`}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 border-t dark:border-gray-500">
                  <span className="text-gray-400 text-sm">{txType ? 'El beneficiario' : 'Usted'} recibe</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat(params?.currency === 'USD' ? 'en-US' : 'es-CO', {
                      style: 'currency', currency: params?.currency || 'COP', maximumFractionDigits: 2,
                    }).format(params?.amount)}
                  </span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <Button color="gray" type="button" variant="outline" onClick={() => setSection(2)}>
                  Volver
                </Button>
                <Button color="green" type="submit" disabled={!isValid}>
                  Confirmar
                </Button>
              </div>
            </>
          }
        </form>
      </Modal>
    </>
  )
}

const WithdrawModal = ({ open, setOpen, onSuccess }) => {
  const { register, handleSubmit, reset, control, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const [bankAccounts, setBankAccounts] = useState([]);
  const dispatch = useDispatch();
  const account = useSelector((state) => state.account);
  const { rate } = useSelector((state) => state.currency);

  const selectedCurrency = useWatch({ control, name: 'currency', defaultValue: 'COP' });

  const available = selectedCurrency === 'USD' && rate
    ? (account.balance_available / rate)
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
      style={{
        backgroundImage: 'url(img/card-bg-1.svg)'
      }}
    >
      <ChargeModal open={chargeModal} setOpen={setChargeModal} />
      <SendOrRequestModal open={sendOrRequestModal} setOpen={setSendOrRequestModal} txType={txType} />
      <WithdrawModal open={withdrawModal} setOpen={setWithdrawModal} onSuccess={() => { dispatch(accountThunk()); dispatch(activityThunk()); }} />
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center gap-4">
          <span className="font-medium text-xl">
            Saldo disponible
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="text-xs font-semibold bg-white/20 hover:bg-white/30 transition-colors px-2 py-1 rounded-full"
            >
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
            <span className="text-3xl lg:text-5xl">
              {show ? format(balance) : '******'}
            </span>
            {show && preference === 'COP' && formatRef(balance) && (
              <span className="text-sm font-medium opacity-75 mt-1">
                ≈ {formatRef(balance)}
              </span>
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
        <button className="flex flex-col items-center gap-1" onClick={() => { setSendOrRequestModal(!sendOrRequestModal); setTxType(true) }}>
          <div className="bg-green-600 hover:bg-green-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
            <ArrowTurnUpRightIcon className="size-6" />
          </div>
          <span>Enviar</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => { setSendOrRequestModal(!sendOrRequestModal); setTxType(false) }}>
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
  )
}
