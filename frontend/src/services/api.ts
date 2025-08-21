import axios from 'axios'
import { store } from '../store'
import { authActions } from '../store/authSlice'

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const api = axios.create({
  baseURL,
  withCredentials: false,
})

let isRefreshing = false
let failedQueue: {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}[] = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (token) p.resolve(token)
    else p.reject(error)
  })
  failedQueue = []
}

api.interceptors.request.use((config) => {
  const state = store.getState()
  const token = state.auth.accessToken
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token
              resolve(api(originalRequest))
            },
            reject,
          })
        })
      }
      originalRequest._retry = true
      isRefreshing = true
      try {
        const refreshToken = store.getState().auth.refreshToken
        if (!refreshToken) throw new Error('No refresh token')
        const resp = await axios.post(`${baseURL}/auth/refresh`, { refresh_token: refreshToken })
        const { access_token, refresh_token } = resp.data
        store.dispatch(authActions.setTokens({ accessToken: access_token, refreshToken: refresh_token }))
        processQueue(null, access_token)
        originalRequest.headers['Authorization'] = 'Bearer ' + access_token
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        store.dispatch(authActions.logout())
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

