import { useEffect, useState } from 'react'
import { ArrowUpTrayIcon, LinkIcon } from '@heroicons/react/24/outline'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useDispatch } from 'react-redux'
import { setLoad } from '../../../store/slices/loader.slice'
import api from '../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../utils/appError'
import { fmt, fmtDate, StatusBadge, UserAvatar, EmptyState, ViewToggle, ItemList, ItemRow, VoucherModal, PageHeader } from './adminShared'

export const AdminDepositsPage = () => {
  const [requests, setRequests] = useState([])
  const [view, setView] = useState('pending')
  const [voucherUrl, setVoucherUrl] = useState(null)
  const dispatch = useDispatch()

  const fetchRequests = async (v = view) => {
    try {
      const r = await api.get(`/api/v1/deposit-requests/admin${v === 'history' ? '?history=true' : ''}`)
      setRequests(r.data)
    } catch (err) { appError(err) }
  }

  useEffect(() => { fetchRequests(view) }, [view])

  const action = async (id, type) => {
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/deposit-requests/${id}/${type}`)
      fetchRequests()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: type === 'accept' ? 'Recarga aprobada' : 'Recarga rechazada', showConfirmButton: false, timer: 3000 })
    } catch (err) { appError(err) }
    finally { dispatch(setLoad(true)) }
  }

  return (
    <div className="flex flex-col gap-6">
      <VoucherModal open={!!voucherUrl} setOpen={() => setVoucherUrl(null)} url={voucherUrl} />

      <PageHeader title="Recargas" subtitle="Aprueba o rechaza las solicitudes de recarga de fondos" />

      <div className="flex flex-col gap-4">
        <ViewToggle value={view} onChange={setView} />
        {requests.length === 0
          ? <EmptyState icon={<ArrowUpTrayIcon className="size-16" />} text={view === 'pending' ? 'No hay recargas pendientes' : 'Sin historial de recargas'} />
          : (
            <ItemList>
              {requests.map((req, i) => (
                <ItemRow key={req.id} last={i === requests.length - 1}>
                  <UserAvatar username={req.account?.username} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{req.account?.username}</span>
                      <span className="text-xs text-slate-400 hidden sm:block truncate">{req.account?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-base font-bold text-slate-900 dark:text-white">{fmt(req.amount, req.currency)}</span>
                      {req.appBankAccount && (
                        <span className="text-xs text-slate-400 truncate">{req.appBankAccount.bank_name} · {req.appBankAccount.account_number}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <StatusBadge status={req.status} />
                      <span className="text-xs text-slate-400">{fmtDate(req.createdAt)}</span>
                      <button type="button" onClick={() => setVoucherUrl(req.screenshot)}
                        className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                        <LinkIcon className="size-3" /> Ver comprobante
                      </button>
                    </div>
                  </div>
                  {view === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => action(req.id, 'accept')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
                        <CheckIcon className="size-4" /> Aprobar
                      </button>
                      <button onClick={() => action(req.id, 'reject')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-600 dark:text-slate-300 text-sm font-semibold transition-colors">
                        <XMarkIcon className="size-4" /> Rechazar
                      </button>
                    </div>
                  )}
                </ItemRow>
              ))}
            </ItemList>
          )
        }
      </div>
    </div>
  )
}
