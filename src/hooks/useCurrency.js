import { useDispatch, useSelector } from 'react-redux';
import { setPreference } from '../store/slices/currency.slice';
import api from '../api/axios';

const useCurrency = () => {
  const { preference } = useSelector((state) => state.currency);
  const dispatch = useDispatch();

  const format = (amount, currency) => new Intl.NumberFormat(
    currency === 'USD' ? 'en-US' : 'es-CO',
    { style: 'currency', currency, currencyDisplay: 'code', maximumFractionDigits: 2 }
  ).format(amount);

  const toggle = async () => {
    const next = preference === 'COP' ? 'USD' : 'COP';
    dispatch(setPreference(next));
    try {
      await api.patch('/api/v1/auth/update/currency', { currency: next });
    } catch (err) {
      dispatch(setPreference(preference));
    }
  };

  return { format, toggle, preference };
};

export default useCurrency;
