import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../types'

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: null,
}

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      localStorage.setItem('accessToken', action.payload.accessToken)
      localStorage.setItem('refreshToken', action.payload.refreshToken)
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
  },
})

export const authReducer = slice.reducer
export const authActions = slice.actions

