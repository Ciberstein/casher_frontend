import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  CheckCircleIcon, ClockIcon, XCircleIcon,
} from '@heroicons/react/24/outline'
import api from '../../../api/axios'

const STATUS_CONFIG = {
  completed: { label: 'Completada',  icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
  pending:   { label: 'Pendiente',   icon: ClockIcon,        color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
  cancelled: { label: 'Cancelada',   icon: XCircleIcon,      color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
};

const fmt = (amount, currency) =>
  new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-CO', {
    style: 'currency', currency, maximumFractionDigits: 2, currencyDisplay: 'code',
  }).format(amount);

const Row = ({ label, value, valueClass = '' }) => (
  <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200 dark:border-neutral-700 last:border-0">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className={`text-sm font-medium text-gray-900 dark:text-white ${valueClass}`}>{value}</span>
  </div>
);

export const TransactionPublicPage = () => {
  const { hash } = useParams();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/api/v1/public/tx/${hash}`)
      .then(r => setTx(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [hash]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="size-10 rounded-full border-4 border-gray-200 border-t-gray-500 animate-spin" />
          <p className="text-sm">Cargando transacción...</p>
        </div>
      </div>
    );

  if (error || !tx)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <XCircleIcon className="size-12 opacity-50" />
          <p className="text-sm">Transacción no encontrada</p>
        </div>
      </div>
    );

  const status = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-800 rounded-3xl shadow-xl overflow-hidden">

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 pt-8 pb-12 flex flex-col items-center gap-3">
          <img src="/img/logo_dark.svg" className="max-h-7 opacity-90" />
          <p className="text-white/70 text-xs tracking-widest uppercase mt-1">Comprobante de transferencia</p>
        </div>

        <div className="-mt-6 mx-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-md p-5 flex flex-col items-center gap-4 border border-gray-100 dark:border-neutral-700">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${status.color} ${status.bg} ${status.border}`}>
            <StatusIcon className="size-4" />
            {status.label}
          </div>

          <div className="p-3 bg-white rounded-xl border border-gray-100">
            <QRCodeSVG
              value={`${window.location.origin}/tx/${tx.hash}`}
              size={140}
              level="H"
              imageSettings={{ src: '/img/favicon.svg', width: 28, height: 28, excavate: false }}
            />
          </div>

          <p className="text-xs text-gray-400 font-mono break-all text-center">{tx.hash}</p>
        </div>

        <div className="px-6 py-5 flex flex-col">
          <Row label="Emisor"       value={tx.sender} />
          <Row label="Destinatario" value={tx.receiver} />
          <Row
            label="Monto"
            value={fmt(tx.amount, tx.currency)}
            valueClass={tx.status === 'completed' ? 'text-green-600 dark:text-green-400' : ''}
          />
          <Row
            label="Fecha"
            value={new Date(tx.createdAt).toLocaleDateString('es-CO', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          />
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-gray-400">Verificado por <span className="font-semibold text-gray-600 dark:text-gray-300">Casher</span></p>
        </div>
      </div>
    </div>
  );
};
