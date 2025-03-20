import React, { useState } from 'react'
import { Input } from '../../../../elements/user/Input';
import { useForm } from 'react-hook-form';
import { EnvelopeIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import isEmailValid from '../../../../../utils/isEmailValid';
import { Button } from '../../../../elements/user/Button';
import { useNavigate } from 'react-router-dom';
import { setLoad } from '../../../../../store/slices/loader.slice';
import { useDispatch } from 'react-redux';
import api from '../../../../../api/axios';
import appError from '../../../../../utils/appError';
import Swal from 'sweetalert2';
import { GoogleIcon } from '../../../../../assets/GoogleIcon';
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../../../../utils/firebaseConfig';

export const LoginForm = ({ setAccount }) => {

  const [hide, setHide] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, formState: { errors }} = useForm();

  const trigger = (res) => {

    if(res.status === 200) {
      location.reload()
    }

    else if(res.status === 201) {
      navigate("/register", { state: { data: res.data } })
    }

    else if(res.status === 202) {
      setAccount(res.data.account)
    }
  }

  const firebase = async (token) => {
    dispatch(setLoad(false));

    const url = `/api/v1/auth/login/firebase`;
    
    await api.post(url, { token })
      .then((res) => trigger(res))
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

  const google = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await firebase(res.user.accessToken)
    } catch (err) {
      appError(err);
    }
  };

  const submit = async (data) => {
    dispatch(setLoad(false));
    
    const url = `/api/v1/auth/login`;

    await api.post(url, data)
      .then((res) => trigger(res))
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
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <form onSubmit={handleSubmit(submit)} 
        className="grid grid-cols-1 gap-6 max-w-lg sm:mx-auto p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-lg"
      >
        <div className="grid grid-cols-1 gap-6">
          <Input
            icon={<EnvelopeIcon className="size-6"/>}
            id="email"
            name="email"
            type="email"
            label={"Correo electrónico"}
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
          <Input
            icon={<LockClosedIcon className="size-6" />}
            id="password"
            name="password"
            type={hide ? 'password' : 'text'}
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
                  },
                },
              },
            }}
            helperLink={{
              url: '/recovery',
              text: 'Forgot password?'
            }}
            element={
              <button type="button" onClick={() => setHide(!hide)} >
                {hide ? (<EyeIcon className="size-6" /> ) : ( <EyeSlashIcon className="size-6" />)}
              </button>
            }
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Button type="submit" size="lg">
            Ingresar
          </Button>
          <div className="flex gap-2 items-center justify-center">
            <hr className="flex-grow border-black/20 dark:border-gray-500"/>
            <span className="text-xs text-center uppercase font-medium text-black/50 dark:text-gray-500">
                {"Or log in with"}
            </span>
            <hr className="flex-grow border-black/20 dark:border-gray-500"/>
          </div>
          <Button type="button" size="xl" variant="outline" className="flex justify-center" onClick={google}>
            <GoogleIcon />
          </Button>          
        </div>
      </form>
    </div>
  )
}
