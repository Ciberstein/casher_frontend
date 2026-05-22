import { createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';
import appError from '../../utils/appError';

const documentTypesSlice = createSlice({
  name: 'documentTypes',
  initialState: [],
  reducers: {
    setDocumentTypes: (_, action) => action.payload,
  },
});

export const { setDocumentTypes } = documentTypesSlice.actions;
export default documentTypesSlice.reducer;

export const documentTypesThunk = (country = 'CO') => async (dispatch) => {
  try {
    const res = await api.get(`/api/v1/document-types?country=${country}`);
    dispatch(setDocumentTypes(res.data));
  } catch (err) {
    appError(err);
  }
};
