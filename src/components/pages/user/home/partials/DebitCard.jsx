import { ArrowTurnDownLeftIcon, CheckIcon, ChevronUpDownIcon, PlusIcon } from '@heroicons/react/20/solid'
import { EyeIcon, EyeSlashIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, Fragment } from 'react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
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

/** Mismo selector, en versión clara: esta hoja es la copia, no el original. */
const CardCurrencySelect = ({ currencies, value, onChange }) => (
  <Listbox value={value} onChange={onChange}>
    <ListboxButton className="figure flex items-center gap-1 rounded border border-line px-2 py-1
      text-[0.6875rem] font-medium tracking-stamp text-muted transition-colors hover:border-rule hover:text-ink">
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

const PayModal = ({ open, setOpen, pendingPerCurrency, onSuccess }) => {
  const { register, handleSubmit, reset, control, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange', defaultValues: { currency: 'COP' } });
  const dispatch = useDispatch();
  const account = useSelector((state) => state.account);
  const { format } = useCurrency();

  const selectedCurrency = useWatch({ control, name: 'currency', defaultValue: 'COP' });

  const available = account.balances?.[selectedCurrency] ?? 0;
  const pending = pendingPerCurrency?.[selectedCurrency] ?? 0;

  const fmt = (val) => format(val, selectedCurrency);

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
          <div className="flex justify-between text-xs text-faint">
            <span>Deuda pendiente: <span className="font-medium text-muted">{fmt(pending)}</span></span>
            <span>Disponible: <span className="font-medium text-muted">{fmt(available)}</span></span>
          </div>
        </div>
        <Button type="submit" color="green" disabled={!isValid || isSubmitting}>Abonar</Button>
      </form>
    </Modal>
  );
};
/**
 * La deuda es la copia al carbón del saldo: mismo formato, papel hundido,
 * trama diagonal encima. Nunca compite con el original.
 */
export const DebitCard = ({ pending = {} }) => {
  const [loanModal, setLoanModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [show, setShow] = useState(() => localStorage.getItem('pendingBalanceVisible') !== 'false');
  const { format } = useCurrency();
  const dispatch = useDispatch();

  const currencies = Object.keys(pending);
  const hasPending = currencies.length > 0;
  const [selectedCurrency, setSelectedCurrency] = useState(() => currencies[0] || 'COP');

  useEffect(() => {
    const keys = Object.keys(pending);
    if (keys.length > 0 && !pending[selectedCurrency]) setSelectedCurrency(keys[0]);
  }, [pending]);

  const handleShow = () => {
    const next = !show;
    setShow(next);
    localStorage.setItem('pendingBalanceVisible', next);
  };

  const onSuccess = () => { dispatch(accountThunk()); dispatch(activityThunk()); };

  return (
    <Fragment>
      <LoanRequestModal open={loanModal} setOpen={setLoanModal} onSuccess={onSuccess} />
      <PayModal open={payModal} setOpen={setPayModal} pendingPerCurrency={pending} onSuccess={onSuccess} />

      <div className="relative flex min-h-64 flex-col justify-between rounded-t-2xl border border-dashed border-rule
        bg-sunken pb-5 text-ink tear-b">
        <div className="pointer-events-none absolute inset-0 hatch opacity-60" aria-hidden="true" />

        <div className="relative flex flex-col gap-4 px-6 pt-6">
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow">Saldo pendiente</span>
            <div className="flex items-center gap-1.5">
              {currencies.length > 1 && (
                <CardCurrencySelect currencies={currencies} value={selectedCurrency} onChange={setSelectedCurrency} />
              )}
              <button
                onClick={handleShow}
                aria-label={show ? 'Ocultar saldo pendiente' : 'Mostrar saldo pendiente'}
                className="rounded p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                {show ? <EyeSlashIcon className="size-[1.15rem]" /> : <EyeIcon className="size-[1.15rem]" />}
              </button>
            </div>
          </div>

          <p className="figure animate-print-in animate-delay-1 text-[2.25rem] font-semibold leading-none tracking-tight lg:text-[2.75rem]">
            {show ? format(pending[selectedCurrency] ?? 0, selectedCurrency) : '••••••'}
          </p>

          <p className="text-[0.8125rem] leading-relaxed text-muted">
            {hasPending
              ? 'Lo que debes por los préstamos aceptados. Abona cuando quieras.'
              : 'No debes nada. Puedes solicitar un préstamo cuando lo necesites.'}
          </p>
        </div>

        <div className="relative px-6 pt-6">
          <div className="perf" />
          <div className={`mt-4 grid divide-x divide-line overflow-hidden rounded-lg border border-line bg-surface
            ${hasPending ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <button
              onClick={() => setLoanModal(true)}
              className="flex flex-col items-center gap-1.5 py-3 text-muted transition-colors hover:bg-sunken hover:text-ink"
            >
              <ArrowTurnDownLeftIcon className="size-[1.15rem]" />
              <span className="text-[0.6875rem] font-medium font-semiwide">Solicitar</span>
            </button>
            {hasPending && (
              <button
                onClick={() => setPayModal(true)}
                className="flex flex-col items-center gap-1.5 py-3 text-muted transition-colors hover:bg-sunken hover:text-ink"
              >
                <PlusIcon className="size-[1.15rem]" />
                <span className="text-[0.6875rem] font-medium font-semiwide">Abonar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  )
}
