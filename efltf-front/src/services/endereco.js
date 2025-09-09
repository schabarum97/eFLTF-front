import { api } from '../boot/axios'

export const Endereco = {
  async getEndereco(id) {
    try {
      const endereco = await api.get(`/endereco/id/${id}`)
      return endereco.data
    } catch (err) {
      throw err
    }
  },

  async getEnderecosAll() {
    try {
      const enderecos = await api.get('/endereco')
      return enderecos.data
    } catch (err) {
      throw err
    }
  },

  async createEndereco(data) {
    try {
      const ret = await api.post('/endereco', data)
      console.log(ret.data)
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async updateEndereco(data) {
    try {
      return await api.patch(`/endereco/${data.id}`, data)
    } catch (err) {
      throw err
    }
  },

  async deleteEndereco(id) {
    try {
      return await api.delete(`/endereco/${id}`)
    } catch (err) {
      throw err
    }
  }
}
