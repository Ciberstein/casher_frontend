import { useDispatch, useSelector } from 'react-redux'
import { setDarkMode } from '../store/slices/darkMode.slice'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'

export const SwitchDakMode = () => {
  const darkMode = useSelector((state) => state.darkMode)
  const dispatch = useDispatch()

  const toggle = () => {
    dispatch(setDarkMode(!darkMode))
    localStorage.setItem('darkMode', !darkMode)
  }

  return (
    <button
      onClick={toggle}
      className="relative size-9 rounded-lg flex items-center justify-center text-muted
        hover:text-ink hover:bg-sunken transition-colors duration-150"
      aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      <SunIcon className={`size-[1.15rem] absolute transition-all duration-200 ${darkMode ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`} />
      <MoonIcon className={`size-[1.15rem] absolute transition-all duration-200 ${darkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
    </button>
  )
}
