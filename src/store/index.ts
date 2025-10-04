import { configureStore } from '@reduxjs/toolkit';
import receiptReducer from './receiptSlice';

export const store = configureStore({
  reducer: {
    receipt: receiptReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['receipt/extractData/pending', 'receipt/extractData/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.file'],
        // Ignore these paths in the state
        ignoredPaths: ['receipt.uploadedFile'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;