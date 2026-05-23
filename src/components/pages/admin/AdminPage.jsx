import { useEffect, useState } from 'react'
import { BanknotesIcon, ArrowDownTrayIcon, LinkIcon, UserIcon, CalendarIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import Modal from '../../elements/user/Modal'
import { Button } from '../../elements/user/Button'
import { FileUpload } from '../../elements/user/FileUpload'
import api from '../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../utils/appError'
import { useDispatch } from 'react-redux'
import { setLoad } from '../../../store/slices/loader.slice'

const statusLabel = { pending: 'Pendiente', accepted: 'Aceptado', rejected: 'Rechazado', paid: 'Pagado' };
const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
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
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700">
          <div className="size-11 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-green-700 dark:text-green-400">{initials}</span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{withdrawal.account?.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{withdrawal.account?.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {withdrawal.bankAccount?.bank_name} · {withdrawal.bankAccount?.account_number}
            </p>
          </div>
          <div className="ml-auto shrink-0 text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{withdrawal.amount?.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{withdrawal.currency}</p>
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
  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
    {icon}
    <span>{text}</span>
  </div>
);

const ViewToggle = ({ value, onChange }) => (
  <div className="flex gap-1 bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5 w-fit text-xs">
    {['pending', 'history'].map(v => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`px-3 py-1.5 rounded-md font-medium transition-colors
          ${value === v
            ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
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
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <BanknotesIcon className="size-10 opacity-40" />
          <p className="text-sm">{view === 'pending' ? 'No hay préstamos pendientes' : 'Sin historial'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {loans.map(loan => (
            <div key={loan.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-2 min-w-0">
                  <InfoRow icon={<UserIcon className="size-4 shrink-0" />} text={`${loan.account?.username} · ${loan.account?.email}`} />
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl font-bold dark:text-white">{loan.amount.toLocaleString()} {loan.currency}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[loan.status]}`}>
                      {statusLabel[loan.status]}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tasa {loan.interest_rate}% diario</span>
                  {loan.outstanding != null && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">Saldo actual: {loan.outstanding.toLocaleString()} COP</span>
                  )}
                  <InfoRow icon={<CalendarIcon className="size-4 shrink-0" />} text={new Date(loan.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} />
                </div>
                {view === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => action(loan.id, 'accept')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
                      <CheckIcon className="size-4" /> Aceptar
                    </button>
                    <button onClick={() => action(loan.id, 'reject')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 text-sm font-medium transition-colors">
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
          <img src={url} alt="Comprobante" className="w-full max-h-[70vh] object-contain bg-zinc-950" />
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
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <ArrowDownTrayIcon className="size-10 opacity-40" />
          <p className="text-sm">{view === 'pending' ? 'No hay retiros pendientes' : 'Sin historial'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {withdrawals.map(w => (
            <div key={w.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800">
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
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
                      <CheckIcon className="size-4" /> Aceptar
                    </button>
                    <button onClick={() => reject(w.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 text-sm font-medium transition-colors">
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
];

export const AdminPage = () => {
  const [tab, setTab] = useState('loans');
  const [counts, setCounts] = useState({ loans: 0, withdrawals: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/loans/admin'),
      api.get('/api/v1/withdrawals/admin'),
    ]).then(([l, w]) => setCounts({ loans: l.data.length, withdrawals: w.data.length }))
      .catch(() => {});
  }, []);

  const ActivePanel = TABS.find(t => t.key === tab).Panel;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold dark:text-white">Panel de administración</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona las solicitudes pendientes</p>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.key
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
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
