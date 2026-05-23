import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import api from '../../../../../api/axios';
import { setLoad } from '../../../../../store/slices/loader.slice';
import { useDispatch, useSelector } from 'react-redux';
import appError from '../../../../../utils/appError';
import { UserIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../../elements/user/Button';
import { Input } from '../../../../elements/user/Input';
import { accountThunk } from '../../../../../store/slices/account.slice';

export const UpdatePersonalDataForm = () => {

  const { register, handleSubmit, setValue, trigger, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' });
  const account = useSelector(state => state.account);
  const dispatch = useDispatch();

  const submit = async (data) => {
    dispatch(setLoad(false));

    const url = `/api/v1/auth/update/personal`;

    await api.patch(url, data)
      .then(res => {
        dispatch(accountThunk());
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
  };

  useEffect(() => {
    setValue("first_name", account.data?.first_name);
    setValue("middle_name", account.data?.middle_name);
    setValue("surname_1", account.data?.surname_1);
    setValue("surname_2", account.data?.surname_2);
    trigger();
  }, [account]);

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(submit)}>
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Datos personales</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Tu nombre tal como aparece en la plataforma</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          icon={<UserIcon className="size-6"/>}
          id="first_name"
          name="first_name"
          label="Primer nombre"
          defaultValue={account.data?.first_name}
          placeholder={account.data?.first_name}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: 'El nombre es requerido',
                minLength: {
                  value: 2,
                  message: 'Mínimo 2 caracteres',
                },
                maxLength: {
                  value: 20,
                  message: 'Máximo 20 caracteres',
                },
              },
            },
          }}
        />
        <Input
          icon={<UserIcon className="size-6"/>}
          id="middle_name"
          name="middle_name"
          label="Segundo nombre"
          defaultValue={account.data?.middle_name}
          placeholder={account.data?.middle_name}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: false,
                minLength: {
                  value: 2,
                  message: 'Mínimo 2 caracteres',
                },
                maxLength: {
                  value: 20,
                  message: 'Máximo 20 caracteres',
                },
              },
            },
          }}
        />
        <Input 
          icon={<UserIcon className="size-6"/>}
          id="surname_1"
          name="surname_1"
          label="Primer apellido"
          defaultValue={account.data?.surname_1}
          placeholder={account.data?.surname_1}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: 'El primer apellido es requerido',
                minLength: {
                  value: 2,
                  message: 'Mínimo 2 caracteres',
                },
                maxLength: {
                  value: 20,
                  message: 'Máximo 20 caracteres',
                },
              },
            },
          }}
        />
        <Input 
          icon={<UserIcon className="size-6"/>}
          id="surname_2"
          name="surname_2"
          label="Segundo apellido"
          defaultValue={account.data?.surname_2}
          placeholder={account.data?.surname_2}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: false,
                minLength: {
                  value: 2,
                  message: 'Mínimo 2 caracteres',
                },
                maxLength: {
                  value: 20,
                  message: 'Máximo 20 caracteres',
                },
              },
            },
          }}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" color="green" disabled={!isValid || isSubmitting}>
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
