import createCatalogHook from './createCatalogHook'

const useCatalog = createCatalogHook('/api/v1/currencies')

// Monedas permitidas (tabla currencies): [{ value: 'USD', label: 'USD', subtitle: 'Dólar estadounidense' }, ...]
const useCurrencyOptions = () => useCatalog().map(({ code, label }) => ({ value: code, label: code, subtitle: label }))

export default useCurrencyOptions
