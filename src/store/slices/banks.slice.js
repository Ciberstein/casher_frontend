import { createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

const banksSlice = createSlice({
  name: 'banks',
  initialState: [],
  reducers: {
    setBanks: (_, action) => action.payload,
  },
});

export const { setBanks } = banksSlice.actions;

export const banksThunk = (country = 'CO') => async (dispatch) => {
  try {
    const res = await api.get(`/api/v1/banks?country=${country}`);
    dispatch(setBanks(res.data));
  } catch {}
};

export default banksSlice.reducer;
