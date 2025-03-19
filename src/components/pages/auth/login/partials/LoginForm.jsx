import React, { useState } from 'react'
import { Input } from '../../../../elements/user/Input';
import { useForm } from 'react-hook-form';
import { EnvelopeIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import isEmailValid from '../../../../../utils/isEmailValid';
import { Button } from '../../../../elements/user/Button';
import { Link } from 'react-router-dom';

export const LoginForm = () => {

  const [hide, setHide] = useState(true);

  const { register, handleSubmit, formState: { errors }} = useForm();

  const submit = async (data) => {
    console.log(data);
  };

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
          id="Password"
          name="Password"
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

        <Button type="submit" size="lg">
          Ingresar
        </Button>     

      </form>
    </div>
  )
}
