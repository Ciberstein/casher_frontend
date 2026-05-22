import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PreAuthNavbar } from '../shared/user/Navbar'
import {
  ArrowUpRightIcon, ArrowDownLeftIcon, BanknotesIcon,
  ShieldCheckIcon, CurrencyDollarIcon, QrCodeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

const FEATURES = [
  {
    icon: <ArrowUpRightIcon className="size-6" />,
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    title: 'Transferencias instantáneas',
    desc: 'Envía y solicita dinero a cualquier usuario de Casher en segundos, sin comisiones ocultas.',
  },
  {
    icon: <CurrencyDollarIcon className="size-6" />,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    title: 'Múltiples divisas',
    desc: 'Opera en pesos colombianos (COP) y dólares (USD) con tasas de cambio en tiempo real.',
  },
  {
    icon: <BanknotesIcon className="size-6" />,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    title: 'Préstamos y retiros',
    desc: 'Solicita préstamos y retira fondos a tu cuenta bancaria directamente desde la plataforma.',
  },
  {
    icon: <QrCodeIcon className="size-6" />,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    title: 'Comprobantes QR',
    desc: 'Cada transferencia genera un comprobante verificable con código QR, accesible desde cualquier dispositivo.',
  },
  {
    icon: <ArrowDownLeftIcon className="size-6" />,
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    title: 'Solicitudes de cobro',
    desc: 'Solicita pagos a otros usuarios y gestiona tus cobros pendientes desde un solo lugar.',
  },
  {
    icon: <ShieldCheckIcon className="size-6" />,
    color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    title: 'Seguro y confiable',
    desc: 'Autenticación segura con verificación en dos pasos y registro de toda tu actividad financiera.',
  },
];

const STATS = [
  { value: '100%', label: 'Transacciones verificadas' },
  { value: 'COP & USD', label: 'Divisas soportadas' },
  { value: '24/7', label: 'Disponibilidad' },
];

export const Landing = () => {
  const darkMode = useSelector((state) => state.darkMode);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-900 dark:text-white">
      <div className="sticky top-0 z-30">
        <PreAuthNavbar />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(/img/card-bg-1.svg)', backgroundSize: 'cover' }} />

        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-36 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
            <ShieldCheckIcon className="size-3.5" />
            Plataforma financiera segura
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Transfiere dinero
            <br />
            <span className="text-white/80">con total facilidad</span>
          </h1>

          <p className="text-white/75 text-lg md:text-xl max-w-xl">
            Envía, solicita y gestiona tu dinero en pesos y dólares. Rápido, seguro y sin complicaciones.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-600 font-semibold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Crear cuenta gratis
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/15 text-white font-semibold px-8 py-3.5 rounded-full border border-white/30 backdrop-blur-sm hover:bg-white/25 transition-all"
            >
              Ingresar
            </Link>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path
              d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z"
              fill={darkMode ? '#18181b' : '#f9fafb'}
            />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-3 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center gap-1">
              <span className="text-2xl md:text-3xl font-bold text-green-500">{s.value}</span>
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-12 w-full flex flex-col gap-10">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-lg mx-auto">
            Casher centraliza tu actividad financiera con herramientas pensadas para simplificar tu día a día.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`size-12 rounded-xl flex items-center justify-center ${f.color}`}>
                {f.icon}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-10 md:p-16 flex flex-col items-center text-center gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'url(/img/card-bg-1.svg)', backgroundSize: 'cover' }} />
          <h2 className="relative text-2xl md:text-4xl font-bold text-white">
            Empieza a usar Casher hoy
          </h2>
          <p className="relative text-white/75 max-w-sm text-sm md:text-base">
            Crea tu cuenta gratis en minutos y comienza a gestionar tu dinero de forma inteligente.
          </p>
          <Link
            to="/register"
            className="relative inline-flex items-center gap-2 bg-white text-green-600 font-semibold px-8 py-3.5 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            Registrarme ahora
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-zinc-800 mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img
            src={`/img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`}
            className="max-h-7 opacity-70"
          />
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Casher. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link to="/login" className="hover:text-green-500 transition-colors">Ingresar</Link>
            <Link to="/register" className="hover:text-green-500 transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
