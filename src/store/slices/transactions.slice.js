import { createSlice } from '@reduxjs/toolkit';
import { setLoad } from './loader.slice';
import appError from '../../utils/appError';
import api from '../../api/axios';

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: [],
  reducers: {
    setTransactions: (state, action) => action.payload,
  },
});

export const { setTransactions } =
transactionSlice.actions;

export default transactionSlice.reducer;

export const transactionsThunk =
    () => async (dispatch) => {
        dispatch(setLoad(false));
        const url = `/api/v1/transactions/`;
        await api
            .get(url)
            .then((res) => dispatch(setTransactions(res.data)))
            .catch((err) => appError(err))
            .finally(() => dispatch(setLoad(true)));
};
