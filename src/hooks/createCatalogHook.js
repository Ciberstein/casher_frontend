import { useEffect, useState } from 'react'
import api from '../api/axios'

// Fábrica de hooks para catálogos que vienen del servidor (monedas, países...).
// La lista se pide una sola vez y se comparte entre todos los selectores de la app.
const createCatalogHook = (endpoint) => {
  let cache = null
  let pending = null

  const load = () => {
    if (cache) return Promise.resolve(cache)
    pending ??= api.get(endpoint)
      .then(res => (cache = res.data.map(item => ({ value: item.code, label: item.name, code: item.code }))))
      .catch(err => { pending = null; throw err })
    return pending
  }

  return () => {
    const [options, setOptions] = useState(cache ?? [])

    useEffect(() => {
      if (!cache) load().then(setOptions).catch(() => {})
    }, [])

    return options
  }
}

export default createCatalogHook
