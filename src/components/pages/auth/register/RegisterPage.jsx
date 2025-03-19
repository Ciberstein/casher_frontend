import React from 'react'
import { PreAuthLayout } from '../../../layouts/PreAuthLayout'
import { RegisterForm } from './partials/RegisterForm'

export const RegisterPage = () => {
  return (
    <PreAuthLayout>
      <RegisterForm />
    </PreAuthLayout>
  )
}
