import { useEffect } from 'react'
import useCurrency from './useCurrency'

/**
 * En los formularios con selector de moneda, deja seleccionada por defecto la moneda
 * predeterminada del usuario cada vez que se abre el formulario (y si esta cambia).
 * Uso: useDefaultCurrencyField(open, setValue) justo después de useForm().
 */
const useDefaultCurrencyField = (open, setValue) => {
  const { preference } = useCurrency()

  useEffect(() => {
    if (open) setValue('currency', preference, { shouldValidate: true })
  }, [open, preference])

  return preference
}

export default useDefaultCurrencyField
