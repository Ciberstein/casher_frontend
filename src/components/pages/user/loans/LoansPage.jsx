import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { Button } from '../../../elements/user/Button'
import Modal from '../../../elements/user/Modal'
import { useForm } from 'react-hook-form'
import { Input } from '../../../elements/user/Input'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'
import api from '../../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../../utils/appError'
import { useDispatch } from 'react-redux'
import { setLoad } from '../../../../store/slices/loader.slice'
import { accountThunk } from '../../../../store/slices/account.slice'
import useCurrency from '../../../../hooks/useCurrency'

const statusLabel = { pending: 'Pendiente', accepted: 'Aceptado', rejected: 'Rechazado', paid: 'Pagado' };
const statusColor = { pending: 'text-yellow-500', accepted: 'text-green-500', rejected: 'text-red-500', paid: 'text-blue-500' };

const LoanRequestModal = ({ open, setOpen, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
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
    } finally {
      dispatch(setLoad(true));
    }
  };

  return (
    <Modal open={open} setOpen={setOpen} title="Solicitar préstamo" className="grid gap-6">
      <form onSubmit={handleSubmit(submit)} className="grid gap-6">
        <Input
          icon={<CurrencyDollarIcon className="size-6" />}
          id="amount" name="amount" type="number" min="1" step="0.01"
          label="Monto" placeholder="0.00"
          register={{ function: register, errors: { function: errors, rules: { required: 'Monto requerido', min: { value: 1, message: 'Mínimo 1' } } } }}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium dark:text-white">Moneda</label>
          <select {...register('currency', { required: true })}
            className="border rounded-lg p-2 dark:bg-zinc-800 dark:text-white dark:border-gray-600">
            <option value="COP">COP</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <Button type="submit" disabled={!isValid}>Solicitar</Button>
      </form>
    </Modal>
  );
};

export const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [modal, setModal] = useState(false);
  const dispatch = useDispatch();
  const { format } = useCurrency();

  const fetchLoans = async () => {
    try {
      const res = await api.get('/api/v1/loans');
      setLoans(res.data);
    } catch (err) { appError(err); }
  };

  useEffect(() => { fetchLoans(); }, []);

  const onSuccess = () => { fetchLoans(); dispatch(accountThunk()); };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold dark:text-white">Préstamos</h1>
        <Button onClick={() => setModal(true)} className="flex items-center gap-2">
          <PlusIcon className="size-4" /> Solicitar
        </Button>
      </div>
      <LoanRequestModal open={modal} setOpen={setModal} onSuccess={onSuccess} />
      <div className="flex flex-col gap-3">
        {loans.length === 0 && <p className="text-gray-400 text-sm">No tienes préstamos aún.</p>}
        {loans.map(loan => (
          <div key={loan.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold dark:text-white">{loan.amount.toLocaleString()} {loan.currency}</span>
              <span className={`text-sm font-medium ${statusColor[loan.status]}`}>{statusLabel[loan.status]}</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <span>Tasa: {loan.interest_rate}% diario</span>
              {loan.status === 'accepted' && loan.outstanding != null && (
                <span>Saldo actual: {format(loan.outstanding)}</span>
              )}
            </div>
            <span className="text-xs text-gray-400">{new Date(loan.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
