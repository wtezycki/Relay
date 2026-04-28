import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
})

export function getApiErrorMessage(error, fallbackMessage) {
  const apiMessage = error?.response?.data?.message

  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage
  }

  return fallbackMessage
}

export default api
