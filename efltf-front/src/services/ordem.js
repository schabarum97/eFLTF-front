import { api } from '../boot/axios'

export const Ordem = {

  async getOrdem(id) {
    try {
      const ordem = await api.get(`/ordem/id/${id}`)
      return ordem.data
    } catch (err) {
      throw err
    }
  },

  async getOrdensAll() {
    try {
      const ordens = await api.get('/ordem')
      return ordens.data
    } catch (err) {
      throw err
    }
  },

  async createOrdem(data) {
    try {
      const ret = await api.post('/ordem', data)
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async updateOrdem(data) {
    try {
      console.log('updateOrdem', data)
      return (await api.patch(`/ordem/${data.id}`, data)).data
    } catch (err) {
      throw err
    }
  },

  async deleteOrdem(id) {
    try {
      return (await api.delete(`/ordem/${id}`)).data
    } catch (err) {
      throw err
    }
  }
}
