import { api } from '../boot/axios'

export const TipoLocal = {
  async getTipoLocal(id) {
    try {
      const ret = await api.get(`/tipolocal/id/${id}`)
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async getTiposLocalAll() {
    try {
      const ret = await api.get('/tipolocal')
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async getTiposLocalAtivos() {
    try {
      const ret = await api.get('/tipolocal/ativos')
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async createTipoLocal(data) {
    try {
      const ret = await api.post('/tipolocal', data)
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async updateTipoLocal(data) {
    try {
      const ret = await api.patch(`/tipolocal/${data.id}`, data)
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async deleteTipoLocal(id) {
    try {
      return await api.delete(`/tipolocal/${id}`)
    } catch (err) {
      throw err
    }
  }
}
