import React from 'react'
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import api from '../../../../../api/axios';
import { setLoad } from '../../../../../store/slices/loader.slice';
import { useDispatch, useSelector } from 'react-redux';
import appError from '../../../../../utils/appError';
import { CheckCircleIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../../elements/user/Button';
import { Input } from '../../../../elements/user/Input';
import isEmailValid from '../../../../../utils/isEmailValid';

export const UpdateEmailForm = ({ setEmail }) => {

  const { register, handleSubmit, formState: { errors }, } = useForm();
  const account = useSelector(state => state.account);
  const dispatch = useDispatch();

  const emailValidation = (new_email, new_email_repeat) => {
  
    let status =  true
    let message = ''

    if(new_email.toLowerCase() !== new_email_repeat.toLowerCase()){ 
      message = "Los emails no coinciden"
      status = false
    }

    if(new_email.toLowerCase() === account.email.toLowerCase()){ 
      message = "La nueva direccion de correo debe ser diferente a la actual"
      status = false
    }

    if(!status)
      Swal.fire({
        toast: true,
        position: 'bottom-right',
        icon: 'error',
        text: message,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });
    
    return status
  }

  const submit = async (data) => {
    if(emailValidation(data.new_email, data.new_email_repeat)) {
      dispatch(setLoad(false));

      const url = `/api/v1/auth/update/email/`;

      await api.patch(url, data)
        .then(res => setEmail(res.data))
        .catch(err => { 
          appError(err)
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
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(submit)}>
      <div className="bg-gradient-to-r dark:!from-zinc-950 dark:!via-zinc-900 
      !from-gray-200 !via-gray-100 !to-transparent rounded-lg p-2 -ml-9">
        <h1 className="text-2xl font-medium flex gap-4 items-center">
          Correo electrónico
        </h1>
      </div>
      <Input
        icon={<EnvelopeIcon className="size-6"/>}
        id="email"
        type="email"
        label={"Correo electrónico actual"}
        placeholder={"username@domain.com"}
        defaultValue={account.email}
        element={
          <span title={"Verified"}>
            <CheckCircleIcon className="size-6 text-green-500" />
          </span>
        }
        disabled
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          icon={<EnvelopeIcon className="size-6"/>}
          id="new_email"
          name="new_email"
          type="email"
          label={"Correo electrónico nuevo"}
          placeholder={"username@domain.com"}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: 'El email es requerido',
                validate: {
                  isEmailValid: (value) => {
                    if (!isEmailValid(value)) {
                      return 'Invalid email format';
                    }
                    return true;
                  },
                },
              },
            },
          }}
        />
        <Input
          icon={<EnvelopeIcon className="size-6"/>}
          id="new_email_repeat"
          name="new_email_repeat"
          type="email"
          label={"Repetir Correo electrónico"}
          placeholder={"username@domain.com"}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: 'El email es requerido',
                validate: {
                  isEmailValid: (value) => {
                    if (!isEmailValid(value)) {
                      return 'Invalid email format';
                    }
                    return true;
                  },
                },
              },
            },
          }}
        />
      </div>
      <Button type="submit">
        {"Actualizar"}
      </Button>
    </form>
  )
}
