import React from 'react'
import { useForm } from 'react-hook-form';
import { Input } from '../../../../elements/user/Input';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import isEmailValid from '../../../../../utils/isEmailValid';
import { Button } from '../../../../elements/user/Button';

export const RecoveryForm = () => {

  const { register, handleSubmit, formState: { errors }, } = useForm();

  const submit = async (data) => {
    console.log(data);
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
