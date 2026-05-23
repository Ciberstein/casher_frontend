import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { activityThunk } from '../../../../../store/slices/activity.slice';
import {
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  ArrowUturnUpIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

const KIND_CONFIG = {
  transfer_sent: {
    label: 'Transferencia enviada',
    icon: <ArrowUpRightIcon className="size-4" />,
    iconBg: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',
    amountPrefix: '-',
    amountColor: 'text-red-500',
  },
  transfer_received: {
    label: 'Transferencia recibida',
    icon: <ArrowDownLeftIcon className="size-4" />,
    iconBg: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amountPrefix: '+',
    amountColor: 'text-green-500',
  },
  withdrawal: {
    label: 'Retiro',
    icon: <ArrowDownTrayIcon className="size-4" />,
    iconBg: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',
    amountPrefix: '-',
    amountColor: 'text-red-500',
  },
  loan: {
    label: 'Préstamo',
    icon: <BanknotesIcon className="size-4" />,
    iconBg: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amountPrefix: '+',
    amountColor: 'text-green-500',
  },
  payment: {
    label: 'Abono a deuda',
    icon: <ArrowUturnUpIcon className="size-4" />,
    iconBg: 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400',
    amountPrefix: '-',
    amountColor: 'text-blue-500',
  },
  deposit: {
    label: 'Recarga de fondos',
    icon: <ArrowUpTrayIcon className="size-4" />,
    iconBg: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amountPrefix: '+',
    amountColor: 'text-green-500',
  },
};

const STATUS_STYLE = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const STATUS_LABEL = {
  completed: 'Completado', pending: 'Pendiente', cancelled: 'Cancelado',
  accepted: 'Aceptado', rejected: 'Rechazado', paid: 'Pagado',
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

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency, maximumFractionDigits: 2, currencyDisplay: 'code',
  }).format(amount);

const subtitle = (item) => {
  if (item.kind === 'transfer_sent' || item.kind === 'transfer_received')
    return item.meta.counterparty ?? item.meta.hash;
  if (item.kind === 'withdrawal') {
    const parts = [item.meta.bankName, item.meta.accountNumber].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Cuenta bancaria';
  }
  if (item.kind === 'deposit') {
    const parts = [item.meta.bankName, item.meta.accountNumber].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Cuenta de la app';
  }
  return null;
};

export const LastTransactionsTable = () => {
  const dispatch = useDispatch();
  const activity = useSelector((state) => state.activity);

  useEffect(() => {
    dispatch(activityThunk());
  }, []);

  const loading = activity === null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Actividad reciente</h3>
        <Link to="/transactions" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
          Ver todas →
        </Link>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 divide-y divide-slate-100 dark:divide-neutral-800 overflow-hidden animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <div className="size-9 rounded-full bg-slate-200 dark:bg-neutral-700 shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3 bg-slate-200 dark:bg-neutral-700 rounded w-1/3" />
                <div className="h-2.5 bg-slate-100 dark:bg-neutral-800 rounded w-1/4" />
              </div>
              <div className="h-3 bg-slate-200 dark:bg-neutral-700 rounded w-16" />
            </div>
          ))}
        </div>
      ) : activity.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
          <BanknotesIcon className="size-10 opacity-40" />
          <p className="text-sm">Sin actividad reciente</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groupByDate(activity).map(({ date, items }) => (
            <div key={date.toISOString()} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-1 uppercase tracking-wider">
                {dateLabel(date)}
              </p>
              <ul className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 divide-y divide-slate-100 dark:divide-neutral-800 overflow-hidden shadow-sm">
                {items.map((item) => {
                  const cfg = KIND_CONFIG[item.kind];
                  const sub = subtitle(item);
                  return (
                    <li key={item.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <div className={`size-9 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{cfg.label}</p>
                        {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-sm font-semibold ${cfg.amountColor}`}>
                          {cfg.amountPrefix}{formatAmount(item.amount, item.currency)}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLE[item.status]}`}>
                          {STATUS_LABEL[item.status]}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
