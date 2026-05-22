
import { ArrowTurnDownLeftIcon, PlusIcon } from '@heroicons/react/20/solid'
import { EyeIcon, EyeSlashIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { useState, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller, useWatch } from 'react-hook-form'
import useCurrency from '../../../../../hooks/useCurrency'
import { LoanRequestModal } from '../../requests/Requests'
import { accountThunk } from '../../../../../store/slices/account.slice'
import { activityThunk } from '../../../../../store/slices/activity.slice'
import Modal from '../../../../elements/user/Modal'
import { Input } from '../../../../elements/user/Input'
import { Button } from '../../../../elements/user/Button'
import { ComboSelect } from '../../../../elements/user/ComboSelect'
import { setLoad } from '../../../../../store/slices/loader.slice'
import api from '../../../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../../../utils/appError'

const CURRENCY_OPTIONS = [
  { value: 'COP', label: 'COP' },
  { value: 'USD', label: 'USD' },
];

const PayModal = ({ open, setOpen, pendingBalance, onSuccess }) => {
  const { register, handleSubmit, reset, control, formState: { errors, isValid } } = useForm({ mode: 'onChange', defaultValues: { currency: 'COP' } });
  const dispatch = useDispatch();
  const account = useSelector((state) => state.account);
  const { rate } = useSelector((state) => state.currency);

  const selectedCurrency = useWatch({ control, name: 'currency', defaultValue: 'COP' });

  const available = selectedCurrency === 'USD' && rate
    ? account.balance_available / rate
    : account.balance_available ?? 0;

  const pending = selectedCurrency === 'USD' && rate
    ? pendingBalance / rate
    : pendingBalance ?? 0;

  const maxAmount = Math.min(available, pending);

  const fmt = (val) => new Intl.NumberFormat(selectedCurrency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency: selectedCurrency, maximumFractionDigits: 2,
  }).format(val);

  const submit = async (data) => {
    dispatch(setLoad(false));
    try {
      await api.post('/api/v1/auth/pay', { amount: Number(data.amount), currency: data.currency });
      reset();
      setOpen(false);
      onSuccess();
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Abono realizado con éxito', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      appError(err);
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000 });
    } finally { dispatch(setLoad(true)); }
  };

  return (
    <Modal open={open} setOpen={setOpen} title="Abonar a deuda" className="grid gap-6">
      <form onSubmit={handleSubmit(submit)} className="grid gap-4">
        <Controller name="currency" control={control} rules={{ required: 'Requerido' }}
          render={({ field }) => (
            <ComboSelect label="Moneda" searchable={false} options={CURRENCY_OPTIONS}
              value={field.value} onChange={field.onChange}
              placeholder="Selecciona moneda" error={errors.currency} />
          )} />
        <div className="flex flex-col gap-1">
          <Input icon={<CurrencyDollarIcon className="size-6" />} id="pay_amount" name="amount"
            label="Monto a abonar" type="number" min="0.01" step="0.01" placeholder="0.00"
            register={{ function: register, errors: { function: errors, rules: {
              required: 'Requerido',
              min: { value: 0.01, message: 'Mínimo 0.01' },
              validate: {
                noExceedAvailable: (v) => Number(v) <= available || `Máximo disponible: ${fmt(available)}`,
                noExceedDebt:      (v) => Number(v) <= pending   || `Máximo adeudado: ${fmt(pending)}`,
              },
            }}}} />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Deuda pendiente: <span className="font-medium text-gray-600 dark:text-gray-300">{fmt(pending)}</span></span>
            <span>Disponible: <span className="font-medium text-gray-600 dark:text-gray-300">{fmt(available)}</span></span>
          </div>
        </div>
        <Button type="submit" color="green" disabled={!isValid}>Abonar</Button>
      </form>
    </Modal>
  );
};

export const DebitCard = ({ balance = 0 }) => {

  const [show, setShow] = useState(() => localStorage.getItem('pendingBalanceVisible') !== 'false');
  const [loanModal, setLoanModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const { format, formatRef, preference } = useCurrency();
  const dispatch = useDispatch();

  const handleShow = () => {
    const next = !show;
    setShow(next);
    localStorage.setItem('pendingBalanceVisible', next);
  };

  const onSuccess = () => { dispatch(accountThunk()); dispatch(activityThunk()); };

  return (
    <Fragment>
      <LoanRequestModal open={loanModal} setOpen={setLoanModal} onSuccess={onSuccess} />
      <PayModal open={payModal} setOpen={setPayModal} pendingBalance={balance} onSuccess={onSuccess} />
      <div className="rounded-2xl p-4 flex flex-col gap-6 justify-between text-white bg-orange-500/80 bg-cover bg-center min-h-64"
        style={{ backgroundImage: 'url(img/card-bg-2.svg)' }}
      >
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center gap-4">
            <span className="font-medium text-xl">Saldo pendiente</span>
            <button onClick={handleShow}>
              {show ? <EyeSlashIcon className="size-6" /> : <EyeIcon className="size-6" />}
            </button>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">A pagar</span>
            <div className="font-semibold flex flex-col">
              <span className="text-3xl lg:text-5xl">
                {show ? format(balance) : '******'}
              </span>
              {show && preference === 'COP' && formatRef(balance) && (
                <span className="text-sm font-medium opacity-75 mt-1">≈ {formatRef(balance)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-medium text-sm">
          <button className="flex flex-col items-center gap-1" onClick={() => setLoanModal(true)}>
            <div className="bg-orange-600 hover:bg-orange-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
              <ArrowTurnDownLeftIcon className="size-6" />
            </div>
            <span>Solicitar</span>
          </button>
          {balance > 0 && (
            <button className="flex flex-col items-center gap-1" onClick={() => setPayModal(true)}>
              <div className="bg-orange-600 hover:bg-orange-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
                <PlusIcon className="size-6" />
              </div>
              <span>Abonar</span>
            </button>
          )}
        </div>
      </div>
    </Fragment>
  )
}
