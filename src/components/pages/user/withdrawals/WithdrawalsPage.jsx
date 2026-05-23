import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { LinkIcon } from '@heroicons/react/24/outline'
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

const statusLabel = { pending: 'Pendiente', accepted: 'Aceptado', rejected: 'Rechazado' };
const statusColor = { pending: 'text-yellow-500', accepted: 'text-green-500', rejected: 'text-red-500' };

const WithdrawalModal = ({ open, setOpen, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const [bankAccounts, setBankAccounts] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (open) api.get('/api/v1/bank-accounts').then(r => setBankAccounts(r.data)).catch(appError);
  }, [open]);

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
    } finally {
      dispatch(setLoad(true));
    }
  };

  return (
    <Modal open={open} setOpen={setOpen} title="Solicitar retiro" className="grid gap-6">
      {bankAccounts.length === 0
        ? <p className="text-sm text-gray-400">Primero agrega una cuenta bancaria en la sección Cuentas bancarias.</p>
        : (
          <form onSubmit={handleSubmit(submit)} className="grid gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dark:text-white">Cuenta bancaria</label>
              <select {...register('bankAccountId', { required: true })}
                className="border rounded-lg p-2 dark:bg-zinc-800 dark:text-white dark:border-gray-600">
                {bankAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.bank_name} · {acc.account_number}</option>
                ))}
              </select>
            </div>
            <Input icon={<CurrencyDollarIcon className="size-6" />} id="amount" name="amount"
              type="number" min="1" step="0.01" label="Monto" placeholder="0.00"
              register={{ function: register, errors: { function: errors, rules: { required: 'Requerido', min: { value: 1, message: 'Mínimo 1' } } } }} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dark:text-white">Moneda</label>
              <select {...register('currency', { required: true })}
                className="border rounded-lg p-2 dark:bg-zinc-800 dark:text-white dark:border-gray-600">
                <option value="COP">COP</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <Button type="submit" disabled={!isValid}>Solicitar retiro</Button>
          </form>
        )
      }
    </Modal>
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
          <img src={url} alt="Comprobante" className="w-full max-h-[70vh] object-contain bg-zinc-950" />
        )}
      </div>
    </Modal>
  );
};

export const WithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [modal, setModal] = useState(false);
  const [voucherUrl, setVoucherUrl] = useState(null);
  const dispatch = useDispatch();
  const { format } = useCurrency();

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get('/api/v1/withdrawals');
      setWithdrawals(res.data);
    } catch (err) { appError(err); }
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  const onSuccess = () => { fetchWithdrawals(); dispatch(accountThunk()); };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold dark:text-white">Retiros</h1>
        <Button onClick={() => setModal(true)} className="flex items-center gap-2">
          <PlusIcon className="size-4" /> Solicitar
        </Button>
      </div>
      <VoucherModal open={!!voucherUrl} setOpen={() => setVoucherUrl(null)} url={voucherUrl} />
      <WithdrawalModal open={modal} setOpen={setModal} onSuccess={onSuccess} />
      <div className="flex flex-col gap-3">
        {withdrawals.length === 0 && <p className="text-gray-400 text-sm">No tienes retiros aún.</p>}
        {withdrawals.map(w => (
          <div key={w.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold dark:text-white">{w.amount.toLocaleString()} {w.currency}</span>
              <span className={`text-sm font-medium ${statusColor[w.status]}`}>{statusLabel[w.status]}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {w.bankAccount?.bank_name} — {w.bankAccount?.account_number}
            </span>
            {w.screenshot && (
              <button type="button" onClick={() => setVoucherUrl(w.screenshot)}
                className="flex items-center gap-1 text-xs text-blue-500 hover:underline w-fit">
                <LinkIcon className="size-3" /> Ver comprobante
              </button>
            )}
            <span className="text-xs text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
