
import { ArrowTurnDownLeftIcon, ArrowTurnUpRightIcon, MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { CheckBadgeIcon, CurrencyDollarIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, TagIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import currencyFormat from '../../../../../utils/currency'
import Modal from '../../../../elements/user/Modal'
import { Button } from '../../../../elements/user/Button'
import { Input } from '../../../../elements/user/Input'
import isEmailValid from '../../../../../utils/isEmailValid'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { setLoad } from '../../../../../store/slices/loader.slice'
import api from '../../../../../api/axios'
import Swal from 'sweetalert2'
import appError from '../../../../../utils/appError'
import { accountThunk } from '../../../../../store/slices/account.slice'
import { transactionsThunk } from '../../../../../store/slices/transactions.slice'

const ChargeModal = ({ open, setOpen }) => {
  return (
    <Modal open={open} setOpen={setOpen} title="Cargar fondos">

    </Modal>
  )
}

const SendOrRequestModal = ({ open, setOpen, txType }) => {

  const { register, handleSubmit, reset, formState: { errors }} = useForm();
  const [success, setSuccess] = useState(false);
  const [section, setSection] = useState(1);
  const [params, setParams] = useState({});
  const [type, setType] = useState(1);

  const dispatch = useDispatch();

  const submit = async (data) => {
    dispatch(setLoad(false));
    const url = `/api/v1/transactions/${txType ? 'send' : 'request'}`;
    const formData = data;
    formData.type = type;
    formData.confirmation = section == 3 ? true : false;

    await api.post(url, formData)
      .then((res) => {
        if(res.status == 200) {
          setSection(2);
        }
        else if(res.status == 201) {
          setParams(res.data)
          setSection(3);
        }
        else if(res.status == 202) {
          reset();
          setType(1);
          setOpen(false);
          setSection(1);
          setSuccess(true);
          dispatch(accountThunk());
          dispatch(transactionsThunk());
        }
      })
      .catch((err) => {
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

  return (
    <>
      <Modal open={success} setOpen={setSuccess} className="flex flex-col gap-10 items-center" header={false}>
        <CheckBadgeIcon className="size-32 text-green-500" />
        <div className="flex flex-col px-8 text-xl font-medium items-center">
          <h1>Has {txType ? 'enviado' : 'solicitado'} {currencyFormat(params.amount)} USD a</h1>
          <h1>{params.email}</h1>
        </div>
        <Button className="w-full" onClick={() => setSuccess(false)}>
          Aceptar
        </Button>
      </Modal>
      <Modal open={open} setOpen={setOpen} title={`${txType ? 'Enviar' : 'Solicitar' } fondos`} className="grid grid-cols-1 gap-6">
        <header className="grid grid-cols-1 items-center relative gap-4">
          <div className="grid grid-cols-3 items-center relative">
            <div className="w-full flex justify-center z-10">
              <div 
                className={`p-2 size-10 sm:p-3 sm:size-12 rounded-full text-center text-white 
                  ${section >= 1 ? 'bg-blue-500' : 'bg-gray-400' }`}
                >
                <span className="font-medium">1</span>
              </div>            
            </div>
            <div className="w-full flex justify-center z-10">
              <div 
                className={`p-2 size-10 sm:p-3 sm:size-12 rounded-full text-center text-white 
                  ${section >= 2 ? 'bg-blue-500' : 'bg-gray-400' }`}
                >
                <span className="font-medium">2</span>
              </div>
            </div>
            <div className="w-full flex justify-center z-10">
              <div 
                className={`p-2 size-10 sm:p-3 sm:size-12 rounded-full text-center text-white 
                  ${section == 3 ? 'bg-blue-500' : 'bg-gray-400' }`}
                >
                <span className="font-medium">3</span>
              </div>
            </div>
            <div className="h-2 bg-gray-400 absolute w-full rounded-full overflow-hidden">
              <div className={`bg-blue-500 ${section == 2 ? 'w-1/2' : section == 3 ? 'w-full' : 'w-1/5' } h-full`}></div>
            </div>          
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium text-center text-xs sm:text-sm">Usuario</span>
            <span className="font-medium text-center text-xs sm:text-sm">Monto</span>
            <span className="font-medium text-center text-xs sm:text-sm">Confirmación</span>
          </div>
        </header>

        <form className="grid col-span-1 gap-6" onSubmit={handleSubmit(submit)}>
          { section == 1 &&
            <>
              <nav className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Button 
                  type="button"
                  variant={type == 1 ? "normal" : "outline"}
                  onClick={() => setType(1)}
                >
                  Email
                </Button>
                <Button 
                  type="button"
                  variant={type == 2 ? "normal" : "outline"}
                  onClick={() => setType(2)}
                >
                  Apodo
                </Button>
              </nav>
              <Input
                icon={
                  type == 1 ?
                  <EnvelopeIcon className="size-6"/> :
                  <TagIcon className="size-6" />
                }
                id="user"
                name="user"
                type={ type == 1 ? "email" : "text" }
                placeholder={ type == 1 ? "username@domain.com" : "Username" }
                register={{
                  function: register,
                  errors: {
                    function: errors,
                    rules: {
                      required: type == 1 ? 'Email is required' : 'ID is required',
                      validate: {
                        isEmailValid: (value) => {
                          if(type == 1) {
                            if (!isEmailValid(value)) {
                              return 'Invalid email format';
                            }
                          }
                          return true;
                        },
                      },
                    },
                  },
                }}
              />
              <Button type="submit">
                Continuar
              </Button>
            </>
          }
          { section == 2 &&
            <>
              <Input
                icon={<CurrencyDollarIcon className="size-6"/>}
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder={"10.00$"}
                register={{
                  function: register,
                  errors: {
                    function: errors,
                    rules: {
                      required: 'Amount is required',
                      validate: {
                        validAmount: (value) => {
                          if (value <= 0) {
                            return 'Invalid amount';
                          }
                          return true;
                        },
                      },
                    },
                  },
                }}
              />
              <div className="grid sm:grid-cols-2 gap-6">
                <Button color="gray" type="button" variant="outline" onClick={() => setSection(1)}>
                  Volver
                </Button>
                <Button type="submit">
                  Continuar
                </Button>
              </div>
            </>
          }
          { section == 3 &&
            <>
              <div className="border dark:border-gray-500 rounded-lg flex flex-col">
                <div className="flex gap-4 items-center p-3">
                  <div className="size-10 rounded-full border flex flex-col justify-center items-center bg-slate-200">
                    <span className="text-lg text-zinc-500 uppercase font-medium">
                      {params.data?.first_name.split("")[0]}
                      {params.data?.surname_1.split("")[0]}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{params?.email}</span>
                    <span className="text-gray-400 text-sm">{`Apodo: ${params?.username}`}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 border-t dark:border-gray-500">
                  <span className="text-gray-400 text-sm">{txType ? 'El beneficiario' : 'Usted'} recibe</span>
                  <span className="font-medium">{currencyFormat(params?.amount)}</span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <Button color="gray" type="button" variant="outline" onClick={() => setSection(2)}>
                  Volver
                </Button>
                <Button color="green" type="submit">
                  Confirmar
                </Button>
              </div>
            </>
          }
        </form>
      </Modal>
    </>
  )
}

const WithdrawModal = ({ open, setOpen }) => {
  return (
    <Modal open={open} setOpen={setOpen} title="Retirar fondos">

    </Modal>
  )
}

export const BalanceCard = ({ balance = 0 }) => {

  const [show, setShow] = useState(false);
  const [chargeModal, setChargeModal] = useState(false);
  const [txType, setTxType] = useState(false);
  const [sendOrRequestModal, setSendOrRequestModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);

  const handleShow = () => setShow(!show);

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-6 text-white bg-green-500/80 bg-cover bg-center"
      style={{
        backgroundImage: 'url(img/card-bg-1.svg)'
      }}
    >
      <ChargeModal open={chargeModal} setOpen={setChargeModal} />
      <SendOrRequestModal open={sendOrRequestModal} setOpen={setSendOrRequestModal} txType={txType} />
      <WithdrawModal open={withdrawModal} setOpen={setWithdrawModal} />
      <div className="flex justify-between items-center gap-4">
        <span className="font-medium text-xl">
          Saldo disponible
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
          Balance
        </span>
        <div className="font-semibold flex gap-1">
          <span className="text-3xl lg:text-5xl">
            {show ? currencyFormat(balance) : '******' }
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-medium text-sm">
        <button className="flex flex-col items-center gap-1" onClick={() => setChargeModal(!chargeModal)}>
          <div className="bg-green-600 hover:bg-green-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
            <PlusIcon className="size-6" />
          </div>
          <span>Cargar</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => { setSendOrRequestModal(!sendOrRequestModal); setTxType(true) }}>
          <div className="bg-green-600 hover:bg-green-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
            <ArrowTurnUpRightIcon className="size-6" />
          </div>
          <span>Enviar</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => { setSendOrRequestModal(!sendOrRequestModal); setTxType(false) }}>
          <div className="bg-green-600 hover:bg-green-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
            <ArrowTurnDownLeftIcon className="size-6" />
          </div>
          <span>Solicitar</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => setWithdrawModal(!withdrawModal)}>
          <div className="bg-green-600 hover:bg-green-600/70 transition-colors ease-in-out rounded-xl flex justify-center p-1 w-full shadow-lg brightness-90">
            <MinusIcon className="size-6" />
          </div>
          <span>Retirar</span>
        </button>
      </div>
    </div>
  )
}
