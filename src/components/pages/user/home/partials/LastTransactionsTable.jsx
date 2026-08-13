import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { activityThunk } from '../../../../../store/slices/activity.slice';
import { Mark } from '../../../../shared/Mark';

/**
 * El libro de movimientos. Cada renglón dice tres cosas y ninguna más:
 * hacia dónde fue el dinero, cuánto, y si ya quedó en firme.
 */
const KIND_CONFIG = {
  transfer_sent:     { label: 'Transferencia enviada',  dir: 'out' },
  transfer_received: { label: 'Transferencia recibida', dir: 'in' },
  withdrawal:        { label: 'Retiro',                 dir: 'out' },
  loan:              { label: 'Préstamo',               dir: 'in' },
  payment:           { label: 'Abono a deuda',          dir: 'out' },
  deposit:           { label: 'Recarga de fondos',      dir: 'in' },
};

const STATUS_LABEL = {
  completed: 'Completado', pending: 'Pendiente', cancelled: 'Cancelado',
  accepted: 'Aceptado', rejected: 'Rechazado', paid: 'Pagado',
};

const STATUS_TONE = {
  completed: 'text-entrada',
  accepted:  'text-entrada',
  paid:      'text-entrada',
  pending:   'text-espera',
  cancelled: 'text-faint',
  rejected:  'text-salida',
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

export const LedgerEntry = ({ item }) => {
  const cfg = KIND_CONFIG[item.kind] ?? { label: item.kind, dir: 'in' };
  const sub = subtitle(item);
  const isIn = cfg.dir === 'in';

  return (
    <li className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-sunken/50 sm:px-5">
      <Mark
        direction={cfg.dir}
        className={`h-4 w-auto ${isIn ? 'text-entrada' : 'text-salida'}`}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{cfg.label}</p>
        {sub && <p className="figure truncate text-[0.6875rem] text-faint">{sub}</p>}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className={`figure text-sm font-semibold ${isIn ? 'text-entrada' : 'text-salida'}`}>
          {isIn ? '+' : '−'}{formatAmount(item.amount, item.currency)}
        </span>
        <span className={`eyebrow !text-[0.625rem] ${STATUS_TONE[item.status] ?? 'text-faint'}`}>
          {STATUS_LABEL[item.status] ?? item.status}
        </span>
      </div>
    </li>
  );
};

const Skeleton = () => (
  <ul className="divide-y divide-line">
    {[...Array(4)].map((_, i) => (
      <li key={i} className="flex animate-pulse items-center gap-3.5 px-5 py-3.5">
        <div className="h-4 w-3 rounded-sm bg-sunken" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-3 w-1/3 rounded-sm bg-sunken" />
          <div className="h-2.5 w-1/5 rounded-sm bg-sunken" />
        </div>
        <div className="h-3 w-20 rounded-sm bg-sunken" />
      </li>
    ))}
  </ul>
);

export const LastTransactionsTable = () => {
  const dispatch = useDispatch();
  const activity = useSelector((state) => state.activity);

  useEffect(() => {
    dispatch(activityThunk());
  }, []);

  const loading = activity === null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="eyebrow">Movimientos recientes</h2>
        <Link
          to="/transactions"
          className="text-xs font-medium text-sello-ink underline decoration-sello/35 underline-offset-4 transition-colors hover:decoration-sello"
        >
          Ver todos
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {loading ? (
          <Skeleton />
        ) : activity.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-sm font-medium text-ink">Todavía no hay movimientos</p>
            <p className="max-w-xs text-[0.8125rem] leading-relaxed text-muted">
              Carga fondos o pide un envío y el primer comprobante aparecerá aquí.
            </p>
          </div>
        ) : (
          groupByDate(activity).map(({ date, items }, gi) => (
            <div key={date.toISOString()}>
              <div className={`flex items-center gap-3 px-4 pb-1.5 pt-4 sm:px-5 ${gi > 0 ? 'border-t border-line' : ''}`}>
                <span className="eyebrow shrink-0">{dateLabel(date)}</span>
                <span className="perf flex-1" />
              </div>
              <ul className="divide-y divide-line">
                {items.map((item) => <LedgerEntry key={item.id} item={item} />)}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
