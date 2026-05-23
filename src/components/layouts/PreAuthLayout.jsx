import { Navbar } from '../shared/user/Navbar'
import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../../context/AuthContext'

export const PreAuthLayout = ({ children }) => {
  const { auth } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (auth) navigate('/')
  }, [auth])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8 dark:text-white">
        {children}
      </div>
    </div>
  )
}
