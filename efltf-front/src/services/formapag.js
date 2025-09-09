import { api } from '../boot/axios'

export const FormaPag = {
  async getFormaPag(id) {
    try {
      const resp = await api.get(`/formapag/id/${id}`)
      return resp.data
    } catch (err) {
      throw err
    }
  },

  async getFormasPagAll() {
    try {
      const resp = await api.get('/formapag')
      return resp.data
    } catch (err) {
      throw err
    }
  },

  async createFormaPag(data) {
    try {
      const resp = await api.post('/formapag', data)
      return resp.data
    } catch (err) {
      throw err
    }
  },

  async updateFormaPag(data) {
    try {
      return await api.patch(`/formapag/${data.id}`, data)
    } catch (err) {
      throw err
    }
  },

  async deleteFormaPag(id) {
    try {
      return await api.delete(`/formapag/${id}`)
    } catch (err) {
      throw err
    }
  }
}
