import { configureStore } from '@reduxjs/toolkit';
import darkMode from './slices/darkMode.slice';
import loader from './slices/loader.slice';
import account from './slices/account.slice';

const store = configureStore({
  reducer: {
    account,
    darkMode,
    loader
  },
});

export default store;
