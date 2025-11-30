import { createSlice } from '@reduxjs/toolkit';
import { setLoad } from './loader.slice';
import appError from '../../utils/appError';
import api from '../../api/axios';

const accountSlice = createSlice({
  name: 'account',
  initialState: {},
  reducers: {
    setAccount: (state, action) => action.payload,
  },
});

export const { setAccount } =
  accountSlice.actions;

export default accountSlice.reducer;

export const accountThunk =
  () => async (dispatch) => {
    dispatch(setLoad(false));
    const url = `/api/v1/auth/`;
    await api
      .get(url)
      .then((res) => dispatch(setAccount(res.data)))
      .catch((err) => appError(err))
      .finally(() => dispatch(setLoad(true)));
};
