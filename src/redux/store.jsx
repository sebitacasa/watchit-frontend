// store.js
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducer'; // puede ser una combinación de slices

const store = configureStore({
  reducer: rootReducer,
  // middleware y devtools ya vienen configurados automáticamente
});

export default store;
