import { api } from '../boot/axios'

export const Whatsapp = {
  async start () {
    const resp = await api.post('/start')
    return resp.data
  },

  async status () {
    const resp = await api.get('/status')
    return resp.data
  },

  async disconnect (hard = false) {
    const resp = await api.post(`/disconnect${hard ? '?hard=true' : ''}`)
    return resp.data
  },

  async setAutoReconnect (enabled = true) {
    const resp = await api.post(`/reconnect?enabled=${enabled ? 'true' : 'false'}`)
    return resp.data
  },

  connectEvents (onEvent) {
    const es = new EventSource(`${api.defaults.baseURL}/events`, { withCredentials: true })

    es.addEventListener('status', ev => {
      const payload = JSON.parse(ev.data)
      onEvent?.('status', payload)
    })

    es.addEventListener('qr', ev => {
      const payload = JSON.parse(ev.data)
      onEvent?.('qr', payload)
    })

    es.onerror = () => {
      try { es.close() } catch (_) {}
      setTimeout(() => this.connectEvents(onEvent), 2000)
    }

    return es
  }
}
