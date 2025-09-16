import { api } from '../boot/axios'

function base64Utf8 (str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach(b => { bin += String.fromCharCode(b) })
  return btoa(bin)
}

export const Auth = {
  async login ({ email, senha }) {
    const token = base64Utf8(`${email}:${senha}`)
    const resp = await api.post('/login', null, {
      headers: { Authorization: `Basic ${token}` }
    })
    return resp.data
  },
  async logout () {
    return api.post('/logout', null, {
      validateStatus: s => s === 204 || s === 401
    })
  }
}