import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import appError from '../../../../../utils/appError';
import api from '../../../../../api/axios';
import { setLoad } from '../../../../../store/slices/loader.slice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Input } from '../../../../elements/user/Input';
import { Button } from '../../../../elements/user/Button';
import reSendAuthCode from '../../../../../utils/reSendAuthCode';

export const RecoveryCodeValidation = ({ account }) => {

  const { register, handleSubmit, formState: { errors }, } = useForm();

  const [hide1, setHide1] = useState(true);
  const [hide2, setHide2] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reSendCode = async () => {
    dispatch(setLoad(false))

    await reSendAuthCode(account.email)
      .finally(() => dispatch(setLoad(true)));
  }

  const submit = async (data) => {

    dispatch(setLoad(false));

    const url = `/api/v1/auth/recovery/validation/`

    const formData = data;
    formData.accountId = account.id

    await api.post(url, formData)
      .then(res => { 
        Swal.fire({
          icon: 'success',
          title: 'Done!',
          text: res.data.message,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        }).then(() => navigate('/'));
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
  }

  return (
    <div className="h-full flex flex-col justify-center">
      <form onSubmit={handleSubmit(submit)} 
        className="flex flex-col items-center gap-6 max-w-lg sm:mx-auto p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-lg"
      >
        <EnvelopeIcon className="size-20"/>
        <p className="text-sm text-center">
          {"We have sent a verification code to your email address"} <br />
          <b>{account.email}</b>, {"please enter it here."}
        </p>

        <Input
          icon={<LockClosedIcon className="size-6" />}
          id="password"
          name="password"
          full
          type={hide1 ? 'password' : 'text'}
          label={"Contraseña"}
          placeholder={"*************"}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Must be at least 8 characters',
                },
              },
            },
          }}
          element={
            <button type="button" onClick={() => setHide1(!hide1)} >
              {hide1 ? (<EyeIcon className="size-6" /> ) : ( <EyeSlashIcon className="size-6" />)}
            </button>
          }
        />
        <Input
          icon={<LockClosedIcon className="size-6" />}
          id="password_repeat"
          name="password_repeat"
          full
          type={hide2 ? 'password' : 'text'}
          label={"Repetir contraseña"}
          placeholder={"*************"}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Must be at least 8 characters',
                },
              },
            },
          }}
          element={
            <button type="button" onClick={() => setHide2(!hide2)} >
              {hide2 ? (<EyeIcon className="size-6" /> ) : ( <EyeSlashIcon className="size-6" />)}
            </button>
          }
        />

        <Input
          icon={<LockClosedIcon className="size-6" />}
          id="code"
          name="code"
          maxLength="6"
          full
          label={"Verification code"}
          helperLink={{ url: "", text: <button type="button" onClick={reSendCode}>{"Send again"}</button> }}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: 'Code is required',
              },
            },
          }}
        />

        <Button type="submit" size="lg" className="w-full">
          Validar
        </Button>
      </form>
    </div>
  )
}
