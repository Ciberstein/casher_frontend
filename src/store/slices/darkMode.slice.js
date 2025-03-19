import { createSlice } from '@reduxjs/toolkit';

const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState: null,
  reducers: {
    setDarkMode: (state, action) =>
      action.payload,
  },
});

export const { setDarkMode } =
  darkModeSlice.actions;

export default darkModeSlice.reducer;

const handleDarkMode = (status) => {
  status
    ? document.body.classList.add('dark')
    : document.body.classList.remove('dark');
};

export const darkModeThunk = () => (dispatch) => {
  const localDarkMode =
    localStorage.getItem('darkMode');

  if (localDarkMode) {
    const boolValue = localDarkMode === 'true';
    dispatch(setDarkMode(boolValue));
    handleDarkMode(boolValue);
  } else {
    localStorage.setItem('darkMode', true);
  }
};
