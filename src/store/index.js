import { configureStore } from '@reduxjs/toolkit';
import darkMode from './slices/darkMode.slice';
import loader from './slices/loader.slice';

const store = configureStore({
  reducer: {
    darkMode,
    loader
  },
});

export default store;
