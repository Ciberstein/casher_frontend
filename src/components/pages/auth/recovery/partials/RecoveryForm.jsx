import React from 'react'
import { useForm } from 'react-hook-form';
import { Input } from '../../../../elements/user/Input';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import isEmailValid from '../../../../../utils/isEmailValid';
import { Button } from '../../../../elements/user/Button';
import { setLoad } from '../../../../../store/slices/loader.slice';
import { useDispatch } from 'react-redux';
import api from '../../../../../api/axios';
import Swal from 'sweetalert2';
import appError from '../../../../../utils/appError';

export const RecoveryForm = ({ setAccount }) => {

  const { register, handleSubmit, formState: { errors }, } = useForm();

  const dispatch = useDispatch();

  const submit = async (data) => {
    dispatch(setLoad(false));

    const url = `/api/v1/auth/recovery`;

    await api.post(url, data)
      .then(res => {
        setAccount(res.data.account)
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
      .finally(() => dispatch(setLoad(true)));
  }

  return (
    <div className="h-full flex flex-col justify-center ">
      <form onSubmit={handleSubmit(submit)} 
        className="grid grid-cols-1 gap-6 max-w-lg sm:mx-auto p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-lg"
      >
        <Input
          icon={<EnvelopeIcon className="size-6"/>}
          id="email"
          name="email"
          type="email"
          placeholder={"username@domain.com"}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: 'Email is required',
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
        <Button type="submit" size="lg">
          Recuperar
        </Button>
      </form>
    </div>
  )
}
