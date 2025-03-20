
import { ArrowTurnDownLeftIcon, PlusIcon } from '@heroicons/react/20/solid'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import currencyFormat from '../../../../../utils/currency'

export const DebitCard = ({ balance = 0 }) => {

  const [show, setShow] = useState(false);

  const handleShow = () => {
    setShow(!show)
  }

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-6 text-white bg-orange-500/80 bg-cover bg-center"
      style={{
        backgroundImage: 'url(img/card-bg-2.svg)'
      }}
    >
      <div className="flex justify-between items-center gap-4">
        <span className="font-medium text-xl">
          Saldo pendiente
        </span>
        <button onClick={() => handleShow()}>
          {
            show 
              ? <EyeSlashIcon className="size-6" />
              : <EyeIcon className="size-6" />
          }
        </button>
      </div>
      <div className="flex flex-col"> 
        <span className="text-sm font-medium">
          A pagar
        </span>
        <div className="font-semibold flex gap-1">
          <span className="text-3xl lg:text-5xl">
            {show ? currencyFormat(balance) : '******' }
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-medium text-sm">
        {
            balance > 0 ?
              <button className="flex flex-col items-center gap-1">
                <div className="bg-orange-600 hover:bg-orange-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
                  <PlusIcon className="size-6" />
                </div>
                <span>Abonar</span>
              </button>
            :
            <button className="flex flex-col items-center gap-1">
              <div className="bg-orange-600 hover:bg-orange-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
                <ArrowTurnDownLeftIcon className="size-6" />
              </div>
              <span>Solicitar</span>
            </button>
        }
      </div>
    </div>
  )
}
