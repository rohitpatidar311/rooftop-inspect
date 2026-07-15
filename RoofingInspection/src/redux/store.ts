import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import visitReducer from './slices/visitSlice'
import { visitPersistMiddleware } from './visitPersistMiddleware'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    visit: visitReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(visitPersistMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
