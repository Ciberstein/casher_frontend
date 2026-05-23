import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useContext, useEffect } from 'react'
import AuthContext from '../../context/AuthContext'
import { SwitchDakMode } from '../SwitchDakMode'
import {
  ArrowUpRightIcon, ArrowDownLeftIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const PERKS = [
  { icon: <ArrowUpRightIcon className="size-4" />, text: 'Transferencias instantáneas en COP y USD' },
  { icon: <ArrowDownLeftIcon className="size-4" />, text: 'Solicita cobros y gestiona préstamos' },
  { icon: <ShieldCheckIcon className="size-4" />, text: 'Verificación segura en cada operación' },
];

const BrandPanel = ({ darkMode }) => (
  <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-green-500 to-emerald-700 relative overflow-hidden">
    <div
      className="absolute inset-0 opacity-10"
      style={{ backgroundImage: 'url(/img/card-bg-1.svg)', backgroundSize: 'cover' }}
    />

    <Link to="/" className="relative z-10">
      <img src="/img/logo_dark.svg" className="max-h-8" />
    </Link>

    <div className="relative z-10 flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-3xl font-bold text-white leading-snug">
          Tu plataforma<br />financiera digital
        </h2>
        <p className="text-white/70 text-sm leading-relaxed max-w-xs">
          Gestiona tu dinero de forma simple, rápida y segura desde cualquier dispositivo.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {PERKS.map((p) => (
          <li key={p.text} className="flex items-center gap-3 text-white/90 text-sm">
            <div className="size-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              {p.icon}
            </div>
            {p.text}
          </li>
        ))}
      </ul>

      {/* Mini card mockup */}
      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 flex flex-col gap-4 border border-white/20">
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-xs font-medium">Saldo disponible</span>
          <div className="size-2 rounded-full bg-green-300 animate-pulse" />
        </div>
        <span className="text-white text-2xl font-bold">$ 4.250.000</span>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/10 rounded-xl py-2 text-center text-white/80 text-xs font-medium">Enviar</div>
          <div className="flex-1 bg-white/10 rounded-xl py-2 text-center text-white/80 text-xs font-medium">Solicitar</div>
          <div className="flex-1 bg-white/10 rounded-xl py-2 text-center text-white/80 text-xs font-medium">Retirar</div>
        </div>
      </div>
    </div>

    <p className="relative z-10 text-white/40 text-xs">
      © {new Date().getFullYear()} Casher. Todos los derechos reservados.
    </p>
  </div>
);

export const AuthSplitLayout = ({ children, title, subtitle, footerText, footerLink, footerLinkText }) => {
  const darkMode = useSelector((state) => state.darkMode);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) navigate('/');
  }, [auth]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-neutral-950">
      <BrandPanel darkMode={darkMode} />

      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <Link to="/" className="lg:hidden">
            <img src={`/img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} className="max-h-7" />
          </Link>
          <SwitchDakMode />
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-12 md:px-20 lg:px-16 xl:px-24">
          <div className="w-full max-w-md mx-auto flex flex-col gap-7">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
              {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>

        {footerText && (
          <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {footerText}{' '}
            <Link to={footerLink} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              {footerLinkText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
