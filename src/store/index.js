import { configureStore } from '@reduxjs/toolkit';
import darkMode from './slices/darkMode.slice';
import loader from './slices/loader.slice';
import account from './slices/account.slice';
import transactions from './slices/transactions.slice';

const store = configureStore({
  reducer: {
    transactions,
    account,
    darkMode,
    loader
  },
});

export default store;
