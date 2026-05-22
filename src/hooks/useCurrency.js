import { useDispatch, useSelector } from 'react-redux';
import { setPreference } from '../store/slices/currency.slice';
import api from '../api/axios';

const useCurrency = () => {
  const { rate, preference } = useSelector((state) => state.currency);
  const dispatch = useDispatch();

  const convert = (amountCOP) => {
    if (preference === 'USD' && rate) return amountCOP / rate;
    return amountCOP;
  };

  const format = (amountCOP) => {
    const value = convert(amountCOP);
    return new Intl.NumberFormat(preference === 'USD' ? 'en-US' : 'es-CO', {
      style: 'currency',
      currency: preference,
      currencyDisplay: 'code',
    }).format(value);
  };

  const formatRef = (amountCOP) => {
    if (preference === 'USD') return null;
    if (!rate) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'code',
    }).format(amountCOP / rate);
  };

  const toggle = async () => {
    const next = preference === 'COP' ? 'USD' : 'COP';
    dispatch(setPreference(next));
    try {
      await api.patch('/api/v1/auth/update/currency', { currency: next });
    } catch (err) {
      dispatch(setPreference(preference));
    }
  };

  return { format, formatRef, toggle, preference, rate };
};

export default useCurrency;
