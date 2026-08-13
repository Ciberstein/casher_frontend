import { useEffect, useState } from 'react'
import { ArrowDownTrayIcon, LinkIcon } from '@heroicons/react/24/outline'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useDispatch } from 'react-redux'
import { setLoad } from '../../../store/slices/loader.slice'
import api from '../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../utils/appError'
import { fmt, fmtDate, StatusBadge, UserAvatar, EmptyState, ViewToggle, ItemList, ItemRow, VoucherModal, AcceptWithdrawalModal, PageHeader } from './adminShared'

export const AdminWithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState([])
  const [view, setView] = useState('pending')
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [voucherUrl, setVoucherUrl] = useState(null)
  const dispatch = useDispatch()

  const fetchWithdrawals = async (v = view) => {
    try {
      const r = await api.get(`/api/v1/withdrawals/admin${v === 'history' ? '?history=true' : ''}`)
      setWithdrawals(r.data)
    } catch (err) { appError(err) }
  }

  useEffect(() => { fetchWithdrawals(view) }, [view])

  const reject = async (id) => {
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/withdrawals/${id}/reject`)
      fetchWithdrawals()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: 'Retiro rechazado', showConfirmButton: false, timer: 3000 })
    } catch (err) { appError(err) }
    finally { dispatch(setLoad(true)) }
  }

  return (
    <div className="flex flex-col gap-6">
      <VoucherModal open={!!voucherUrl} setOpen={() => setVoucherUrl(null)} url={voucherUrl} />
      <AcceptWithdrawalModal open={modal} setOpen={setModal} withdrawal={selected} onSuccess={() => fetchWithdrawals()} />

      <PageHeader title="Retiros" subtitle="Gestiona las solicitudes de retiro de los usuarios" />

      <div className="flex flex-col gap-4">
        <ViewToggle value={view} onChange={setView} />
        {withdrawals.length === 0
          ? <EmptyState icon={<ArrowDownTrayIcon className="size-16" />} text={view === 'pending' ? 'No hay retiros pendientes' : 'Sin historial de retiros'} />
          : (
            <ItemList>
              {withdrawals.map((w, i) => (
                <ItemRow key={w.id} last={i === withdrawals.length - 1}>
                  <UserAvatar username={w.account?.username} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-ink">{w.account?.username}</span>
                      <span className="text-xs text-faint hidden sm:block truncate">{w.account?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-base font-bold text-ink">{fmt(w.amount, w.currency)}</span>
                      <span className="text-xs text-faint truncate">{w.bankAccount?.bank_name} · {w.bankAccount?.account_number}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <StatusBadge status={w.status} />
                      <span className="text-xs text-faint">{fmtDate(w.createdAt)}</span>
                      {w.screenshot && (
                        <button type="button" onClick={() => setVoucherUrl(w.screenshot)}
                          className="flex items-center gap-1 text-xs text-sello-ink hover:underline">
                          <LinkIcon className="size-3" /> Ver comprobante
                        </button>
                      )}
                    </div>
                  </div>
                  {view === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setSelected(w); setModal(true) }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sello hover:bg-ink text-reverse text-sm font-semibold transition-colors">
                        <CheckIcon className="size-4" /> Aceptar
                      </button>
                      <button onClick={() => reject(w.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sunken hover:bg-sunken text-muted text-sm font-semibold transition-colors">
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
