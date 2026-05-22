import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowUpRightIcon, ArrowDownLeftIcon, ArrowDownTrayIcon, BanknotesIcon,
  ArrowUturnUpIcon, PlusIcon, LinkIcon,
} from '@heroicons/react/24/outline'
import { Button } from '../../../elements/user/Button'
import { LoanRequestModal, WithdrawalRequestModal } from '../requests/Requests'
import { SendOrRequestModal } from '../home/partials/BalanceCard'
import ManageTxModal from './partials/ManageTxModal'
import { accountThunk } from '../../../../store/slices/account.slice'
import { activityThunk } from '../../../../store/slices/activity.slice'
import { setLoad } from '../../../../store/slices/loader.slice'
import useCurrency from '../../../../hooks/useCurrency'
import api from '../../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../../utils/appError'

const KIND_CONFIG = {
  transfer_sent:     { label: 'Transferencia enviada',   icon: <ArrowUpRightIcon className="size-4" />,   iconBg: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',       amountPrefix: '-', amountColor: 'text-red-500' },
  transfer_received: { label: 'Transferencia recibida',  icon: <ArrowDownLeftIcon className="size-4" />,  iconBg: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', amountPrefix: '+', amountColor: 'text-green-500' },
  withdrawal:        { label: 'Retiro',                  icon: <ArrowDownTrayIcon className="size-4" />,  iconBg: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',          amountPrefix: '-', amountColor: 'text-red-500' },
  loan:              { label: 'Préstamo',                icon: <BanknotesIcon className="size-4" />,      iconBg: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', amountPrefix: '+', amountColor: 'text-green-500' },
  payment:           { label: 'Abono a deuda',           icon: <ArrowUturnUpIcon className="size-4" />,   iconBg: 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400',      amountPrefix: '-', amountColor: 'text-blue-500' },
};

const STATUS_STYLE = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400',
  accepted:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  paid:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const STATUS_LABEL = {
  completed: 'Completado', pending: 'Pendiente', cancelled: 'Cancelado',
  accepted: 'Aceptado', rejected: 'Rechazado', paid: 'Pagado',
};


const fmt = (amount, currency) =>
  new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency, maximumFractionDigits: 2, currencyDisplay: 'code',
  }).format(amount);

const subtitle = (item) => {
  if (item.kind === 'transfer_sent' || item.kind === 'transfer_received')
    return item.meta.counterparty ?? item.meta.hash;
  if (item.kind === 'withdrawal') return item.meta.bankName ?? 'Cuenta bancaria';
  return null;
};

const groupByDate = (items) => {
  const map = new Map();
  items.forEach(item => {
    const d = new Date(item.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map.has(key)) map.set(key, { date: d, items: [] });
    map.get(key).items.push(item);
  });
  return [...map.values()];
};

const dateLabel = (date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  if (d === today) return 'Hoy';
  if (d === yesterday) return 'Ayer';
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
};

const ActivityRow = ({ item, onClick }) => {
  const cfg = KIND_CONFIG[item.kind];
  const sub = subtitle(item);
  const isTransfer = item.kind === 'transfer_sent' || item.kind === 'transfer_received';
  return (
    <li
      onClick={isTransfer && onClick ? () => onClick(item) : undefined}
      className={`flex items-center gap-3 px-4 py-3.5 transition-colors
        ${isTransfer && onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/60' : ''}`}
    >
      <div className={`size-9 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{cfg.label}</p>
        {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`text-sm font-semibold ${cfg.amountColor}`}>
          {cfg.amountPrefix}{fmt(item.amount, item.currency)}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLE[item.status]}`}>
          {STATUS_LABEL[item.status]}
        </span>
      </div>
    </li>
  );
};

const ActivityList = ({ items, loading, emptyText, onRowClick }) => {
  if (loading)
    return (
      <div className="flex flex-col gap-3 p-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="size-9 rounded-full bg-gray-200 dark:bg-zinc-700 shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/3" />
              <div className="h-2.5 bg-gray-100 dark:bg-zinc-800 rounded w-1/4" />
            </div>
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-16" />
          </div>
        ))}
      </div>
    );

  if (items.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
        <BanknotesIcon className="size-10 opacity-40" />
        <p className="text-sm">{emptyText}</p>
      </div>
    );

  const groups = groupByDate(items);

  return (
    <div className="flex flex-col gap-2">
      {groups.map(({ date, items: groupItems }) => (
        <div key={date.toISOString()} className="flex flex-col gap-2">
          <p className="sticky top-0 z-10 text-xs font-semibold text-gray-400 dark:text-gray-500 px-1 py-1 bg-white dark:bg-zinc-800">
            {dateLabel(date)}
          </p>
          <ul className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800 overflow-hidden">
            {groupItems.map(item => <ActivityRow key={item.id} item={item} onClick={onRowClick} />)}
          </ul>
        </div>
      ))}
    </div>
  );
};

