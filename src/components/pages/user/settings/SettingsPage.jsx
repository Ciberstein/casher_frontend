import { useState } from 'react'
import { UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { GeneralSection } from './partials/GeneralSection'
import { SecuritySection } from './partials/SecuritySection'

const NAV_ITEMS = [
  { id: 1, label: 'General', icon: UserCircleIcon, description: 'Perfil y datos personales' },
  { id: 2, label: 'Seguridad', icon: ShieldCheckIcon, description: 'Contraseña y acceso' },
]

export const SettingsPage = () => {
  const [section, setSection] = useState(1)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-wide text-2xl font-bold tracking-tight text-ink">Configuración</h1>
        <p className="text-sm text-muted mt-1">Gestiona tu cuenta y preferencias</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">
        <nav className="flex flex-row lg:flex-col gap-1 lg:w-52 shrink-0">
          {NAV_ITEMS.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all w-full
                ${section === id
                  ? 'bg-ink text-reverse shadow-sm'
                  : 'text-muted hover:bg-sunken hover:text-ink'
                }`}
            >
              <Icon className="size-5 shrink-0" />
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-sm font-medium leading-tight">{label}</span>
                <span className={`text-xs hidden lg:block truncate mt-0.5 ${section === id ? 'text-white/70' : 'text-faint'}`}>
                  {description}
                </span>
              </div>
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {section === 1 && <GeneralSection />}
          {section === 2 && <SecuritySection />}
        </div>
      </div>
    </div>
  )
}
