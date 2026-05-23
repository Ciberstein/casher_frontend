import Modal from '../../../../elements/user/Modal'
import currencyFormat from '../../../../../utils/currency'
import { useDispatch, useSelector } from 'react-redux'
import convertDate from '../../../../../utils/convertDate'
import { Button } from '../../../../elements/user/Button'
import api from '../../../../../api/axios'
import appError from '../../../../../utils/appError'
import { setLoad } from '../../../../../store/slices/loader.slice'
import { transfersThunk } from '../../../../../store/slices/transfers.slice'
import { accountThunk } from '../../../../../store/slices/account.slice'
import Swal from 'sweetalert2'
import { QRCodeSVG } from 'qrcode.react'
import { STATUS_STYLE, STATUS_LABEL } from '../TransactionsPage'

const Row = ({ label, value, mono = false }) => (
  <div className="flex justify-between gap-4 px-4 py-3">
    <span className="text-sm text-slate-400 shrink-0">{label}</span>
    <span className={`text-sm font-medium text-slate-800 dark:text-white text-right truncate ${mono ? 'font-mono text-xs' : ''}`}>
      {value}
    </span>
  </div>
)

const ManageTxModal = ({ open, setOpen, tx }) => {
  const account = useSelector(state => state.account)
  const dispatch = useDispatch()

  const handleManageTx = async (status) => {
    dispatch(setLoad(false))
    try {
      const res = await api.patch(`/api/v1/transfers/request/${tx.id}`, { status })
      setOpen(false)
      dispatch(accountThunk())
      dispatch(transfersThunk())
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: res.data.message, showConfirmButton: false, timer: 5000, timerProgressBar: true })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response.data.message, showConfirmButton: false, timer: 5000, timerProgressBar: true })
    } finally {
      dispatch(setLoad(true))
    }
  }

  if (!tx) return null

  const isSender = account.id === tx.owner.id
  const amountColor = isSender ? 'text-red-500' : 'text-emerald-500'
  const amountPrefix = isSender ? '-' : '+'

  return (
    <Modal open={open} setOpen={setOpen} title="Detalle de transferencia">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 py-5 bg-slate-50 dark:bg-neutral-800/50 rounded-2xl">
          <span className={`text-3xl font-bold ${amountColor}`}>
            {amountPrefix}{currencyFormat(tx.data.amount)}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider
            ${STATUS_STYLE[tx.status] ?? 'bg-slate-100 text-slate-500'}`}>
            {STATUS_LABEL[tx.status] ?? tx.status}
          </span>
        </div>

        <div className="flex justify-center">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 dark:border-neutral-700 shadow-sm">
            <QRCodeSVG
              value={`${window.location.origin}/tx/${tx.hash}`}
              size={120}
              level="H"
              imageSettings={{ src: '/img/favicon.svg', width: 24, height: 24, excavate: false }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden divide-y divide-slate-100 dark:divide-neutral-800">
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-neutral-800/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Emisor</p>
          </div>
          <Row label="Nombre" value={`${tx.owner.data?.first_name} ${tx.owner.data?.surname_1}`} />
          <Row label="E-mail" value={tx.owner.email} />

          <div className="px-4 py-2.5 bg-slate-50 dark:bg-neutral-800/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Destinatario</p>
          </div>
          <Row label="Nombre" value={`${tx.receiver.data?.first_name} ${tx.receiver.data?.surname_1}`} />
          <Row label="E-mail" value={tx.receiver.email} />

          <div className="px-4 py-2.5 bg-slate-50 dark:bg-neutral-800/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resumen</p>
          </div>
          <Row label="Fecha" value={convertDate(tx.createdAt)} />
          <Row label="Referencia" value={`#${tx.hash?.slice(0, 12)}`} mono />
        </div>

        {tx.status === 'pending' && (
          <div className="flex gap-3">
            {account.id === tx.owner.id && (
              <Button color="green" className="flex-1" onClick={() => handleManageTx(true)}>
                Confirmar
              </Button>
            )}
            <Button color="red" className="flex-1" onClick={() => handleManageTx(false)}>
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ManageTxModal