const TabSkeleton = () => (
  <div className="flex flex-col gap-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 animate-pulse">
        <div className="size-9 rounded-full bg-gray-200 dark:bg-zinc-700 shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/3" />
          <div className="h-2.5 bg-gray-100 dark:bg-zinc-800 rounded w-1/4" />
        </div>
        <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-16" />
      </div>
    ))}
  </div>
);

const TabEmpty = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
    <BanknotesIcon className="size-10 opacity-40" />
    <p className="text-sm">{text}</p>
  </div>
);

const GroupedList = ({ items, renderRow }) => {
  const groups = groupByDate(items);
  return (
    <div className="flex flex-col gap-2">
      {groups.map(({ date, items: groupItems }) => (
        <div key={date.toISOString()} className="flex flex-col gap-2">
          <p className="sticky top-0 z-10 text-xs font-semibold text-gray-400 dark:text-gray-500 px-1 py-1 bg-white dark:bg-zinc-800">{dateLabel(date)}</p>
          <ul className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800 overflow-hidden">
            {groupItems.map(renderRow)}
          </ul>
        </div>
      ))}
    </div>
  );
};

const LoansTab = () => {
  const [loans, setLoans] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const fetchLoans = async () => {
    setLoading(true);
    try { const r = await api.get('/api/v1/loans'); setLoans(r.data); }
    catch (err) { appError(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLoans(); }, []);

  const onSuccess = () => { fetchLoans(); dispatch(accountThunk()); dispatch(activityThunk()); };

  const cancel = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cancelar solicitud?', text: 'Esta acción no se puede deshacer.',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sí, cancelar', cancelButtonText: 'Volver', confirmButtonColor: '#ef4444',
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

  const cfg = KIND_CONFIG.loan;

  return (
    <div className="flex flex-col gap-4">
      <LoanRequestModal open={modal} setOpen={setModal} onSuccess={onSuccess} />
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setModal(true)} className="flex items-center gap-1.5">
          <PlusIcon className="size-4" /> Solicitar préstamo
        </Button>
      </div>
      {loading ? <TabSkeleton /> : loans.length === 0 ? <TabEmpty text="No tienes préstamos aún." /> : (
        <GroupedList items={loans} renderRow={(loan) => (
          <li key={loan.id} className="flex items-center gap-3 px-4 py-3.5">
            <div className={`size-9 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{cfg.label}</p>
              {loan.status === 'accepted' && loan.outstanding != null
                ? <p className="text-xs text-gray-400 truncate">Saldo pendiente: {fmt(loan.outstanding, loan.currency)}</p>
                : <p className="text-xs text-gray-400 truncate">Tasa: {loan.interest_rate}% diario</p>
              }
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-sm font-semibold ${cfg.amountColor}`}>
                {cfg.amountPrefix}{fmt(loan.amount, loan.currency)}
              </span>
              <div className="flex items-center gap-2">
                {loan.status === 'pending' && (
                  <button onClick={() => cancel(loan.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors">
                    Cancelar
                  </button>
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLE[loan.status]}`}>
                  {STATUS_LABEL[loan.status]}
                </span>
              </div>
            </div>
          </li>
        )} />
      )}
    </div>
  );
};

const WithdrawalsTab = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const fetchWithdrawals = async () => {
    setLoading(true);
    try { const r = await api.get('/api/v1/withdrawals'); setWithdrawals(r.data); }
    catch (err) { appError(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  const onSuccess = () => { fetchWithdrawals(); dispatch(accountThunk()); dispatch(activityThunk()); };

  const cancel = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cancelar solicitud?', text: 'El saldo congelado será devuelto a tu cuenta disponible.',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sí, cancelar', cancelButtonText: 'Volver', confirmButtonColor: '#ef4444',
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

  const cfg = KIND_CONFIG.withdrawal;

  return (
    <div className="flex flex-col gap-4">
      <WithdrawalRequestModal open={modal} setOpen={setModal} onSuccess={onSuccess} />
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setModal(true)} className="flex items-center gap-1.5">
          <PlusIcon className="size-4" /> Solicitar retiro
        </Button>
      </div>
      {loading ? <TabSkeleton /> : withdrawals.length === 0 ? <TabEmpty text="No tienes retiros aún." /> : (
        <GroupedList items={withdrawals} renderRow={(w) => (
          <li key={w.id} className="flex items-center gap-3 px-4 py-3.5">
            <div className={`size-9 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{cfg.label}</p>
              <p className="text-xs text-gray-400 truncate">
                {w.bankAccount?.bank_name ?? 'Cuenta bancaria'}
                {w.bankAccount?.account_number ? ` · ${w.bankAccount.account_number}` : ''}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-sm font-semibold ${cfg.amountColor}`}>
                {cfg.amountPrefix}{fmt(w.amount, w.currency)}
              </span>
              <div className="flex items-center gap-2">
                {w.screenshot && (
                  <a href={w.screenshot} target="_blank" rel="noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-0.5">
                    <LinkIcon className="size-3" /> Comprobante
                  </a>
                )}
                {w.status === 'pending' && (
                  <button onClick={() => cancel(w.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors">
                    Cancelar
                  </button>
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLE[w.status]}`}>
                  {STATUS_LABEL[w.status]}
                </span>
              </div>
            </div>
          </li>
        )} />
      )}
    </div>
  );
};

const TABS = [
  { key: 'all',       label: 'Todas' },
  { key: 'transfers', label: 'Transferencias' },
  { key: 'loans',     label: 'Préstamos' },
  { key: 'withdrawals', label: 'Retiros' },
];

export const TransactionsPage = () => {
  const [tab, setTab] = useState('all');
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txModal, setTxModal] = useState(false);
  const [txType, setTxType] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = async (item) => {
    try {
      const res = await api.get(`/api/v1/transfers/${item.meta.hash}`);
      setSelectedTx(res.data);
      setDetailOpen(true);
    } catch (err) { appError(err); }
  };

  useEffect(() => {
    api.get('/api/v1/activity?all=true')
      .then(r => setActivity(r.data))
      .catch(appError)
      .finally(() => setLoading(false));
  }, []);

  const transfers = activity.filter(i => i.kind === 'transfer_sent' || i.kind === 'transfer_received');

  return (
    <div className="h-full flex flex-col gap-4">
      <h1 className="text-2xl font-semibold dark:text-white shrink-0">Transacciones</h1>
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-4 gap-1 bg-gray-100 dark:bg-zinc-900 rounded-xl w-full p-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.key
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-6 bg-white dark:bg-zinc-800">
        <ManageTxModal open={detailOpen} setOpen={setDetailOpen} tx={selectedTx} />

        {tab === 'all' && (
          <ActivityList items={activity} loading={loading} emptyText="Sin actividad aún" onRowClick={openDetail} />
        )}

        {tab === 'transfers' && (
          <div className="flex flex-col gap-4">
            <SendOrRequestModal open={txModal} setOpen={setTxModal} txType={txType} />
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={() => { setTxType(false); setTxModal(true); }} className="flex items-center gap-1.5">
                <ArrowDownLeftIcon className="size-4" /> Solicitar
              </Button>
              <Button size="sm" onClick={() => { setTxType(true); setTxModal(true); }} className="flex items-center gap-1.5">
                <ArrowUpRightIcon className="size-4" /> Enviar
              </Button>
            </div>
            <ActivityList items={transfers} loading={loading} emptyText="Sin transferencias aún" onRowClick={openDetail} />
          </div>
        )}

        {tab === 'loans' && <LoansTab />}
        {tab === 'withdrawals' && <WithdrawalsTab />}
      </div>
    </div>
  );
};
