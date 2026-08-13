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
import { STATUS_LABEL } from '../TransactionsPage'
import { LedgerRow, Stamp } from '../../../../shared/Receipt'

const STAMP_TONE = {
  completed: 'entrada', accepted: 'entrada', paid: 'entrada',
  pending: 'espera', cancelled: 'espera', rejected: 'salida',
}

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
  const amountColor = isSender ? 'text-salida' : 'text-entrada'
  const amountPrefix = isSender ? '−' : '+'

  return (
    <Modal open={open} setOpen={setOpen} title="Detalle de transferencia">
      <div className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="eyebrow">{isSender ? 'Enviaste' : 'Recibiste'}</span>
            <span className={`figure text-[1.75rem] font-semibold leading-none tracking-tight ${amountColor}`}>
              {amountPrefix}{currencyFormat(tx.data.amount)}
            </span>
          </div>
          <Stamp tone={STAMP_TONE[tx.status] ?? 'espera'} className="mb-1">
            {STATUS_LABEL[tx.status] ?? tx.status}
          </Stamp>
        </div>

        <div className="perf" />

        <div>
          <p className="eyebrow pb-1">Emisor</p>
          <LedgerRow label="Nombre" value={`${tx.owner.data?.first_name} ${tx.owner.data?.surname_1}`} mono={false} />
          <LedgerRow label="Correo" value={tx.owner.email} />

          <p className="eyebrow pb-1 pt-4">Destinatario</p>
          <LedgerRow label="Nombre" value={`${tx.receiver.data?.first_name} ${tx.receiver.data?.surname_1}`} mono={false} />
          <LedgerRow label="Correo" value={tx.receiver.email} />

          <p className="eyebrow pb-1 pt-4">Resumen</p>
          <LedgerRow label="Fecha" value={convertDate(tx.createdAt)} />
          <LedgerRow label="Referencia" value={`#${tx.hash?.slice(0, 12)}`} />
        </div>

        <div className="perf" />

        <div className="flex flex-col items-center gap-2">
          <div className="rounded border border-line bg-white p-2.5">
            <QRCodeSVG
              value={`${window.location.origin}/tx/${tx.hash}`}
              size={112}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#17181B"
            />
          </div>
          <p className="text-[0.6875rem] text-faint">Escanea para verificar este comprobante</p>
        </div>

        {tx.status === 'pending' && (
          <div className="flex gap-3">
            {account.id === tx.owner.id && (
              <Button color="green" className="flex-1" onClick={() => handleManageTx(true)}>
                Confirmar
              </Button>
            )}
            <Button color="red" variant="outline" className="flex-1" onClick={() => handleManageTx(false)}>
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ManageTxModal
