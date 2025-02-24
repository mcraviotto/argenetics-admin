import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { authApi } from './services/auth'
import { doctorsApi } from './services/doctors'
import { studiesApi } from './services/studies'
import { s3Api } from './services/s3'
import { notificationsApi } from './services/notifications'
import { institutionsApi } from './services/institutions'
import { patientsApi } from './services/patients'

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [authApi.reducerPath]: authApi.reducer,
    [doctorsApi.reducerPath]: doctorsApi.reducer,
    [studiesApi.reducerPath]: studiesApi.reducer,
    [s3Api.reducerPath]: s3Api.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [institutionsApi.reducerPath]: institutionsApi.reducer,
    [patientsApi.reducerPath]: patientsApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      doctorsApi.middleware,
      studiesApi.middleware,
      s3Api.middleware,
      notificationsApi.middleware,
      institutionsApi.middleware,
      patientsApi.middleware,
    ),
})

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)