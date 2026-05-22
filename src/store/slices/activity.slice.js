import { createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';
import appError from '../../utils/appError';

const activitySlice = createSlice({
  name: 'activity',
  initialState: [],
  reducers: {
    setActivity: (_, action) => action.payload,
  },
});

export const { setActivity } = activitySlice.actions;
export default activitySlice.reducer;

export const activityThunk = () => async (dispatch) => {
  try {
    const res = await api.get('/api/v1/activity');
    dispatch(setActivity(res.data));
  } catch (err) {
    appError(err);
  }
};
