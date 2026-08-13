import React, { useState } from 'react'
import { Input } from '../../../../elements/user/Input'
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { Button } from '../../../../elements/user/Button'
import { useForm } from 'react-hook-form'
import api from '../../../../../api/axios'
import appError from '../../../../../utils/appError'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { setLoad } from '../../../../../store/slices/loader.slice'

export const UpdatePasswordForm = ({ setPassword }) => {

    const [hide1, setHide1] = useState(true);
    const [hide2, setHide2] = useState(true);
    const [hide3, setHide3] = useState(true);

    const dispatch = useDispatch();

    const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({ mode: 'onChange' });

    const submit = async (data) => {

        if(data.new_password !== data.new_password_repeat)
            return Swal.fire({
                toast: true,
                position: 'bottom-right',
                icon: 'error',
                text: "Las contraseñas no coinciden",
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
            });

        dispatch(setLoad(false));

        const url = `/api/v1/auth/update/password/`;

        await api.patch(url, data)
            .then(res => setPassword(res.data))
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

    return (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(submit)}>
            <div>
                <h2 className="text-base font-semibold text-ink">Contraseña</h2>
                <p className="text-sm text-muted mt-0.5">Actualiza tu contraseña de acceso</p>
            </div>
            <Input
                icon={<LockClosedIcon className="size-6" />}
                id="password"
                name="password"
                type={hide1 ? 'password' : 'text'}
                label="Contraseña actual"
                placeholder="***********"
                register={{
                    function: register,
                    errors: {
                    function: errors,
                    rules: {
                        required: 'Actual La contraseña es requerida',
                        minLength: {
                            value: 8,
                            message: 'Mínimo 8 caracteres',
                        },
                    },
                    },
                }}
                element={
                    <button
                        type="button"
                        onClick={() => setHide1(!hide1)}
                    >
                        {hide1 ? (
                            <EyeIcon className="size-6" />
                        ) : (
                            <EyeSlashIcon className="size-6" />
                        )}
                    </button>
                }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                    icon={<LockClosedIcon className="size-6" />}
                    id="new_password"
                    name="new_password"
                    type={hide2 ? 'password' : 'text'}
                    label="Contraseña nueva"
                    placeholder="***********"
                    register={{
                        function: register,
                        errors: {
                        function: errors,
                        rules: {
                            required: 'La contraseña nueva es requerida',
                            minLength: {
                            value: 8,
                            message: 'Mínimo 8 caracteres',
                            },
                        },
                        },
                    }}
                    element={
                        <button
                            type="button"
                            onClick={() => setHide2(!hide2)}
                        >
                            {hide2 ? (
                                <EyeIcon className="size-6" />
                            ) : (
                                <EyeSlashIcon className="size-6" />
                            )}
                        </button>
                    }
                />
                <Input
                    icon={<LockClosedIcon className="size-6" />}
                    id="new_password_repeat"
                    name="new_password_repeat"
                    type={hide3 ? 'password' : 'text'}
                    label="Repetir contraseña nueva"
                    placeholder="***********"
                    register={{
                        function: register,
                        errors: {
                            function: errors,
                            rules: {
                                required: 'Repita la nueva contraseña',
                                minLength: {
                                    value: 8,
                                    message: 'Mínimo 8 caracteres',
                                },
                            },
                        },
                    }}
                    element={
                        <button
                            type="button"
                            onClick={() => setHide3(!hide3)}
                        >
                            {hide3 ? (
                                <EyeIcon className="size-6" />
                            ) : (
                                <EyeSlashIcon className="size-6" />
                            )}
                        </button>
                    }
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
