import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import api from '../../../../../api/axios'
import appError from '../../../../../utils/appError'
import useCountryOptions from '../../../../../hooks/useCountryOptions'
import useCurrencyOptions from '../../../../../hooks/useCurrencyOptions'
import { setLoad } from '../../../../../store/slices/loader.slice'
import { accountThunk } from '../../../../../store/slices/account.slice'
import { Button } from '../../../../elements/user/Button'
import { ComboSelect } from '../../../../elements/user/ComboSelect'

export const UpdateRegionForm = () => {
  const COUNTRY_OPTIONS = useCountryOptions()
  const CURRENCY_OPTIONS = useCurrencyOptions()
  const account = useSelector(state => state.account)
  const dispatch = useDispatch()
  const [country, setCountry] = useState(account.country ?? 'CO')
  const [currency, setCurrency] = useState(account.currency ?? 'COP')

  useEffect(() => { if (account.country) setCountry(account.country) }, [account.country])
  useEffect(() => { if (account.currency) setCurrency(account.currency) }, [account.currency])

  const unchanged = country === (account.country ?? 'CO') && currency === (account.currency ?? 'COP')

  const submit = async (e) => {
    e.preventDefault()
    dispatch(setLoad(false))
    try {
      const res = await api.patch('/api/v1/auth/update/region', { country, currency })
      dispatch(accountThunk())
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'success', text: res.data.message, showConfirmButton: false, timer: 5000, timerProgressBar: true })
    } catch (err) {
      appError(err)
      Swal.fire({ toast: true, position: 'bottom-right', icon: 'error', text: err.response?.data?.message, showConfirmButton: false, timer: 5000, timerProgressBar: true })
    } finally { dispatch(setLoad(true)) }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={submit}>
      <div>
        <h2 className="text-base font-semibold text-ink">Región y moneda</h2>
        <p className="text-sm text-muted mt-0.5">
          Tu país y la moneda con la que se muestran tus saldos y movimientos. Tus saldos en cada moneda no cambian.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ComboSelect label="País" options={COUNTRY_OPTIONS} value={country}
          onChange={setCountry} searchable={false} />
        <ComboSelect label="Moneda por defecto" options={CURRENCY_OPTIONS} value={currency}
          onChange={setCurrency} searchable={false} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" color="green" disabled={unchanged}>
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
