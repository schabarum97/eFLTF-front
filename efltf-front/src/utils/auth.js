import { api } from 'src/boot/axios'

export async function isLoggedIn() {
  const res = await api.get('/auth/ping', {
    // não tratar 401 como erro do axios
    validateStatus: s => s === 200 || s === 204 || s === 401
  })
  return res.status === 200 || res.status === 204
}
