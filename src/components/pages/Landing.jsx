import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PreAuthNavbar } from '../shared/user/Navbar'
import { Mark } from '../shared/Mark'
import { LedgerRow, Stamp } from '../shared/Receipt'

/**
 * La portada no describe el producto: enseña lo que produce. Un comprobante
 * emitido, con su sello y su código, dice más que seis tarjetas de beneficios.
 */
const HeroReceipt = () => (
  <figure
    style={{ '--c-rule': '207 200 185', '--c-surface': '251 250 247', '--c-faint': '154 146 132' }}
    className="w-full max-w-[20rem] animate-feed-in animate-delay-2 rotate-[-1.5deg] rounded-t-2xl
      border border-black/[0.06] bg-[#FBFAF7] tear-b pb-5 text-[#17181B] shadow-2xl"
  >
    <div className="flex items-center justify-between px-6 pt-6">
      <img src="/img/logo.svg" alt="" className="max-h-4 opacity-90" />
      <span className="figure text-[0.625rem] text-[#9A9284]">REF 4F9C2AE1</span>
    </div>

    <p className="eyebrow !text-[#9A9284] px-6 pt-5">Comprobante de transferencia</p>

    <div className="flex items-end justify-between gap-4 px-6 pt-1">
      <p className="figure text-[1.75rem] font-semibold leading-tight tracking-tight">COP 320.000</p>
      <Stamp tone="entrada" className="mb-1">Verificado</Stamp>
    </div>

    <div className="perf mx-6 my-4" />

    <div className="px-6">
      <LedgerRow label="Emisor" value="@daniel" />
      <LedgerRow label="Destinatario" value="@valentina" />
      <LedgerRow label="Fecha" value="12/08/2026" />
      <LedgerRow label="Hora" value="14:38" />
    </div>

    <div className="perf mx-6 my-4" />

    <p className="figure break-all px-6 text-center text-[0.5625rem] leading-relaxed text-[#9A9284]">
      4f9c2ae1b70d3852c4419fe07ab6d1c3
    </p>
  </figure>
)

const CAPABILITIES = [
  {
    verb: 'Recibir',
    line: 'Te pagan a tu apodo.',
    detail: 'Comparte tu @apodo y recibe transferencias de cualquier usuario de Casher. Si te deben, envía una solicitud de cobro.',
  },
  {
    verb: 'Enviar',
    line: 'En pesos o en dólares.',
    detail: 'Guarda a tus destinatarios frecuentes y transfiere en segundos. Cada envío emite su comprobante.',
  },
  {
    verb: 'Retirar',
    line: 'A tu cuenta bancaria.',
    detail: 'Registra tus cuentas, pide el retiro y sigue el estado de la solicitud hasta que el dinero salga.',
  },
  {
    verb: 'Pedir',
    line: 'Préstamos con abonos.',
    detail: 'Solicita un préstamo, recíbelo en tu saldo y abona a la deuda cuando puedas, en la moneda que quieras.',
  },
]

export const Landing = () => {
  const darkMode = useSelector((state) => state.darkMode)

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="sticky top-0 z-30 border-b border-line">
        <PreAuthNavbar />
      </div>

      {/* Portada */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:gap-16 lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <p className="eyebrow animate-feed-in">Cuenta digital · COP y USD</p>

          <h1 className="animate-feed-in animate-delay-1 font-wide text-[2.6rem] font-bold leading-[1.03] tracking-tight sm:text-6xl">
            Envía plata.<br />
            <span className="text-muted">Queda el comprobante.</span>
          </h1>

          <p className="max-w-md text-base leading-relaxed text-muted animate-feed-in animate-delay-2">
            Casher mueve tu dinero entre personas en pesos y dólares. Por cada operación
            emite un recibo con código que cualquiera puede verificar, sin cuenta y desde
            cualquier dispositivo.
          </p>

          <div className="flex w-full animate-feed-in animate-delay-3 flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg bg-ink px-6 py-3 text-sm
                font-semibold font-semiwide text-reverse transition-colors hover:bg-ink/88"
            >
              Abrir cuenta
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg border border-line px-6 py-3
                text-sm font-semibold font-semiwide text-ink transition-colors hover:border-rule hover:bg-sunken"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroReceipt />
        </div>
      </section>

      {/* Qué se puede hacer */}
      <section className="mx-auto max-w-6xl px-6 pb-16 lg:pb-24">
        <h2 className="eyebrow border-b border-line pb-3">Qué puedes hacer con tu cuenta</h2>

        <div className="grid gap-x-12 gap-y-10 pt-10 sm:grid-cols-2">
          {CAPABILITIES.map(({ verb, line, detail }) => (
            <div key={verb} className="flex flex-col gap-2 border-t border-line pt-5">
              <div className="flex items-baseline gap-2.5">
                <Mark direction={verb === 'Recibir' || verb === 'Pedir' ? 'in' : 'out'} className="h-3.5 w-auto text-sello" />
                <h3 className="font-wide text-xl font-bold tracking-tight">{verb}</h3>
                <span className="text-lg text-muted">{line}</span>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Verificación: el argumento de la casa */}
      <section className="mx-auto max-w-6xl px-6 pb-16 lg:pb-24">
        <div className="grid items-center gap-10 rounded-2xl border border-line bg-surface p-8 lg:grid-cols-2 lg:p-12">
          <div className="flex flex-col gap-4">
            <p className="eyebrow">Verificación pública</p>
            <h2 className="font-wide text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              Cada transferencia<br />tiene su propia dirección.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted">
              Al confirmar un envío, Casher publica el comprobante en un enlace único.
              Quien lo abra ve el monto, las partes, la fecha y el sello de verificación.
              No necesita cuenta ni la app.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-lg border border-line bg-sunken px-4 py-3">
              <span className="size-2 shrink-0 rounded-full bg-entrada" />
              <span className="figure truncate text-[0.8125rem] text-ink">
                casher.app/tx/<span className="text-sello-ink">4f9c2ae1b70d3852</span>
              </span>
            </div>
            <div className="rounded-lg border border-dashed border-rule px-4 py-3">
              <LedgerRow label="Monto" value="COP 320.000" />
              <LedgerRow label="Estado" value="Verificado" tone="entrada" mono={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-t-2xl bg-ink px-8 pb-10 pt-12 text-reverse tear-b sm:px-12">
          <div className="pointer-events-none absolute inset-0 hatch opacity-30" aria-hidden="true" />
          <div className="relative flex flex-col items-start gap-5">
            <h2 className="font-wide max-w-lg text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Abre tu cuenta y emite tu primer comprobante.
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-reverse/65">
              Toma un par de minutos y no cuesta nada.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg bg-reverse px-6 py-3 text-sm
                font-semibold font-semiwide text-ink transition-opacity hover:opacity-90"
            >
              Abrir cuenta
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <img
            src={`/img/${darkMode ? 'logo_dark.svg' : 'logo.svg'}`}
            alt="Casher"
            className="max-h-6 opacity-60"
          />
          <p className="figure text-[0.625rem] text-faint">
            © {new Date().getFullYear()} Casher · Todos los derechos reservados
          </p>
          <div className="flex gap-5 text-xs text-muted">
            <Link to="/login" className="transition-colors hover:text-ink">Ingresar</Link>
            <Link to="/register" className="transition-colors hover:text-ink">Abrir cuenta</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
