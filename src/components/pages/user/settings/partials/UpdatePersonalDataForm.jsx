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

  const { register, handleSubmit, formState: { errors }, } = useForm();
  const account = useSelector(state => state.account);
  const [defaultData, setDefaultData] = useState(account);
  const dispatch = useDispatch();

  const submit = async (data) => {
    dispatch(setLoad(false));

    const url = `/api/v1/auth/update/personal/`;

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
    setDefaultData(account)
  }, [account]);

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(submit)}>
      <div className="bg-gradient-to-r dark:!from-zinc-950 dark:!via-zinc-900 
      !from-gray-200 !via-gray-100 !to-transparent rounded-lg p-2 -ml-9">
        <h1 className="text-2xl font-medium flex gap-4 items-center">
          Datos personales
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          icon={<UserIcon className="size-6"/>}
          id="first_name"
          name="first_name"
          label="Nombre"
          defaultValue={defaultData.first_name}
          placeholder={defaultData.first_name}
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
              },
            },
          }}
        />
        <Input 
          icon={<UserIcon className="size-6"/>}
          id="last_name"
          name="last_name"
          label="Apellido"
          defaultValue={defaultData.last_name}
          placeholder={defaultData.last_name}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: 'El apellido es requerido',
                minLength: {
                  value: 2,
                  message: 'Mínimo 2 caracteres',
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
