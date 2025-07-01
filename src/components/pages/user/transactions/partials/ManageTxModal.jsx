import React from 'react'
import Modal from '../../../../elements/user/Modal'
import currencyFormat from '../../../../../utils/currency'
import { useDispatch, useSelector } from 'react-redux'
import convertDate from '../../../../../utils/convertDate'
import { Button } from '../../../../elements/user/Button'
import { XMarkIcon } from '@heroicons/react/24/outline'
import api from '../../../../../api/axios'
import appError from '../../../../../utils/appError'
import { setLoad } from '../../../../../store/slices/loader.slice'
import { transactionsThunk } from '../../../../../store/slices/transactions.slice'
import { accountThunk } from '../../../../../store/slices/account.slice'
import Swal from 'sweetalert2'
import Barcode from 'react-barcode'

const ManageTxModal = ({ open, setOpen, tx }) => {

	const account = useSelector(state => state.account);
  const dispatch = useDispatch();

  const handleManageTx = async (status) => {

    dispatch(setLoad(false));

    const url =  `/api/v1/transactions/request/${tx.id}`;
    const data = { status };

    await api.patch(url, data)
      .then(res => {
        setOpen(false)
        dispatch(accountThunk());
        dispatch(transactionsThunk());
        Swal.fire({
          toast: true,
          position: 'bottom-right',
          icon: 'success',
          text: res.data.message,
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
        }); 
      })
      .catch(err => {
        appError(err);
        Swal.fire({
          toast: true,
          position: 'bottom-right',
          icon: 'error',
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
        });
      })
      .finally(() => dispatch(setLoad(true)))
  };

  if(tx)
    return (
      <Modal open={open} setOpen={setOpen} screen>
        <div className="px-6 py-10 flex flex-col gap-4 items-center"
          style={{
            backgroundImage: 'url(/img/ticket.png)',
            backgroundSize: '100% 100%',
            filter: 'drop-shadow'
          }}
        >
          <header className="flex flex-col items-center sm:px-28 relative gap-4">
            <img src="/img/logo.svg" className="max-h-16" />
            <div className="rounded-xl overflow-hidden">
              <Barcode value={tx.hash} />
            </div>
            <h3 className={`text-xl font-medium uppercase
              ${tx.status === 'completed' && 'text-green-400'}
              ${tx.status === 'pending' && 'text-yellow-400'}
              ${tx.status === 'cancelled' && 'text-red-400'}  
            `}>
              {tx.status}
            </h3>
            <button className="absolute z-10 right-0" onClick={() => setOpen(false)}>
              <XMarkIcon className="size-10" />
            </button>
          </header>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-medium border-b border-dashed border-gray-300 pb-2 text-left">
                Emisor
              </h4>
              <div className="flex justify-between gap-6">
                <span className="text-gray-400">Nombre</span>
                <span className="font-medium">
                  {`${tx.owner.first_name} ${tx.owner.last_name}`}
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-gray-400">E-Mail</span>
                <span className="font-medium">
                  {tx.owner.email}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-medium border-b border-dashed border-gray-300 pb-2 text-left">
                Destinatario
              </h4>
              <div className="flex justify-between gap-6">
                <span className="text-gray-400">Nombre</span>
                <span className="font-medium">
                  {`${tx.receiver.first_name} ${tx.receiver.last_name}`}
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-gray-400">E-Mail</span>
                <span className="font-medium">
                  {tx.receiver.email}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-medium border-b border-dashed border-gray-300 pb-2 text-left">
                Resumen
              </h4>
              <div className="flex justify-between gap-6">
                <span className="text-gray-400">Fecha</span>
                <span className="font-medium">
                  {convertDate(tx.createdAt)}
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-gray-400">Importe</span>
                <span className={`font-medium ${tx.owner.id === account.id ?
                  'text-red-400' : 'text-green-400'}`}
                >
                  {tx.owner.id === account.id ? '-' : '+'}
                  {currencyFormat(tx.data.amount)}
                </span>
              </div>
            </div>
          </div>
          { tx.status === 'pending' && 
            <footer className="flex flex-col gap-4 w-full">
              <h4 className="text-lg font-medium border-b border-dashed border-gray-300 pb-2 text-left">
                Administrar
              </h4>
              <div className="flex gap-4">
                { account.id === tx.owner.id && 
                  <Button color="green" className="w-full" onClick={() => handleManageTx(true)}>
                    Confirmar
                  </Button> 
                }
                <Button color="red" className="w-full" onClick={() => handleManageTx(false)}>
                  Cancelar
                </Button>
              </div>
            </footer>
          }
        </div>
      </Modal>
    )
}

export default ManageTxModal
