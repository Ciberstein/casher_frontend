import { configureStore } from '@reduxjs/toolkit';
import darkMode from './slices/darkMode.slice';
import loader from './slices/loader.slice';
import account from './slices/account.slice';
import transactions from './slices/transactions.slice';
import currency from './slices/currency.slice';
import banks from './slices/banks.slice';
import activity from './slices/activity.slice';
import documentTypes from './slices/documentTypes.slice';

const store = configureStore({
  reducer: {
    transactions,
    account,
    darkMode,
    loader,
    currency,
    banks,
    activity,
    documentTypes,
  },
});

export default store;
