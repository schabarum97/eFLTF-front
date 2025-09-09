import { api } from '../boot/axios'

export const Uf = {
  async getUf(id) {
    try {
      const uf = await api.get(`/uf/id/${id}`)
      return uf.data
    } catch (err) {
      throw err
    }
  },

  async getUfs() {
    try {
      const ufs = await api.get('/uf')
      return ufs.data
    } catch (err) {
      throw err
    }
  },

  async createUf(data) {
    try {
      const ret = await api.post('/uf', data)
      console.log(ret.data)
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async updateUf(data) {
    try {
      return await api.patch(`/uf/${data.id}`, data)
    } catch (err) {
      throw err
    }
  },

  async deleteUf(id) {
    try {
      return await api.delete(`/uf/${id}`)
    } catch (err) {
      throw err
    }
  }
}
