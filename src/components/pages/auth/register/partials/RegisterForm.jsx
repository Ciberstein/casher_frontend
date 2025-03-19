import React, { useState } from 'react'
import { Input } from '../../../../elements/user/Input'
import { EnvelopeIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form';
import isEmailValid from '../../../../../utils/isEmailValid';
import { Button } from '../../../../elements/user/Button';


export const RegisterForm = () => {

  const [hide1, setHide1] = useState(true);
  const [hide2, setHide2] = useState(true);

  const { register, handleSubmit, formState: { errors }} = useForm();

  const submit = async (data) => {
    console.log(data);
  };

  return (
    <div className="h-full flex flex-col justify-center ">
      <form onSubmit={handleSubmit(submit)} 
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg sm:mx-auto p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-lg"
      >
        <Input
          icon={<UserIcon className="size-6"/>}
          id="first_name"
          name="first_name"
          label="Nombre"
          placeholder={"Ej. Juan"}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'Must be at least 2 characters',
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
          placeholder={"Ej. Pérez"}
          register={{
            function: register,
            errors: {
              function: errors,
              rules: {
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Must be at least 2 characters',
                },
              },
            },
          }}
        />
        <div className="sm:col-span-2">
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
        </div>
        <Input
          icon={<LockClosedIcon className="size-6" />}
          id="Password"
          name="Password"
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
          id="repeat_password"
          name="repeat_password"
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

        <Button type="submit" size="lg" color="green" className="sm:col-span-2">
          Registrarse
        </Button>
      </form>
    </div>
  )
}
