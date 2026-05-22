import { createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    rate: null,
    preference: 'COP',
  },
  reducers: {
    setRate: (state, action) => { state.rate = action.payload; },
    setPreference: (state, action) => { state.preference = action.payload; },
  },
});

export const { setRate, setPreference } = currencySlice.actions;

export default currencySlice.reducer;

export const currencyThunk = () => async (dispatch) => {
  try {
    const res = await api.get('/api/v1/exchange');
    dispatch(setRate(res.data.rate));
  } catch (err) {
    console.error('Failed to fetch exchange rate', err);
  }
};
