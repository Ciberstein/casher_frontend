import { useEffect, useState } from 'react'
import { BanknotesIcon } from '@heroicons/react/24/outline'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useDispatch } from 'react-redux'
import { setLoad } from '../../../store/slices/loader.slice'
import api from '../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../utils/appError'
import { fmt, fmtDate, StatusBadge, UserAvatar, EmptyState, ViewToggle, ItemList, ItemRow, PageHeader } from './adminShared'

export const AdminLoansPage = () => {
  const [loans, setLoans] = useState([])
  const [view, setView] = useState('pending')
  const dispatch = useDispatch()

  const fetchLoans = async (v = view) => {
    try {
      const r = await api.get(`/api/v1/loans/admin${v === 'history' ? '?history=true' : ''}`)
      setLoans(r.data)
    } catch (err) { appError(err) }
  }

  useEffect(() => { fetchLoans(view) }, [view])

  const action = async (id, type) => {
    dispatch(setLoad(false))
    try {
      await api.patch(`/api/v1/loans/${id}/${type}`)
      fetchLoans()
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: `Préstamo ${type === 'accept' ? 'aceptado' : 'rechazado'}`, showConfirmButton: false, timer: 3000 })
    } catch (err) { appError(err) }
    finally { dispatch(setLoad(true)) }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Préstamos" subtitle="Gestiona las solicitudes de préstamo de los usuarios" />

      <div className="flex flex-col gap-4">
        <ViewToggle value={view} onChange={setView} />
        {loans.length === 0
          ? <EmptyState icon={<BanknotesIcon className="size-16" />} text={view === 'pending' ? 'No hay préstamos pendientes' : 'Sin historial de préstamos'} />
          : (
            <ItemList>
              {loans.map((loan, i) => (
                <ItemRow key={loan.id} last={i === loans.length - 1}>
                  <UserAvatar username={loan.account?.username} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-ink">{loan.account?.username}</span>
                      <span className="text-xs text-faint hidden sm:block truncate">{loan.account?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-base font-bold text-ink">{fmt(loan.amount, loan.currency)}</span>
                      <span className="text-xs text-faint">{loan.interest_rate}% diario</span>
                      {loan.outstanding != null && (
                        <span className="text-xs font-semibold text-orange-500">Pendiente: {fmt(loan.outstanding, loan.currency)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={loan.status} />
                      <span className="text-xs text-faint">{fmtDate(loan.createdAt)}</span>
                    </div>
                  </div>
                  {view === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => action(loan.id, 'accept')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sello hover:bg-ink text-reverse text-sm font-semibold transition-colors">
                        <CheckIcon className="size-4" /> Aceptar
                      </button>
                      <button onClick={() => action(loan.id, 'reject')}
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
