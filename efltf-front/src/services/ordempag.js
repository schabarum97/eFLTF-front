import { api } from '../boot/axios'

export const OrdemPag = {
  async getOrdPag(id) {
    try {
      const resp = await api.get(`/ordempag/id/${id}`)
      return resp.data
    } catch (err) {
      throw err
    }
  },

  async getOrdPagsAll() {
    try {
      const resp = await api.get('/ordempag')
      return resp.data
    } catch (err) {
      throw err
    }
  },

  async createOrdPag(data) {
    try {
      const resp = await api.post('/ordempag', data)
      return resp.data
    } catch (err) {
      throw err
    }
  },

  async updateOrdPag(data) {
    try {
      return await api.patch(`/ordempag/${data.id}`, data)
    } catch (err) {
      throw err
    }
  },

  async deleteOrdPag(id) {
    try {
      return await api.delete(`/ordempag/${id}`)
    } catch (err) {
      throw err
    }
  }
}
