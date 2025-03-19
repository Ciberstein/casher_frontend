import { createSlice } from '@reduxjs/toolkit';

const loaderSlice = createSlice({
  name: 'loader',
  initialState: true,
  reducers: {
    setLoad: (state, action) => action.payload,
  },
});

export const { setLoad } = loaderSlice.actions;

export default loaderSlice.reducer;
