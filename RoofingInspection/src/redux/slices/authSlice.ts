import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../services/api'
import type { LoginRequest, UserProfile } from '../../services/api/types'

type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type AuthState = {
  token: string | null
  user: UserProfile | null
  status: AuthStatus
  error: string | null
}

const initialState: AuthState = {
  token: null,
  user: null,
  status: 'idle',
  error: null,
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: LoginRequest, { rejectWithValue }) => {
    const result = await api.login(payload)
    if (result.kind !== 'ok') {
      const message =
        result.kind === 'rejected' ? result.message : 'Login failed. Please try again.'
      return rejectWithValue(message)
    }
    return { token: result.token, user: result.user }
  },
)

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  return true
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
    },
    logout(state) {
      state.token = null
      state.user = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Login failed'
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null
        state.user = null
        state.status = 'idle'
        state.error = null
      })
  },
})

export const { clearAuthError, logout } = authSlice.actions
export default authSlice.reducer
