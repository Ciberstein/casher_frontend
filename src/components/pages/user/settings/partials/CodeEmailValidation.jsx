import { EnvelopeOpenIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { Button } from '../../../../elements/user/Button'
import appError from '../../../../../utils/appError'
import { setLoad } from '../../../../../store/slices/loader.slice'
import api from '../../../../../api/axios'
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import reSendAuthCode from '../../../../../utils/reSendAuthCode'
import { useForm } from 'react-hook-form'
import { Input } from '../../../../elements/user/Input'
import { accountThunk } from '../../../../../store/slices/account.slice'

export const CodeEmailValidation = ({ setEmail, email }) => {

  const { register, handleSubmit, formState: { errors }, } = useForm();

  const account = useSelector(state => state.account);
  const dispatch = useDispatch();

  const reSendCode = async () => {
    dispatch(setLoad(false));

    await reSendAuthCode(account.email)
      .finally(() => dispatch(setLoad(true)));
  }

  const submit = async (data) => {
    dispatch(setLoad(false))

    const url = `/api/v1/auth/update/email/validation`;

    let formData = data;

    formData.email = email;

    await api.patch(url, formData)
      .then(res => {
        dispatch(accountThunk());
        Swal.fire({
          icon: 'success',
          title: 'Done!',
          text: res.data.message,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        }).then(() => setEmail(false))
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
    <form className="flex flex-col gap-4 justify-center items-center" onSubmit={handleSubmit(submit)}>
      <EnvelopeOpenIcon className="size-20"/>
      <p className="text-sm text-center">
        {"Hemos enviado un código de verificación a tu correo"} <br /><b>{email}</b>, {"por favor ingresalo aquí."}
      </p>
      <Input
        icon={<LockClosedIcon className="size-6" />}
        id="code"
        name="code"
        maxLength="6"
        full
        label={"Código de verificación"}
        helperLink={{ url: "", text: <button type="button" onClick={reSendCode}>{"Enviar de nuevo"}</button> }}
        register={{
          function: register,
          errors: {
            function: errors,
            rules: {
              required: 'El código es requerido',
            },
          },
        }}
      />
      <Button type="submit" className="w-full">
        {"Validate"}
      </Button>
    </form>
  )
}
