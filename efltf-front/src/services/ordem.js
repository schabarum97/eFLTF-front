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
      console.log(ordens.data) // DEBUG
      return ordens.data
    } catch (err) {
      throw err
    }
  },

  async createOrdem(data) {
    try {
      const ret = await api.post('/ordem', data)
      console.log(ret.data) // DEBUG
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async updateOrdem(data) {
    try {
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
