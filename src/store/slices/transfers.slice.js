import { createSlice } from '@reduxjs/toolkit';
import { setLoad } from './loader.slice';
import appError from '../../utils/appError';
import api from '../../api/axios';

const transferSlice = createSlice({
  name: 'transfers',
  initialState: [],
  reducers: {
    setTransfers: (state, action) => action.payload,
  },
});

export const { setTransfers } = transferSlice.actions;

export default transferSlice.reducer;

export const transfersThunk =
    () => async (dispatch) => {
        dispatch(setLoad(false));
        const url = `/api/v1/transfers/`;
        await api
            .get(url)
            .then((res) => dispatch(setTransfers(res.data)))
            .catch((err) => appError(err))
            .finally(() => dispatch(setLoad(true)));
};
