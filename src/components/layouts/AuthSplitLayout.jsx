import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useContext, useEffect } from 'react'
import AuthContext from '../../context/AuthContext'
import { SwitchDakMode } from '../SwitchDakMode'
import { LedgerRow, Stamp } from '../shared/Receipt'

/**
 * El panel de marca no explica el producto: lo muestra. Un comprobante
 * recién emitido, con su sello y su código, es todo el argumento.
 */
const SpecimenReceipt = () => (
  <figure
    /* El espécimen es papel de verdad: fija sus propios tokens para que no
       lo alcance el modo oscuro de la página. */
    style={{ '--c-rule': '207 200 185', '--c-surface': '251 250 247', '--c-faint': '154 146 132' }}
    className="w-full max-w-[19rem] rotate-[-1.25deg] rounded-t-2xl border border-white/10 bg-[#FBFAF7] tear-b pb-5 text-[#17181B] shadow-2xl"
  >
    <div className="flex items-center justify-between px-5 pt-5">
      <img src="/img/logo.svg" alt="" className="max-h-4 opacity-90" />
      <span className="figure text-[0.625rem] text-[#9A9284]">N.º 00418</span>
    </div>

    <p className="eyebrow !text-[#9A9284] px-5 pt-4">Comprobante de transferencia</p>

    <div className="px-5 pt-1">
      <p className="figure text-[1.75rem] font-semibold leading-tight tracking-tight">
        COP 320.000
      </p>
    </div>

    <div className="perf mx-5 my-3.5" />

    <div className="px-5">
      <LedgerRow label="Para" value="@valentina" />
      <LedgerRow label="Fecha" value="12 ago 2026" />
      <LedgerRow label="Estado" value="Completada" tone="entrada" mono={false} />
    </div>

    <div className="flex items-center justify-between gap-3 px-5 pt-3">
      <span className="figure text-[0.5625rem] leading-relaxed text-[#9A9284] break-all">
        4f9c2ae1b70d38
      </span>
      <Stamp tone="entrada">Verificado</Stamp>
    </div>
  </figure>
)

const BrandPanel = () => (
  <div className="relative hidden lg:flex flex-col justify-between gap-10 overflow-hidden bg-[#14161A] p-10 text-[#EDEAE3]">
    {/* Trama del papel de seguridad, apenas perceptible */}
    <div className="pointer-events-none absolute inset-0 hatch opacity-[0.35]" />

    <Link to="/" className="relative z-10 w-fit">
      <img src="/img/logo_dark.svg" alt="Casher" className="max-h-7" />
    </Link>

    <div className="relative z-10 flex flex-col gap-9">
      <div className="flex flex-col gap-3">
        <p className="eyebrow !text-[#E8862B]">Cuenta digital</p>
        <h2 className="font-wide text-[2.6rem] font-bold leading-[1.05] tracking-tight">
          Todo movimiento<br />deja comprobante.
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-[#9AA1AC]">
          Envía, cobra y retira en pesos y dólares. Cada operación emite un recibo
          con código verificable que cualquiera puede consultar.
        </p>
      </div>

      <SpecimenReceipt />
    </div>

    <p className="figure relative z-10 text-[0.625rem] text-[#6E7681]">
      © {new Date().getFullYear()} Casher
    </p>
  </div>
)

export const AuthSplitLayout = ({ children, title, subtitle, footerText, footerLink, footerLinkText }) => {
  const darkMode = useSelector((state) => state.darkMode)
  const { auth } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (auth) navigate('/')
  }, [auth])

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] bg-canvas text-ink">
      <BrandPanel />

      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <Link to="/" className="lg:hidden">
            <img src={`/img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`} alt="Casher" className="max-h-6" />
          </Link>
          <SwitchDakMode />
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-12 md:px-20 lg:px-16 xl:px-24">
          <div className="w-full max-w-md mx-auto flex flex-col gap-7">
            <div className="flex flex-col gap-2">
              <h1 className="font-wide text-[1.75rem] font-bold leading-tight tracking-tight text-ink">
                {title}
              </h1>
              {subtitle && <p className="text-sm leading-relaxed text-muted">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>

        {footerText && (
          <div className="px-6 pb-8 pt-2 text-center text-sm text-muted">
            {footerText}{' '}
            <Link
              to={footerLink}
              className="font-medium text-sello-ink underline decoration-sello/40 underline-offset-4 hover:decoration-sello"
            >
              {footerLinkText}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
