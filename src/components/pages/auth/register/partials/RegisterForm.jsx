import React, { useState } from 'react'
import { Input } from '../../../../elements/user/Input'
import { EnvelopeIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form';
import isEmailValid from '../../../../../utils/isEmailValid';
import { Button } from '../../../../elements/user/Button';
import api from '../../../../../api/axios';
import appError from '../../../../../utils/appError';
import { useDispatch } from 'react-redux';
import { setLoad } from '../../../../../store/slices/loader.slice';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


export const RegisterForm = ({ setAccount, firebase }) => {
  console.log(firebase);
  const [hide1, setHide1] = useState(true);
  const [hide2, setHide2] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, formState: { errors }} = useForm();

  const submit = async (data) => {
    dispatch(setLoad(false));

    const url = "/api/v1/auth/register";

    let formData = data;

    if(firebase) {
      formData.email = firebase.email;
      formData.email_verified = firebase.email_verified;
    }

    await api.post(url, formData)
      .then((res) => { 
        if(res.status === 200) setAccount(res.data.account)
        if(res.status === 201)
          Swal.fire({
            icon: 'success',
            title: 'Done!',
            text: res.data.message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          }).then(() => navigate('/'));
      })
      .catch((err) => {
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
          defaultValue={firebase ? firebase.name.split(" ")[0] : ""}
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
          defaultValue={firebase ? firebase.name.split(" ")[1] : ""}
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
          { firebase ?
              <Input
                icon={<EnvelopeIcon className="size-6"/>}
                id="email"
                name="email"
                type="email"
                label={"Correo electrónico"}
                placeholder={"username@domain.com"}
                defaultValue={firebase.email}
                disabled={true}
              />
            :
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
            }
        </div>
        <Input
          icon={<LockClosedIcon className="size-6" />}
          id="password"
          name="password"
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
