import React from 'react'
import { PreAuthLayout } from '../../../layouts/PreAuthLayout'
import { LoginForm } from './partials/LoginForm'

export const LoginPage = () => {
  return (
    <PreAuthLayout>
      <LoginForm />
    </PreAuthLayout>
  )
}
