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
      className="relative size-9 rounded-xl flex items-center justify-center
        text-slate-500 dark:text-slate-400
        hover:bg-slate-100 dark:hover:bg-neutral-800
        hover:text-slate-700 dark:hover:text-white
        transition-all duration-150"
      aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      <SunIcon className={`size-5 absolute transition-all duration-200 ${darkMode ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`} />
      <MoonIcon className={`size-5 absolute transition-all duration-200 ${darkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`} />
    </button>
  )
}
