import { api } from '../boot/axios'

export const Veiculo = {
  async getVeiculo (id) {
    try {
      const resp = await api.get(`/veiculo/id/${id}`)
      return resp.data
    } catch (err) {
      throw err
    }
  },

  async getVeiculosAll () {
    try {
      const resp = await api.get('/veiculo')
      return resp.data
    } catch (err) {
      throw err
    }
  },

  async createVeiculo (data) {
    try {
      const resp = await api.post('/veiculo', data)
      return resp.data
    } catch (err) {
      throw err
    }
  },

  async updateVeiculo (data) {
    try {
      return (await api.patch(`/veiculo/${data.id}`, data)).data
    } catch (err) {
      throw err
    }
  },

  async deleteVeiculo (id) {
    try {
      return (await api.delete(`/veiculo/${id}`)).data
    } catch (err) {
      throw err
    }
  }
}
