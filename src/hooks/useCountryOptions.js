import createCatalogHook from './createCatalogHook'

// Países permitidos (tabla countries): [{ value: 'CO', label: 'Colombia' }, ...]
const useCountryOptions = createCatalogHook('/api/v1/countries')

export default useCountryOptions
