import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import appError from '../../../../../utils/appError'
import api from '../../../../../api/axios'
import { setLoad } from '../../../../../store/slices/loader.slice'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { EnvelopeIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { Input } from '../../../../elements/user/Input'
import { Button } from '../../../../elements/user/Button'
import reSendAuthCode from '../../../../../utils/reSendAuthCode'

export const RecoveryCodeValidation = ({ account }) => {
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const [hide1, setHide1] = useState(true);
  const [hide2, setHide2] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reSendCode = async () => {
    dispatch(setLoad(false));
    await reSendAuthCode(account.email).finally(() => dispatch(setLoad(true)));
  };

  const submit = async (data) => {
    dispatch(setLoad(false));
    const formData = { ...data, accountId: account.id };
    await api.post('/api/v1/auth/recovery/validation/', formData)
      .then(res => {
        Swal.fire({ icon: 'success', title: '¡Listo!', text: res.data.message, showConfirmButton: false, timer: 3000, timerProgressBar: true })
          .then(() => navigate('/'));
      })
      .catch(err => {
        appError(err);
        Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response.data.message, showConfirmButton: false, timer: 5000, timerProgressBar: true });
      })
      .finally(() => dispatch(setLoad(true)));
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="size-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <EnvelopeIcon className="size-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Enviamos un código a <span className="font-semibold text-slate-800 dark:text-white">{account.email}</span>
        </p>
      </div>

      <Input
        icon={<LockClosedIcon className="size-5" />}
        id="password" name="password"
        type={hide1 ? 'password' : 'text'}
        label="Nueva contraseña" placeholder="••••••••"
        register={{
          function: register,
          errors: { function: errors, rules: { required: 'Requerido', minLength: { value: 8, message: 'Mín. 8 caracteres' } } },
        }}
        element={
          <button type="button" onClick={() => setHide1(!hide1)}>
            {hide1 ? <EyeIcon className="size-5" /> : <EyeSlashIcon className="size-5" />}
          </button>
        }
      />

      <Input
        icon={<LockClosedIcon className="size-5" />}
        id="password_repeat" name="password_repeat"
        type={hide2 ? 'password' : 'text'}
        label="Repetir contraseña" placeholder="••••••••"
        register={{
          function: register,
          errors: { function: errors, rules: { required: 'Requerido', minLength: { value: 8, message: 'Mín. 8 caracteres' } } },
        }}
        element={
          <button type="button" onClick={() => setHide2(!hide2)}>
            {hide2 ? <EyeIcon className="size-5" /> : <EyeSlashIcon className="size-5" />}
          </button>
        }
      />

      <Input
        icon={<LockClosedIcon className="size-5" />}
        id="code" name="code"
        maxLength="6"
        label="Código de verificación" placeholder="000000"
        helperLink={{ url: '', text: <button type="button" onClick={reSendCode} className="text-emerald-600 dark:text-emerald-400 hover:underline">Reenviar código</button> }}
        register={{
          function: register,
          errors: { function: errors, rules: { required: 'Requerido' } },
        }}
      />

      <Button type="submit" size="lg" className="w-full mt-1" disabled={!isValid}>
        Restablecer contraseña
      </Button>
    </form>
  );
};
