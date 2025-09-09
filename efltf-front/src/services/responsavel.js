import { api } from '../boot/axios'

export const Responsavel = {
  async getResponsavel (id) {
    try {
      const resp = await api.get(`/responsavel/id/${id}`)
      return resp.data
    } catch (err) {
      throw err
    }
  },

  async getResponsaveisAll () {
    try {
      const resp = await api.get('/responsavel')
      return resp.data
    } catch (err) {
      throw err
    }
  },

  async createResponsavel (data) {
    try {
      const resp = await api.post('/responsavel', data)
      return resp.data
    } catch (err) {
      throw err
    }
  },

  async updateResponsavel (data) {
    try {
      return await api.patch(`/responsavel/${data.id}`, data)
    } catch (err) {
      throw err
    }
  },

  async deleteResponsavel (id) {
    try {
      return await api.delete(`/responsavel/${id}`)
    } catch (err) {
      throw err
    }
  }
}
