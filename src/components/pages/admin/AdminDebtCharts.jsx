import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { ChevronDownIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { BarChart } from '@mui/x-charts/BarChart'
import { fmt } from './adminShared'

const TOKENS = ['ink', 'muted', 'faint', 'line', 'surface', 'sello', 'entrada', 'salida', 'espera']

// Los gráficos reciben colores concretos: se leen de los tokens del sistema de diseño
// y se vuelven a leer cuando cambia el modo oscuro.
const useTokenColors = () => {
  const darkMode = useSelector((state) => state.darkMode)
  const read = () => {
    const style = getComputedStyle(document.body)
    return Object.fromEntries(
      TOKENS.map((t) => [t, `rgb(${style.getPropertyValue(`--c-${t}`).trim().split(/\s+/).join(' ')})`])
    )
  }
  const [colors, setColors] = useState(read)

  useEffect(() => {
    setColors(read())
    const observer = new MutationObserver(() => setColors(read()))
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [darkMode])

  return colors
}

const daysSince = (date) => (date ? Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000)) : 0)

const AGING = [
  { label: '0-30 d', max: 30 },
  { label: '31-60 d', max: 60 },
  { label: '61-90 d', max: 90 },
  { label: '+90 d', max: Infinity },
]

const compact = (n) => new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

const ChartCard = ({ title, subtitle, className = '', children }) => (
  <section className={`bg-surface rounded-2xl border border-line p-5 min-w-0 ${className}`}>
    <p className="eyebrow !text-[0.625rem]">{title}</p>
    <p className="text-xs text-faint mt-0.5 mb-3">{subtitle}</p>
    {children}
  </section>
)

export const AdminDebtCharts = ({ debts }) => {
  const [open, setOpen] = useState(true)
  const [picked, setPicked] = useState(null)
  const darkMode = useSelector((state) => state.darkMode)
  const c = useTokenColors()

  const currencies = useMemo(
    () => [...new Set(debts.flatMap((d) => d.loans.map((l) => l.currency)))].sort(),
    [debts]
  )
  const currency = currencies.includes(picked) ? picked : currencies[0]

  const data = useMemo(() => {
    if (!currency) return null
    const loans = debts.flatMap((d) => d.loans).filter((l) => l.currency === currency)

    const capital = loans.reduce((s, l) => s + Number(l.amount), 0)
    const paid = loans.reduce((s, l) => s + Number(l.paid_amount), 0)
    const balance = loans.reduce((s, l) => s + Number(l.outstanding), 0)
    // Interés = lo que se debe en total (saldo + abonado) menos el capital; nunca negativo
    const interest = loans.reduce(
      (s, l) => s + Math.max(0, Number(l.outstanding) + Number(l.paid_amount) - Number(l.amount)), 0
    )

    const aging = AGING.map((b) => ({ name: b.label, value: 0 }))
    loans.forEach((l) => {
      const d = daysSince(l.accepted_at)
      aging[AGING.findIndex((b) => d <= b.max)].value += Number(l.outstanding)
    })

    return {
      composition: [
        { name: 'Prestado', value: capital },
        { name: 'Interés', value: interest },
        { name: 'Abonado', value: paid },
        { name: 'Saldo', value: balance },
      ],
      aging,
    }
  }, [debts, currency])

  // El tooltip de MUI se dibuja en un portal con su propio tema: se alinea con el modo oscuro
  const theme = useMemo(
    () => createTheme({ palette: { mode: darkMode ? 'dark' : 'light' }, typography: { fontFamily: 'inherit' } }),
    [darkMode]
  )

  const axisSx = {
    '& .MuiChartsAxis-tickLabel': { fill: c.muted },
    '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: c.line },
    '& .MuiChartsGrid-line': { stroke: c.line },
    '& .MuiBarElement-root': { cursor: 'default' },
  }

  const money = (v) => fmt(v ?? 0, currency)

  return (
    <div className="bg-surface rounded-2xl border border-line overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-sunken transition-colors"
      >
        <ChartBarIcon className="size-5 text-faint shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">Análisis de cartera</p>
          <p className="text-xs text-faint">Composición y antigüedad de la deuda</p>
        </div>
        <ChevronDownIcon className={`size-4 text-faint shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && data && (
        <ThemeProvider theme={theme}>
          <div className="border-t border-line bg-sunken p-4 sm:p-5 flex flex-col gap-4">
            {currencies.length > 1 && (
              <div className="flex gap-2" role="tablist" aria-label="Moneda">
                {currencies.map((cur) => (
                  <button
                    key={cur}
                    role="tab"
                    aria-selected={cur === currency}
                    onClick={() => setPicked(cur)}
                    className={`h-9 px-4 rounded-lg text-xs font-semibold border transition-colors
                      ${cur === currency ? 'bg-surface text-ink border-ink' : 'bg-surface text-muted border-line hover:text-ink'}`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Composición" subtitle={`Qué hay detrás de la deuda en ${currency}`}>
                <BarChart
                  height={260}
                  dataset={data.composition}
                  xAxis={[{
                    scaleType: 'band',
                    dataKey: 'name',
                    colorMap: {
                      type: 'ordinal',
                      values: data.composition.map((d) => d.name),
                      colors: [c.ink, c.sello, c.entrada, c.salida],
                    },
                  }]}
                  yAxis={[{ valueFormatter: compact, width: 48 }]}
                  series={[{ dataKey: 'value', valueFormatter: money }]}
                  hideLegend
                  borderRadius={4}
                  grid={{ horizontal: true }}
                  margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                  sx={axisSx}
                />
              </ChartCard>

              <ChartCard title="Antigüedad" subtitle="Saldo por días desde que se aceptó el préstamo">
                <BarChart
                  height={260}
                  dataset={data.aging}
                  xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
                  yAxis={[{ valueFormatter: compact, width: 48 }]}
                  series={[{ dataKey: 'value', valueFormatter: money }]}
                  colors={[c.salida]}
                  hideLegend
                  borderRadius={4}
                  grid={{ horizontal: true }}
                  margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                  sx={axisSx}
                />
              </ChartCard>
            </div>
          </div>
        </ThemeProvider>
      )}
    </div>
  )
}
